using BetRight.Bff.Clients;
using BetRight.Bff.Mapping;
using Xunit;

namespace BetRight.Bff.Tests;

public class ProfileMapperTests
{
    private static MlPrediction Pred(string fixtureId, string homeId, string homeName, string awayName, string kickoff) => new(
        PredictionId: $"pred_{fixtureId}", FixtureId: fixtureId, ModelVersion: "formula-1.0.0",
        GeneratedAt: "2026-06-13T09:00:00Z", CompetitionId: "epl", CompetitionName: "Premier League",
        KickoffTime: kickoff,
        HomeTeam: new MlTeam(homeId, homeName, homeName[..3].ToUpperInvariant()),
        AwayTeam: new MlTeam("away", awayName, awayName[..3].ToUpperInvariant()),
        PredictedResult: "home_win",
        Outcome: new MlOutcome(64, 22, 14),
        ExpectedGoals: new MlExpectedGoals(2.0, 1.0),
        LikelyScore: "2 - 0", LikelyScorelines: [],
        Markets: new MlMarkets(80, 60, 30, 40, 55, 45, 40, 25),
        Confidence: new MlConfidence(72, "medium"),
        DataQualityScore: 100,
        Explanation: new MlExplanation("h", "s", [], []),
        FeatureSnapshotId: "fs_x");

    private static MlTeamProfile TeamProfile() => new(
        Team: new MlTeam("mci", "Manchester City", "MCI"),
        CompetitionId: "epl", CompetitionName: "Premier League",
        Elo: 1660.0,
        Form: new MlTeamForm(2.1, 0.9, 14, 2.1, 0.9, ["W", "W", "D", "W", "L"]),
        Upcoming: [Pred("fx1", "mci", "Manchester City", "Manchester United", "2026-06-14T18:00:00Z")]);

    [Fact]
    public void TeamProfile_maps_form_and_upcoming()
    {
        var dto = ProfileMapper.TeamProfile(TeamProfile());
        Assert.Equal("mci", dto.Team.TeamId);
        Assert.Equal(1660.0, dto.Elo);
        Assert.Equal(5, dto.Form.RecentResults.Count);
        Assert.Single(dto.Upcoming);
        Assert.NotNull(dto.Upcoming[0].PredictionSummary);
    }

    [Fact]
    public void FavTeam_uses_next_fixture_opponent_and_pred()
    {
        var now = new DateTime(2026, 6, 14, 12, 0, 0, DateTimeKind.Utc);
        var fav = ProfileMapper.FavTeam(TeamProfile(), now);
        Assert.Equal("Manchester United", fav.Opponent);
        Assert.Equal("Today 18:00", fav.Kickoff);
        Assert.Equal("Manchester City Win", fav.PredLabel);
        Assert.Equal(64, fav.PredPct);
        Assert.Equal(["W", "W", "D", "W", "L"], fav.Form);
    }

    [Fact]
    public void FavLeague_counts_today_and_high_confidence()
    {
        var now = new DateTime(2026, 6, 14, 12, 0, 0, DateTimeKind.Utc);
        var comp = new MlCompetitionProfile("epl", "Premier League",
            Table: [],
            Upcoming:
            [
                Pred("a", "mci", "Man City", "Arsenal", "2026-06-14T18:00:00Z"),   // today, conf 72 -> high
                Pred("b", "liv", "Liverpool", "Chelsea", "2026-06-16T18:00:00Z"),  // not today
            ]);
        var fav = ProfileMapper.FavLeague(comp, now);
        Assert.Equal(1, fav.MatchesToday);
        Assert.Equal(2, fav.HighConfidence);   // both have conf 72 >= 70
        Assert.Contains("Man City", fav.Note);
    }

    [Theory]
    [InlineData("2026-06-14T18:00:00Z", "Today 18:00")]
    [InlineData("2026-06-15T21:30:00Z", "Tomorrow 21:30")]
    public void KickoffLabel_formats_relative_day(string iso, string expected)
    {
        var now = new DateTime(2026, 6, 14, 12, 0, 0, DateTimeKind.Utc);
        Assert.Equal(expected, ProfileMapper.KickoffLabel(iso, now));
    }

    [Fact]
    public void CompetitionProfile_maps_table_and_upcoming()
    {
        var comp = new MlCompetitionProfile("epl", "Premier League",
            Table: [new MlStandingRow(new MlTeam("mci", "Man City", "MCI"), 1660, 20)],
            Upcoming: [Pred("a", "mci", "Man City", "Arsenal", "2026-06-14T18:00:00Z")]);
        var dto = ProfileMapper.CompetitionProfile(comp);
        Assert.Single(dto.Table);
        Assert.Equal(1660, dto.Table[0].Elo);
        Assert.Single(dto.Upcoming);
    }
}
