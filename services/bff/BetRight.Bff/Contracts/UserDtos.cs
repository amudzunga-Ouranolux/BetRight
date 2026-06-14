namespace BetRight.Bff.Contracts;

// User-domain + profile DTOs (camelCase). Shapes match the app's models/hooks so
// the screens render without transformation.

// --- Team / competition profiles ---

public record TeamFormDto(
    double AttackStrength,
    double DefenceStrength,
    int MatchesSampled,
    double GoalsScoredAvg,
    double GoalsConcededAvg,
    List<string> RecentResults);

public record TeamProfileDto(
    TeamSummaryDto Team,
    string? CompetitionId,
    string? CompetitionName,
    double Elo,
    TeamFormDto Form,
    List<FixtureDto> Upcoming);

public record StandingRowDto(TeamSummaryDto Team, double Elo, int MatchesPlayed);

public record CompetitionProfileDto(
    string CompetitionId,
    string Name,
    List<StandingRowDto> Table,
    List<FixtureDto> Upcoming);

// --- Manual prediction breakdown (matches the app's PredictBreakdown) ---

public record ManualFormDto(List<string> Results, double GoalsScored, double GoalsConceded);
public record ManualH2HDto(int HomeGoals, int AwayGoals);
public record ManualKeyStatDto(string Label, double Home, double Away, string? Unit, bool LowerIsBetter);

public record ManualBreakdownDto(
    ManualFormDto HomeForm,
    ManualFormDto AwayForm,
    List<ManualH2HDto> H2h,
    List<ManualKeyStatDto> KeyStats,
    string Tip);

public record ManualPredictionDto(MatchPredictionDto Prediction, ManualBreakdownDto Breakdown);

// --- Favourites hub (matches the app's FavouritesHub / FavTeam / FavLeague / FavUpdate) ---

public record FavUpdateDto(string Id, string Kind, string Title, string Detail, string TimeAgo);

public record FavTeamDto(
    string Id,
    string Name,
    string ShortName,
    string Opponent,
    string Kickoff,
    List<string> Form,
    string PredLabel,
    double PredPct);

public record FavLeagueDto(
    string Id,
    string Name,
    int MatchesToday,
    int HighConfidence,
    string Note);

public record FavouritesHubDto(
    FixtureDto? NextUp,
    List<FixtureDto> Predictions,
    List<FavUpdateDto> Updates,
    List<FavTeamDto> Teams,
    List<FavLeagueDto> Leagues,
    int PredictionsReady,
    int Alerts,
    int SavedPicks);

// --- Saved predictions / notifications / user ---

public record SavedPredictionDto(
    string Id,
    string FixtureId,
    string SavedAt,
    MatchPredictionDto Prediction);

public record NotificationDto(
    string Id,
    string Kind,
    string Title,
    string Body,
    string? FixtureId,
    bool Read,
    string CreatedAt);

public record UserPreferencesDto(
    string OddsFormat,
    string KitId,
    string TextSize,
    bool NotifyPredictions,
    bool NotifyResults,
    bool NotifyNews);

public record UserProfileDto(
    string UserId,
    string DisplayName,
    string? Email,
    UserPreferencesDto Preferences);
