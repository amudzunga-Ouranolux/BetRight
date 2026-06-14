using System.Text.Json;
using BetRight.Bff;
using BetRight.Bff.Caching;
using BetRight.Bff.Clients;
using BetRight.Bff.Contracts;
using BetRight.Bff.Data;
using BetRight.Bff.Mapping;

var builder = WebApplication.CreateBuilder(args);

// camelCase JSON out, case-insensitive in — so payloads match the app's Zod models.
builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    o.SerializerOptions.PropertyNameCaseInsensitive = true;
});

// Distributed cache: Redis when configured, else in-memory (same IDistributedCache API).
var redis = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrWhiteSpace(redis))
    builder.Services.AddStackExchangeRedisCache(o => o.Configuration = redis);
else
    builder.Services.AddDistributedMemoryCache();
builder.Services.AddSingleton<ResponseCache>();

// User-domain data layer (Dapper). Alembic owns the schema; we only read/write rows.
Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
builder.Services.AddSingleton<Db>();
builder.Services.AddScoped<UserRepo>();
builder.Services.AddScoped<FavouritesRepo>();
builder.Services.AddScoped<SavedPredictionsRepo>();
builder.Services.AddScoped<NotificationsRepo>();
builder.Services.AddScoped<AuditRepo>();

var mlBaseUrl = builder.Configuration["Ml:BaseUrl"] ?? "http://localhost:8001";
builder.Services.AddHttpClient<MlClient>(c => c.BaseAddress = new Uri(mlBaseUrl));

var app = builder.Build();

var camelJson = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
var caseInsensitive = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
var shortTtl = TimeSpan.FromSeconds(30);

static Envelope<T> Ok<T>(T data, string cacheStatus = "miss") => new(
    data,
    new ApiMeta(Guid.NewGuid().ToString("N"), DateTime.UtcNow.ToString("o"), cacheStatus),
    []);

static Envelope<object?> Fail(string code, string message) => new(
    null,
    new ApiMeta(Guid.NewGuid().ToString("N"), DateTime.UtcNow.ToString("o"), "miss"),
    [new ApiError(code, message)]);

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// ---------------------------------------------------------------- Home / Matches
app.MapGet("/v1/mobile/home", async (HttpContext ctx, MlClient ml, ResponseCache cache, UserRepo users, Db db) =>
{
    var (preds, hit) = await cache.GetOrSet("upcoming", shortTtl, () => ml.UpcomingAsync(50));
    if (preds.Count == 0)
        return Results.Json(Fail("NO_DATA", "No upcoming predictions available."), statusCode: 503);

    var greeting = "there";
    if (db.Configured)
    {
        try { greeting = (await users.GetUser(CurrentUser.Id(ctx)))?.DisplayName ?? greeting; }
        catch { /* DB optional for the home greeting */ }
    }

    var ranked = preds.OrderByDescending(p => p.Confidence.Score).ToList();
    var fixtures = ranked.Select(PredictionMapper.Fixture).ToList();
    var payload = new HomePayloadDto(
        GreetingName: greeting,
        TopPick: fixtures[0],
        Followed: fixtures.Skip(1).Take(3).ToList(),
        Upcoming: fixtures.Take(3).ToList(),
        Trending: ranked.Take(2).Select(PredictionMapper.Trending).ToList(),
        News: SampleNews());
    return Results.Ok(Ok(payload, hit ? "hit" : "miss"));
});

app.MapGet("/v1/matches", async (MlClient ml, ResponseCache cache) =>
{
    var (preds, hit) = await cache.GetOrSet("upcoming", shortTtl, () => ml.UpcomingAsync(50));
    return Results.Ok(Ok(preds.Select(PredictionMapper.Fixture).ToList(), hit ? "hit" : "miss"));
});

app.MapGet("/v1/matches/{fixtureId}/detail", async (string fixtureId, MlClient ml, ResponseCache cache) =>
{
    var (pred, hit) = await cache.GetOrSet($"detail:{fixtureId}", shortTtl, () => ml.PredictFixtureAsync(fixtureId));
    if (pred is null)
        return Results.Json(Fail("INVALID_FIXTURE", $"Unknown fixture '{fixtureId}'."), statusCode: 404);
    return Results.Ok(Ok(PredictionMapper.MatchDetail(pred), hit ? "hit" : "miss"));
});

// ---------------------------------------------------------------- Predictions
app.MapPost("/v1/predictions/manual", async (ManualRequest req, MlClient ml) =>
{
    var pred = await ml.PredictManualAsync(req.HomeTeamId, req.AwayTeamId, req.Venue ?? "home");
    if (pred is null)
        return Results.Json(Fail("INVALID_TEAM", "Unknown team in manual prediction."), statusCode: 404);
    return Results.Ok(Ok(PredictionMapper.MatchPrediction(pred)));
});

app.MapGet("/v1/models/performance", async (MlClient ml) =>
{
    var perf = await ml.ModelPerformanceAsync();
    if (perf is null)
        return Results.Json(Fail("NO_METRICS", "No model metrics yet."), statusCode: 404);
    return Results.Ok(Ok(PredictionMapper.ModelPerformance(perf)));
});

