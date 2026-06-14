namespace BetRight.Bff.Contracts;

// App-facing DTOs. Serialised camelCase (configured in Program.cs) so they match
// the mobile app's Zod models exactly (src/models/*.model.ts). Do not rename
// fields without updating those schemas.

public record ApiMeta(string RequestId, string GeneratedAt, string CacheStatus);

public record ApiError(string Code, string Message, string? Field = null);

public record Envelope<T>(T Data, ApiMeta Meta, List<ApiError> Errors);

public record TeamSummaryDto(string TeamId, string Name, string? ShortName = null, string? LogoUrl = null);

public record SummaryMarketsDto(
    double Over25,
    double Over35,
    double Btts,
    double CleanSheetHome,
    double CleanSheetAway);

public record PredictionSummaryDto(
    string PredictionId,
    string FixtureId,
    string ModelVersion,
    string PredictedResult,
    double ConfidenceScore,
    string ConfidenceLabel,
    string LikelyScore,
    double HomeWinProbability,
    double DrawProbability,
    double AwayWinProbability,
    SummaryMarketsDto Markets,
    List<string> QuickFlags,
    string GeneratedAt);

public record FixtureDto(
    string FixtureId,
    string SportCode,
    string CompetitionId,
    string CompetitionName,
    TeamSummaryDto HomeTeam,
    TeamSummaryDto AwayTeam,
    string KickoffTime,
    string Status,
    string? Venue,
    PredictionSummaryDto? PredictionSummary);

public record ExpectedGoalsDto(double HomeXg, double AwayXg, double TotalXg);

public record ScorelineDto(string Score, int HomeGoals, int AwayGoals, double Probability, int Rank);

public record PredictionMarketsDto(
    double Over15,
    double Over25,
    double Over35,
    double Under25,
    double BttsYes,
    double BttsNo);

public record ExplanationReasonDto(string Title, string Description, string Impact, double Strength);

public record MatchPredictionDto(
    string PredictionId,
    string FixtureId,
    string ModelVersion,
    string GeneratedAt,
    string PredictedResult,
    double HomeWinProbability,
    double DrawProbability,
    double AwayWinProbability,
    double ConfidenceScore,
    string ConfidenceLabel,
    ExpectedGoalsDto ExpectedGoals,
    List<ScorelineDto> Scorelines,
    PredictionMarketsDto Markets,
    string Headline,
    string Summary,
    List<ExplanationReasonDto> KeyReasons,
    List<ExplanationReasonDto> RiskFactors);

public record MatchStatRowDto(string Label, string Home, string Away);

public record MatchDetailDto(FixtureDto Fixture, MatchPredictionDto Prediction, List<MatchStatRowDto> Stats);

public record TrendingPickDto(
    string Id,
    string Title,
    string Market,
    double Odds,
    double Confidence,
    string Badge,
    string? CrestName);

public record NewsItemDto(string Id, string Title, string Summary, string TimeAgo, string Kind);

public record HomePayloadDto(
    string GreetingName,
    FixtureDto TopPick,
    List<FixtureDto> Followed,
    List<FixtureDto> Upcoming,
    List<TrendingPickDto> Trending,
    List<NewsItemDto> News);

public record ModelPerformanceDto(
    string ModelVersion,
    double? Accuracy,
    double? BrierScore,
    double? LogLoss,
    int SampleSize);
