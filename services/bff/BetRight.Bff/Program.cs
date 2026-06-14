using System.Text.Json;
using BetRight.Bff.Clients;
using BetRight.Bff.Contracts;
using BetRight.Bff.Mapping;
using Microsoft.Extensions.Caching.Memory;

var builder = WebApplication.CreateBuilder(args);

// camelCase JSON out, case-insensitive in — so payloads match the app's Zod models.
builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    o.SerializerOptions.PropertyNameCaseInsensitive = true;
});

// Cache: in-memory for local/dev. Production swaps in Redis (connection string is
// already wired through docker-compose) behind the same usage.
builder.Services.AddMemoryCache();

var mlBaseUrl = builder.Configuration["Ml:BaseUrl"] ?? "http://localhost:8001";
builder.Services.AddHttpClient<MlClient>(c => c.BaseAddress = new Uri(mlBaseUrl));

var app = builder.Build();

static Envelope<T> Ok<T>(T data, string cacheStatus = "miss") => new(
    data,
    new ApiMeta(Guid.NewGuid().ToString("N"), DateTime.UtcNow.ToString("o"), cacheStatus),
    []);

static Envelope<object?> Fail(string code, string message) => new(
    null,
    new ApiMeta(Guid.NewGuid().ToString("N"), DateTime.UtcNow.ToString("o"), "miss"),
    [new ApiError(code, message)]);

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// --- Home feed -------------------------------------------------------------
app.MapGet("/v1/mobile/home", async (MlClient ml, IMemoryCache cache, CancellationToken ct) =>
{
    var preds = await cache.GetOrCreateAsync("upcoming", e =>
    {
        e.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(30);
        return ml.UpcomingAsync(50, ct);
    }) ?? [];

    if (preds.Count == 0)
        return Results.Json(Fail("NO_DATA", "No upcoming predictions available."), statusCode: 503);

    var ranked = preds.OrderByDescending(p => p.Confidence.Score).ToList();
    var fixtures = ranked.Select(PredictionMapper.Fixture).ToList();
    var payload = new HomePayloadDto(
        GreetingName: "Adriano",
        TopPick: fixtures[0],
        Followed: fixtures.Skip(1).Take(3).ToList(),
        Upcoming: fixtures.Take(3).ToList(),
        Trending: ranked.Take(2).Select(PredictionMapper.Trending).ToList(),
        News: SampleNews());

    return Results.Ok(Ok(payload));
});

// --- Matches list ----------------------------------------------------------
app.MapGet("/v1/matches", async (MlClient ml, IMemoryCache cache, CancellationToken ct) =>
{
    var preds = await cache.GetOrCreateAsync("upcoming", e =>
    {
        e.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(30);
        return ml.UpcomingAsync(50, ct);
    }) ?? [];
    return Results.Ok(Ok(preds.Select(PredictionMapper.Fixture).ToList()));
});

// --- Match detail ----------------------------------------------------------
app.MapGet("/v1/matches/{fixtureId}/detail", async (string fixtureId, MlClient ml, CancellationToken ct) =>
{
    var pred = await ml.PredictFixtureAsync(fixtureId, ct);
    if (pred is null)
        return Results.Json(Fail("INVALID_FIXTURE", $"Unknown fixture '{fixtureId}'."), statusCode: 404);
    return Results.Ok(Ok(PredictionMapper.MatchDetail(pred)));
});

// --- Manual prediction -----------------------------------------------------
app.MapPost("/v1/predictions/manual", async (ManualRequest req, MlClient ml, CancellationToken ct) =>
{
    var pred = await ml.PredictManualAsync(req.HomeTeamId, req.AwayTeamId, req.Venue ?? "home", ct);
    if (pred is null)
        return Results.Json(Fail("INVALID_TEAM", "Unknown team in manual prediction."), statusCode: 404);
    return Results.Ok(Ok(PredictionMapper.MatchPrediction(pred)));
});

// --- Model performance -----------------------------------------------------
app.MapGet("/v1/models/performance", async (MlClient ml, CancellationToken ct) =>
{
    var perf = await ml.ModelPerformanceAsync(ct);
    if (perf is null)
        return Results.Json(Fail("NO_METRICS", "No model metrics yet."), statusCode: 404);
    return Results.Ok(Ok(PredictionMapper.ModelPerformance(perf)));
});

app.Run();

static List<NewsItemDto> SampleNews() =>
[
    new("n1", "Key forward a late fitness doubt", "Home striker carrying a knock ahead of kickoff.", "2h ago", "injury"),
    new("n2", "Squad rotation expected", "Several changes likely after a busy schedule.", "4h ago", "lineup"),
    new("n3", "Strong home form continues", "Unbeaten across the last twelve at home.", "6h ago", "form"),
];

// Exposed for the test project (WebApplicationFactory).
public partial class Program { }

public record ManualRequest(string HomeTeamId, string AwayTeamId, string? Venue = "home");