// ---------------------------------------------------------------- Team / Competition profiles
app.MapGet("/v1/teams/{teamId}", async (string teamId, MlClient ml, ResponseCache cache) =>
{
    var (profile, hit) = await cache.GetOrSet($"team:{teamId}", shortTtl, () => ml.TeamProfileAsync(teamId));
    if (profile is null)
        return Results.Json(Fail("INVALID_TEAM", $"Unknown team '{teamId}'."), statusCode: 404);
    return Results.Ok(Ok(ProfileMapper.TeamProfile(profile), hit ? "hit" : "miss"));
});

app.MapGet("/v1/competitions/{competitionId}", async (string competitionId, MlClient ml, ResponseCache cache) =>
{
    var (profile, hit) = await cache.GetOrSet($"comp:{competitionId}", shortTtl, () => ml.CompetitionProfileAsync(competitionId));
    if (profile is null)
        return Results.Json(Fail("INVALID_COMPETITION", $"Unknown competition '{competitionId}'."), statusCode: 404);
    return Results.Ok(Ok(ProfileMapper.CompetitionProfile(profile), hit ? "hit" : "miss"));
});

// ---------------------------------------------------------------- Favourites hub
app.MapGet("/v1/mobile/favourites", async (HttpContext ctx, MlClient ml, FavouritesRepo favs, NotificationsRepo notifs, SavedPredictionsRepo saved, Db db) =>
{
    if (!db.Configured) return Results.Json(Fail("NO_DB", "User store not configured."), statusCode: 503);
    var userId = CurrentUser.Id(ctx);
    var now = DateTime.UtcNow;

    var rows = await favs.ForUser(userId);
    var teamIds = rows.Where(r => r.Kind == "team").Select(r => r.RefId).ToList();
    var leagueIds = rows.Where(r => r.Kind == "league").Select(r => r.RefId).ToList();

    var teamProfiles = (await Task.WhenAll(teamIds.Select(id => ml.TeamProfileAsync(id))))
        .OfType<MlTeamProfile>().ToList();
    var leagueProfiles = (await Task.WhenAll(leagueIds.Select(id => ml.CompetitionProfileAsync(id))))
        .OfType<MlCompetitionProfile>().ToList();

    var predictions = teamProfiles
        .SelectMany(p => p.Upcoming)
        .DistinctBy(p => p.FixtureId)
        .OrderBy(p => p.KickoffTime)
        .Select(PredictionMapper.Fixture)
        .ToList();

    var notifications = await notifs.ListForUser(userId);
    var hub = new FavouritesHubDto(
        NextUp: predictions.FirstOrDefault(),
        Predictions: predictions,
        Updates: notifications.Take(5).Select(n => ToFavUpdate(n, now)).ToList(),
        Teams: teamProfiles.Select(p => ProfileMapper.FavTeam(p, now)).ToList(),
        Leagues: leagueProfiles.Select(p => ProfileMapper.FavLeague(p, now)).ToList(),
        PredictionsReady: predictions.Count,
        Alerts: await notifs.UnreadCount(userId),
        SavedPicks: await saved.CountForUser(userId));
    return Results.Ok(Ok(hub));
});

// ---------------------------------------------------------------- Saved predictions
app.MapGet("/v1/users/me/saved-predictions", async (HttpContext ctx, SavedPredictionsRepo saved, Db db) =>
{
    if (!db.Configured) return Results.Json(Fail("NO_DB", "User store not configured."), statusCode: 503);
    var rows = await saved.ListForUser(CurrentUser.Id(ctx));
    var list = rows.Select(r => new SavedPredictionDto(
        r.Id, r.FixtureId, r.CreatedAt.ToString("o"),
        JsonSerializer.Deserialize<MatchPredictionDto>(r.SnapshotJson, caseInsensitive)!)).ToList();
    return Results.Ok(Ok(list));
});

app.MapPost("/v1/users/me/saved-predictions", async (HttpContext ctx, SaveRequest req, MlClient ml, SavedPredictionsRepo saved, AuditRepo audit, Db db) =>
{
    if (!db.Configured) return Results.Json(Fail("NO_DB", "User store not configured."), statusCode: 503);
    var pred = await ml.PredictFixtureAsync(req.FixtureId);
    if (pred is null)
        return Results.Json(Fail("INVALID_FIXTURE", $"Unknown fixture '{req.FixtureId}'."), statusCode: 404);

    var userId = CurrentUser.Id(ctx);
    var dto = PredictionMapper.MatchPrediction(pred);
    var id = Guid.NewGuid().ToString("N");
    await saved.Insert(id, userId, req.FixtureId, JsonSerializer.Serialize(dto, camelJson));
    await audit.Log(userId, "save_prediction", "saved_prediction", id);
    return Results.Ok(Ok(new SavedPredictionDto(id, req.FixtureId, DateTime.UtcNow.ToString("o"), dto)));
});

