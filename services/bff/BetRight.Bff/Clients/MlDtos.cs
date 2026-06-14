using System.Text.Json.Serialization;

namespace BetRight.Bff.Clients;

// DTOs for the Python ML service responses (snake_case). Explicit JsonPropertyName
// on every field so deserialisation is unambiguous regardless of naming policy.

public record MlTeam(
    [property: JsonPropertyName("team_id")] string TeamId,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("short_name")] string? ShortName);

public record MlOutcome(
    [property: JsonPropertyName("home_win")] double HomeWin,
    [property: JsonPropertyName("draw")] double Draw,
    [property: JsonPropertyName("away_win")] double AwayWin);

public record MlExpectedGoals(
    [property: JsonPropertyName("home_xg")] double HomeXg,
    [property: JsonPropertyName("away_xg")] double AwayXg);

public record MlScoreline(
    [property: JsonPropertyName("score")] string Score,
    [property: JsonPropertyName("home_goals")] int HomeGoals,
    [property: JsonPropertyName("away_goals")] int AwayGoals,
    [property: JsonPropertyName("probability")] double Probability,
    [property: JsonPropertyName("rank")] int Rank);

public record MlMarkets(
    [property: JsonPropertyName("over15")] double Over15,
    [property: JsonPropertyName("over25")] double Over25,
    [property: JsonPropertyName("over35")] double Over35,
    [property: JsonPropertyName("under25")] double Under25,
    [property: JsonPropertyName("btts_yes")] double BttsYes,
    [property: JsonPropertyName("btts_no")] double BttsNo,
    [property: JsonPropertyName("clean_sheet_home")] double CleanSheetHome,
    [property: JsonPropertyName("clean_sheet_away")] double CleanSheetAway);

public record MlConfidence(
    [property: JsonPropertyName("score")] int Score,
    [property: JsonPropertyName("label")] string Label);

public record MlReason(
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("description")] string Description,
    [property: JsonPropertyName("impact")] string Impact,
    [property: JsonPropertyName("strength")] double Strength);

public record MlExplanation(
    [property: JsonPropertyName("headline")] string Headline,
    [property: JsonPropertyName("summary")] string Summary,
    [property: JsonPropertyName("key_reasons")] List<MlReason> KeyReasons,
    [property: JsonPropertyName("risk_factors")] List<MlReason> RiskFactors);

public record MlPrediction(
    [property: JsonPropertyName("prediction_id")] string PredictionId,
    [property: JsonPropertyName("fixture_id")] string FixtureId,
    [property: JsonPropertyName("model_version")] string ModelVersion,
    [property: JsonPropertyName("generated_at")] string GeneratedAt,
    [property: JsonPropertyName("competition_id")] string? CompetitionId,
    [property: JsonPropertyName("competition_name")] string? CompetitionName,
    [property: JsonPropertyName("kickoff_time")] string? KickoffTime,
    [property: JsonPropertyName("home_team")] MlTeam HomeTeam,
    [property: JsonPropertyName("away_team")] MlTeam AwayTeam,
    [property: JsonPropertyName("predicted_result")] string PredictedResult,
    [property: JsonPropertyName("outcome")] MlOutcome Outcome,
    [property: JsonPropertyName("expected_goals")] MlExpectedGoals ExpectedGoals,
    [property: JsonPropertyName("likely_score")] string LikelyScore,
    [property: JsonPropertyName("likely_scorelines")] List<MlScoreline> LikelyScorelines,
    [property: JsonPropertyName("markets")] MlMarkets Markets,
    [property: JsonPropertyName("confidence")] MlConfidence Confidence,
    [property: JsonPropertyName("data_quality_score")] double DataQualityScore,
    [property: JsonPropertyName("explanation")] MlExplanation Explanation,
    [property: JsonPropertyName("feature_snapshot_id")] string? FeatureSnapshotId);

public record MlModelPerformance(
    [property: JsonPropertyName("model_version")] string ModelVersion,
    [property: JsonPropertyName("accuracy")] double? Accuracy,
    [property: JsonPropertyName("brier_score")] double? BrierScore,
    [property: JsonPropertyName("log_loss")] double? LogLoss,
    [property: JsonPropertyName("sample_size")] int SampleSize);

public record MlFormBreakdown(
    [property: JsonPropertyName("results")] List<string> Results,
    [property: JsonPropertyName("goals_scored")] double GoalsScored,
    [property: JsonPropertyName("goals_conceded")] double GoalsConceded);

public record MlH2H(
    [property: JsonPropertyName("home_goals")] int HomeGoals,
    [property: JsonPropertyName("away_goals")] int AwayGoals);

public record MlKeyStat(
    [property: JsonPropertyName("label")] string Label,
    [property: JsonPropertyName("home")] double Home,
    [property: JsonPropertyName("away")] double Away,
    [property: JsonPropertyName("unit")] string? Unit,
    [property: JsonPropertyName("lower_is_better")] bool LowerIsBetter);

public record MlManualBreakdown(
    [property: JsonPropertyName("home_form")] MlFormBreakdown HomeForm,
    [property: JsonPropertyName("away_form")] MlFormBreakdown AwayForm,
    [property: JsonPropertyName("h2h")] List<MlH2H> H2h,
    [property: JsonPropertyName("key_stats")] List<MlKeyStat> KeyStats,
    [property: JsonPropertyName("tip")] string Tip);

public record MlManualPrediction(
    [property: JsonPropertyName("prediction")] MlPrediction Prediction,
    [property: JsonPropertyName("breakdown")] MlManualBreakdown Breakdown);

public record MlTeamForm(
    [property: JsonPropertyName("attack_strength")] double AttackStrength,
    [property: JsonPropertyName("defence_strength")] double DefenceStrength,
    [property: JsonPropertyName("matches_sampled")] int MatchesSampled,
    [property: JsonPropertyName("goals_scored_avg")] double GoalsScoredAvg,
    [property: JsonPropertyName("goals_conceded_avg")] double GoalsConcededAvg,
    [property: JsonPropertyName("recent_results")] List<string> RecentResults);

public record MlTeamProfile(
    [property: JsonPropertyName("team")] MlTeam Team,
    [property: JsonPropertyName("competition_id")] string? CompetitionId,
    [property: JsonPropertyName("competition_name")] string? CompetitionName,
    [property: JsonPropertyName("elo")] double Elo,
    [property: JsonPropertyName("form")] MlTeamForm Form,
    [property: JsonPropertyName("upcoming")] List<MlPrediction> Upcoming);

public record MlStandingRow(
    [property: JsonPropertyName("team")] MlTeam Team,
    [property: JsonPropertyName("elo")] double Elo,
    [property: JsonPropertyName("matches_played")] int MatchesPlayed);

public record MlCompetitionProfile(
    [property: JsonPropertyName("competition_id")] string CompetitionId,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("table")] List<MlStandingRow> Table,
    [property: JsonPropertyName("upcoming")] List<MlPrediction> Upcoming);
