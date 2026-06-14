using System.Text.Json;
using BetRight.Bff.Clients;
using BetRight.Bff.Contracts;
using BetRight.Bff.Mapping;
using Xunit;

namespace BetRight.Bff.Tests;

public class PredictionMapperTests
{
    private static MlPrediction Sample(int confidence = 80, double over25 = 62, double btts = 60) => new(
        PredictionId: "pred_fx_1",
        FixtureId: "fx_1",
        ModelVersion: "formula-1.0.0",
        GeneratedAt: "2026-06-13T09:00:00Z",
        CompetitionId: "epl",
        CompetitionName: "Premier League",
        KickoffTime: "2026-06-15T18:00:00Z",
        HomeTeam: new MlTeam("mci", "Manchester City", "MCI"),
        AwayTeam: new MlTeam("mun", "Manchester United", "MUN"),
        PredictedResult: "home_win",
        Outcome: new MlOutcome(62, 23, 15),
        ExpectedGoals: new MlExpectedGoals(2.1, 1.2),
        LikelyScore: "2 - 1",
        LikelyScorelines: [new MlScoreline("2 - 1", 2, 1, 12.4, 1)],
        Markets: new MlMarkets(82, over25, 34, 38, btts, 40, 36, 26),
        Confidence: new MlConfidence(confidence, "high"),
        DataQualityScore: 100,
        Explanation: new MlExplanation("City favoured", "A clear lean.",
            [new MlReason("Home form", "Strong at home.", "positive", 0.8)],
            [new MlReason("Upset watch", "Underdog has a route.", "negative", 0.5)]),
        FeatureSnapshotId: "fs_abc");

    [Fact]
    public void Summary_maps_outcome_and_markets_to_camel_shape()
    {
        var s = PredictionMapper.Summary(Sample());
        Assert.Equal("home_win", s.PredictedResult);
        Assert.Equal(62, s.HomeWinProbability);
        Assert.Equal(23, s.DrawProbability);
        Assert.Equal(15, s.AwayWinProbability);
        Assert.Equal(62, s.Markets.Over25);
        Assert.Equal(60, s.Markets.Btts);
        Assert.Equal("2 - 1", s.LikelyScore);
    }

    [Fact]
    public void QuickFlags_reflect_confidence_and_markets()
    {
        var flags = PredictionMapper.QuickFlags(Sample(confidence: 80, over25: 62, btts: 60));
        Assert.Contains("high_confidence", flags);
        Assert.Contains("over_25", flags);
        Assert.Contains("btts", flags);
    }

    [Fact]
    public void QuickFlags_value_pick_when_close_and_unflagged()
    {
        var p = Sample(confidence: 50, over25: 40, btts: 40) with { Outcome = new MlOutcome(38, 34, 28) };
        var flags = PredictionMapper.QuickFlags(p);
        Assert.Contains("value_pick", flags);
    }

    [Fact]
    public void MatchPrediction_totals_xg_and_maps_reasons()
    {
        var m = PredictionMapper.MatchPrediction(Sample());
        Assert.Equal(3.3, m.ExpectedGoals.TotalXg, 3);
        Assert.Single(m.Scorelines);
        Assert.Single(m.KeyReasons);
        Assert.Equal("Home form", m.KeyReasons[0].Title);
        Assert.Single(m.RiskFactors);
    }

    [Fact]
    public void Fixture_carries_competition_and_summary()
    {
        var f = PredictionMapper.Fixture(Sample());
        Assert.Equal("football", f.SportCode);
        Assert.Equal("Premier League", f.CompetitionName);
        Assert.NotNull(f.PredictionSummary);
        Assert.Equal("MCI", f.HomeTeam.ShortName);
    }

    [Fact]
    public void Trending_uses_predicted_side_and_hot_badge()
    {
        var t = PredictionMapper.Trending(Sample(confidence: 80));
        Assert.Equal("Manchester City Win", t.Title);
        Assert.Equal("hot", t.Badge);
        Assert.True(t.Odds > 1.0);
    }

    [Fact]
    public void Envelope_serialises_camelCase()
    {
        var opts = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var env = new Envelope<PredictionSummaryDto>(
            PredictionMapper.Summary(Sample()),
            new ApiMeta("r1", "2026-06-13T09:00:00Z", "miss"),
            []);
        var json = JsonSerializer.Serialize(env, opts);
        Assert.Contains("\"homeWinProbability\"", json);
        Assert.Contains("\"requestId\"", json);
        Assert.DoesNotContain("home_win_probability", json);
    }
}
