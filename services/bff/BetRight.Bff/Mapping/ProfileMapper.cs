using System.Globalization;
using BetRight.Bff.Clients;
using BetRight.Bff.Contracts;

namespace BetRight.Bff.Mapping;

/// <summary>
/// Maps ML team/competition profiles and assembles the favourites hub into the
/// camelCase shapes the app expects. Pure functions (now is passed in) so the
/// kickoff-label and aggregation logic is unit testable.
/// </summary>
public static class ProfileMapper
{
    public static TeamProfileDto TeamProfile(MlTeamProfile p) => new(
        Team: PredictionMapper.Team(p.Team),
        CompetitionId: p.CompetitionId,
        CompetitionName: p.CompetitionName,
        Elo: p.Elo,
        Form: new TeamFormDto(
            p.Form.AttackStrength, p.Form.DefenceStrength, p.Form.MatchesSampled,
            p.Form.GoalsScoredAvg, p.Form.GoalsConcededAvg, p.Form.RecentResults),
        Upcoming: p.Upcoming.Select(PredictionMapper.Fixture).ToList());

    public static CompetitionProfileDto CompetitionProfile(MlCompetitionProfile p) => new(
        CompetitionId: p.CompetitionId,
        Name: p.Name,
        Table: p.Table.Select(r => new StandingRowDto(PredictionMapper.Team(r.Team), r.Elo, r.MatchesPlayed)).ToList(),
        Upcoming: p.Upcoming.Select(PredictionMapper.Fixture).ToList());

    /// <summary>A favourite team's next-match card, from its ML profile.</summary>
    public static FavTeamDto FavTeam(MlTeamProfile p, DateTime now)
    {
        var next = p.Upcoming.FirstOrDefault();
        var (label, pct) = next is null ? ("No upcoming match", 0.0) : PredLabel(next);
        var opponent = next is null
            ? "—"
            : (next.HomeTeam.TeamId == p.Team.TeamId ? next.AwayTeam.Name : next.HomeTeam.Name);
        return new FavTeamDto(
            Id: p.Team.TeamId,
            Name: p.Team.Name,
            ShortName: p.Team.ShortName ?? p.Team.TeamId.ToUpperInvariant(),
            Opponent: opponent,
            Kickoff: next?.KickoffTime is { } k ? KickoffLabel(k, now) : "—",
            Form: p.Form.RecentResults,
            PredLabel: label,
            PredPct: pct);
    }

    /// <summary>A favourite league summary, from its ML competition profile.</summary>
    public static FavLeagueDto FavLeague(MlCompetitionProfile p, DateTime now)
    {
        var today = p.Upcoming.Count(u => IsSameDay(u.KickoffTime, now));
        var highConf = p.Upcoming.Count(u => u.Confidence.Score >= 70);
        var note = p.Upcoming.Count > 0
            ? $"{p.Upcoming[0].HomeTeam.Name} vs {p.Upcoming[0].AwayTeam.Name}"
            : "No fixtures scheduled";
        return new FavLeagueDto(p.CompetitionId, p.Name, today, highConf, note);
    }

    public static (string Label, double Pct) PredLabel(MlPrediction p) => p.PredictedResult switch
    {
        "home_win" => ($"{p.HomeTeam.Name} Win", p.Outcome.HomeWin),
        "away_win" => ($"{p.AwayTeam.Name} Win", p.Outcome.AwayWin),
        _ => ("Draw", p.Outcome.Draw),
    };

    public static string KickoffLabel(string isoKickoff, DateTime now)
    {
        if (!DateTime.TryParse(isoKickoff, CultureInfo.InvariantCulture,
                DateTimeStyles.AdjustToUniversal, out var k))
            return "—";
        var time = k.ToString("HH:mm", CultureInfo.InvariantCulture);
        var days = (k.Date - now.Date).Days;
        return days switch
        {
            0 => $"Today {time}",
            1 => $"Tomorrow {time}",
            _ => $"{k:ddd} {time}",
        };
    }

    private static bool IsSameDay(string? iso, DateTime now)
        => iso is not null
           && DateTime.TryParse(iso, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out var k)
           && k.Date == now.Date;
}