app.MapDelete("/v1/users/me/saved-predictions/{id}", async (string id, HttpContext ctx, SavedPredictionsRepo saved, AuditRepo audit, Db db) =>
{
    if (!db.Configured) return Results.Json(Fail("NO_DB", "User store not configured."), statusCode: 503);
    var userId = CurrentUser.Id(ctx);
    var n = await saved.Delete(id, userId);
    if (n == 0) return Results.Json(Fail("NOT_FOUND", "Saved prediction not found."), statusCode: 404);
    await audit.Log(userId, "unsave_prediction", "saved_prediction", id);
    return Results.Ok(Ok(new { deleted = true }));
});

// ---------------------------------------------------------------- Notifications
app.MapGet("/v1/notifications", async (HttpContext ctx, NotificationsRepo notifs, Db db) =>
{
    if (!db.Configured) return Results.Json(Fail("NO_DB", "User store not configured."), statusCode: 503);
    var rows = await notifs.ListForUser(CurrentUser.Id(ctx));
    var list = rows.Select(n => new NotificationDto(
        n.Id, n.Kind, n.Title, n.Body, n.FixtureId, n.Read, n.CreatedAt.ToString("o"))).ToList();
    return Results.Ok(Ok(list));
});

app.MapPut("/v1/notifications/preferences", async (HttpContext ctx, NotificationPrefsRequest req, UserRepo users, Db db) =>
{
    if (!db.Configured) return Results.Json(Fail("NO_DB", "User store not configured."), statusCode: 503);
    var userId = CurrentUser.Id(ctx);
    var current = await users.GetPreferences(userId) ?? new UserPreferencesRow("decimal", "home-kit", "default", true, true, false);
    await users.UpsertPreferences(userId, current with
    {
        NotifyPredictions = req.NotifyPredictions,
        NotifyResults = req.NotifyResults,
        NotifyNews = req.NotifyNews,
    });
    return Results.Ok(Ok(new { updated = true }));
});

// ---------------------------------------------------------------- User profile
app.MapGet("/v1/users/me/profile", async (HttpContext ctx, UserRepo users, Db db) =>
{
    if (!db.Configured) return Results.Json(Fail("NO_DB", "User store not configured."), statusCode: 503);
    var userId = CurrentUser.Id(ctx);
    var user = await users.GetUser(userId);
    if (user is null) return Results.Json(Fail("NOT_FOUND", "User not found."), statusCode: 404);
    var p = await users.GetPreferences(userId) ?? new UserPreferencesRow("decimal", "home-kit", "default", true, true, false);
    var dto = new UserProfileDto(user.UserId, user.DisplayName, user.Email,
        new UserPreferencesDto(p.OddsFormat, p.KitId, p.TextSize, p.NotifyPredictions, p.NotifyResults, p.NotifyNews));
    return Results.Ok(Ok(dto));
});

app.MapPut("/v1/users/me/preferences", async (HttpContext ctx, UserPreferencesDto req, UserRepo users, AuditRepo audit, Db db) =>
{
    if (!db.Configured) return Results.Json(Fail("NO_DB", "User store not configured."), statusCode: 503);
    var userId = CurrentUser.Id(ctx);
    await users.UpsertPreferences(userId, new UserPreferencesRow(
        req.OddsFormat, req.KitId, req.TextSize, req.NotifyPredictions, req.NotifyResults, req.NotifyNews));
    await audit.Log(userId, "update_preferences", "user_preferences", userId);
    return Results.Ok(Ok(new { updated = true }));
});

app.Run();

static List<NewsItemDto> SampleNews() =>
[
    new("n1", "Key forward a late fitness doubt", "Home striker carrying a knock ahead of kickoff.", "2h ago", "injury"),
    new("n2", "Squad rotation expected", "Several changes likely after a busy schedule.", "4h ago", "lineup"),
    new("n3", "Strong home form continues", "Unbeaten across the last twelve at home.", "6h ago", "form"),
];

// Map a stored notification to the app's FavUpdate shape used in the favourites feed.
static FavUpdateDto ToFavUpdate(NotificationRow n, DateTime now)
{
    var kind = n.Kind switch
    {
        "result" => "result",
        "prediction" => "prediction_changed",
        "alert" => "starting_soon",
        _ => "prediction_changed",
    };
    return new FavUpdateDto(n.Id, kind, n.Title, n.Body, TimeAgo(n.CreatedAt, now));
}

static string TimeAgo(DateTime then, DateTime now)
{
    var span = now - then;
    if (span.TotalMinutes < 60) return $"{Math.Max(1, (int)span.TotalMinutes)}m ago";
    if (span.TotalHours < 24) return $"{(int)span.TotalHours}h ago";
    return $"{(int)span.TotalDays}d ago";
}

// Exposed for the test project (WebApplicationFactory).
public partial class Program { }

public record ManualRequest(string HomeTeamId, string AwayTeamId, string? Venue = "home");
public record SaveRequest(string FixtureId);
public record NotificationPrefsRequest(bool NotifyPredictions, bool NotifyResults, bool NotifyNews);
