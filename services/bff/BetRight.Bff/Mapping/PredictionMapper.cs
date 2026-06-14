using BetRight.Bff.Clients;
using BetRight.Bff.Contracts;

namespace BetRight.Bff.Mapping;

/// <summary>
/// Maps the Python ML service's (snake_case) prediction into the app-facing
/// (camelCase) DTOs the mobile app's Zod models expect. Pure functions — unit
/// tested without an HTTP host.
/// </summary>
public static class PredictionMapper
{
    public static TeamSummaryDto Team(MlTeam t) => new(t.TeamId, t.Name, t.ShortName);

    public static SummaryMarketsDto SummaryMarkets(MlMarkets m) =>
        new(m.Over25, m.Over35, m.BttsYes, m.CleanSheetHome, m.CleanSheetAway);

    public static PredictionMarketsDto FullMarkets(MlMarkets m) =>
        new(m.Over15, m.Over25, m.Over35, m.Under25, m.BttsYes, m.BttsNo);

    public static List<string> QuickFlags(MlPrediction p)
    {
        var flags = new List<string>();
        if (p.Confidence.Score >= 75) flags.Add("high_confidence");
        if (p.Markets.Over25 >= 60) flags.Add("over_25");
        if (p.Markets.BttsYes >= 58) flags.Add("btts");
        // A close three-way with a leaning favourite reads as a value pick.
        var spread = Math.Max(p.Outcome.HomeWin, Math.Max(p.Outcome.Draw, p.Outcome.AwayWin))
                     - Math.Min(p.Outcome.HomeWin, Math.Min(p.Outcome.Draw, p.Outcome.AwayWin));
        if (flags.Count == 0 && spread < 25) flags.Add("value_pick");
        return flags;
    }

    public static PredictionSummaryDto Summary(MlPrediction p) => new(
        PredictionId: p.PredictionId,
        FixtureId: p.FixtureId,
        ModelVersion: p.ModelVersion,
        PredictedResult: p.PredictedResult,
        ConfidenceScore: p.Confidence.Score,
        ConfidenceLabel: p.Confidence.Label,
        LikelyScore: p.LikelyScore,
        HomeWinProbability: p.Outcome.HomeWin,
        DrawProbability: p.Outcome.Draw,
        AwayWinProbability: p.Outcome.AwayWin,
        Markets: SummaryMarkets(p.Markets),
        QuickFlags: QuickFlags(p),
        GeneratedAt: p.GeneratedAt);

    public static FixtureDto Fixture(MlPrediction p) => new(
        FixtureId: p.FixtureId,
        SportCode: "football",
        CompetitionId: p.CompetitionId ?? "",
        CompetitionName: p.CompetitionName ?? "",
        HomeTeam: Team(p.HomeTeam),
        AwayTeam: Team(p.AwayTeam),
        KickoffTime: p.KickoffTime ?? p.GeneratedAt,
        Status: "scheduled",
        Venue: null,
        PredictionSummary: Summary(p));

    public static MatchPredictionDto MatchPrediction(MlPrediction p) => new(
        PredictionId: p.PredictionId,
        FixtureId: p.FixtureId,
        ModelVersion: p.ModelVersion,
        GeneratedAt: p.GeneratedAt,
        PredictedResult: p.PredictedResult,
        HomeWinProbability: p.Outcome.HomeWin,
        DrawProbability: p.Outcome.Draw,
        AwayWinProbability: p.Outcome.AwayWin,
        ConfidenceScore: p.Confidence.Score,
        ConfidenceLabel: p.Confidence.Label,
        ExpectedGoals: new ExpectedGoalsDto(
            p.ExpectedGoals.HomeXg,
            p.ExpectedGoals.AwayXg,
            Math.Round(p.ExpectedGoals.HomeXg + p.ExpectedGoals.AwayXg, 2)),
        Scorelines: p.LikelyScorelines
            .Select(s => new ScorelineDto(s.Score, s.HomeGoals, s.AwayGoals, s.Probability, s.Rank))
            .ToList(),
        Markets: FullMarkets(p.Markets),
        Headline: p.Explanation.Headline,
        Summary: p.Explanation.Summary,
        KeyReasons: p.Explanation.KeyReasons.Select(Reason).ToList(),
        RiskFactors: p.Explanation.RiskFactors.Select(Reason).ToList());

    public static MatchDetailDto MatchDetail(MlPrediction p) => new(
        Fixture: Fixture(p),
        Prediction: MatchPrediction(p),
        Stats: new List<MatchStatRowDto>
        {
            new("Expected Goals (xG)", p.ExpectedGoals.HomeXg.ToString("0.00"), p.ExpectedGoals.AwayXg.ToString("0.00")),
            new("Win Probability", $"{p.Outcome.HomeWin:0}%", $"{p.Outcome.AwayWin:0}%"),
            new("Clean Sheet", $"{p.Markets.CleanSheetHome:0}%", $"{p.Markets.CleanSheetAway:0}%"),
            new("Over 2.5 Goals", $"{p.Markets.Over25:0}%", $"{p.Markets.Over25:0}%"),
            new("Both Teams To Score", $"{p.Markets.BttsYes:0}%", $"{p.Markets.BttsYes:0}%"),
        });

    /// <summary>Derive a Trending pick from a prediction (highest-probability outcome).</summary>
    public static TrendingPickDto Trending(MlPrediction p)
    {
        var (title, prob, crest) = p.PredictedResult switch
        {
            "home_win" => ($"{p.HomeTeam.Name} Win", p.Outcome.HomeWin, p.HomeTeam.Name),
            "away_win" => ($"{p.AwayTeam.Name} Win", p.Outcome.AwayWin, p.AwayTeam.Name),
            _ => ("Draw", p.Outcome.Draw, (string?)null),
        };
        var odds = prob > 0 ? Math.Round(100.0 / prob, 2) : 0;
        return new TrendingPickDto(
            Id: $"tr_{p.FixtureId}",
            Title: title,
            Market: "1X2 Full Time",
            Odds: odds,
            Confidence: p.Confidence.Score,
            Badge: p.Confidence.Score >= 70 ? "hot" : "value",
            CrestName: crest);
    }

    public static ModelPerformanceDto ModelPerformance(MlModelPerformance m) =>
        new(m.ModelVersion, m.Accuracy, m.BrierScore, m.LogLoss, m.SampleSize);

    public static ManualPredictionDto ManualPrediction(MlManualPrediction m)
    {
        var b = m.Breakdown;
        return new ManualPredictionDto(
            Prediction: MatchPrediction(m.Prediction),
            Breakdown: new ManualBreakdownDto(
                HomeForm: new ManualFormDto(b.HomeForm.Results, b.HomeForm.GoalsScored, b.HomeForm.GoalsConceded),
                AwayForm: new ManualFormDto(b.AwayForm.Results, b.AwayForm.GoalsScored, b.AwayForm.GoalsConceded),
                H2h: b.H2h.Select(h => new ManualH2HDto(h.HomeGoals, h.AwayGoals)).ToList(),
                KeyStats: b.KeyStats.Select(k => new ManualKeyStatDto(k.Label, k.Home, k.Away, k.Unit, k.LowerIsBetter)).ToList(),
                Tip: b.Tip));
    }

    private static ExplanationReasonDto Reason(MlReason r) =>
        new(r.Title, r.Description, r.Impact, r.Strength);
}
