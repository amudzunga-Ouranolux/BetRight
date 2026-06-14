using System.Net.Http.Json;
using System.Text.Json;

namespace BetRight.Bff.Clients;

/// <summary>
/// Typed client for the Python ML service. The mobile app never calls this — only
/// the BFF does (architecture guardrail). Returns ML DTOs; mapping to app DTOs
/// happens in PredictionMapper.
/// </summary>
public class MlClient(HttpClient http)
{
    private static readonly JsonSerializerOptions Json = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public async Task<MlPrediction?> PredictFixtureAsync(string fixtureId, CancellationToken ct = default)
    {
        var resp = await http.PostAsJsonAsync("/internal/predict", new { fixture_id = fixtureId }, ct);
        if (resp.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
        resp.EnsureSuccessStatusCode();
        return await resp.Content.ReadFromJsonAsync<MlPrediction>(Json, ct);
    }

    public async Task<MlPrediction?> PredictManualAsync(
        string homeTeamId, string awayTeamId, string venue, CancellationToken ct = default)
    {
        var body = new { home_team_id = homeTeamId, away_team_id = awayTeamId, venue };
        var resp = await http.PostAsJsonAsync("/internal/predict/manual", body, ct);
        if (resp.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
        resp.EnsureSuccessStatusCode();
        return await resp.Content.ReadFromJsonAsync<MlPrediction>(Json, ct);
    }

    public async Task<List<MlPrediction>> UpcomingAsync(int limit = 50, CancellationToken ct = default)
    {
        var result = await http.GetFromJsonAsync<List<MlPrediction>>(
            $"/internal/predictions/upcoming?limit={limit}", Json, ct);
        return result ?? [];
    }

    public async Task<MlModelPerformance?> ModelPerformanceAsync(CancellationToken ct = default)
        => await http.GetFromJsonAsync<MlModelPerformance>("/internal/models/performance", Json, ct);

    public async Task<MlTeamProfile?> TeamProfileAsync(string teamId, CancellationToken ct = default)
    {
        var resp = await http.GetAsync($"/internal/teams/{teamId}", ct);
        if (resp.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
        resp.EnsureSuccessStatusCode();
        return await resp.Content.ReadFromJsonAsync<MlTeamProfile>(Json, ct);
    }

    public async Task<MlCompetitionProfile?> CompetitionProfileAsync(string competitionId, CancellationToken ct = default)
    {
        var resp = await http.GetAsync($"/internal/competitions/{competitionId}", ct);
        if (resp.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
        resp.EnsureSuccessStatusCode();
        return await resp.Content.ReadFromJsonAsync<MlCompetitionProfile>(Json, ct);
    }
}
