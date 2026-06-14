import { useQuery } from '@tanstack/react-query';

import type { Fixture } from '@/models/fixture.model';
import type { MatchPrediction } from '@/models/prediction.model';

import type { TeamSummary } from '@/models/team.model';

import { deleteData, getData, postData, putData } from './client';
import {
  mockFixtures,
  mockMatchPrediction,
  mockNews,
  mockTopPick,
  mockTrending,
  type NewsItem,
  type TrendingPick,
} from './mock/fixtures';
import {
  mockFavLeagues,
  mockFavTeams,
  mockFavUpdates,
  type FavLeague,
  type FavTeam,
  type FavUpdate,
} from './mock/favourites';
import { buildPredictBreakdown, type PredictBreakdown, type Venue } from './mock/predict';
import { queryKeys } from './queryKeys';

export interface HomePayload {
  greetingName: string;
  topPick: Fixture;
  followed: Fixture[];
  upcoming: Fixture[];
  trending: TrendingPick[];
  news: NewsItem[];
}

export function useHome() {
  return useQuery({
    queryKey: queryKeys.home,
    queryFn: () =>
      getData<HomePayload>('/v1/mobile/home', () => ({
        greetingName: 'Adriano',
        topPick: mockTopPick,
        followed: mockFixtures.slice(1, 4),
        upcoming: mockFixtures.slice(2, 5),
        trending: mockTrending,
        news: mockNews,
      })),
  });
}

export type TopPickPeriod = 'today' | 'week';

/** Fixtures ranked by AI confidence (highest first), for the Top Picks list. */
export function useTopPicks(period: TopPickPeriod = 'today') {
  return useQuery({
    queryKey: ['top-picks', period],
    queryFn: async () => {
      // Top Picks is the matches list ranked by confidence; the BFF returns the
      // upcoming fixtures and we sort client-side (same as the mock did).
      const fixtures = await getData<Fixture[]>('/v1/matches', () =>
        period === 'week' ? mockFixtures : mockFixtures.filter((f) => f.status !== 'finished'),
      );
      return [...fixtures].sort(
        (a, b) => (b.predictionSummary?.confidenceScore ?? 0) - (a.predictionSummary?.confidenceScore ?? 0),
      );
    },
  });
}

export type MatchFilter = 'live' | 'today' | 'tomorrow' | 'upcoming';

export function useMatches(filter: MatchFilter = 'today') {
  return useQuery({
    queryKey: queryKeys.matches(filter),
    queryFn: () =>
      getData<Fixture[]>('/v1/matches', () => {
        if (filter === 'live') return mockFixtures.filter((f) => f.status === 'live');
        return mockFixtures;
      }),
  });
}

export interface MatchStatRow {
  label: string;
  home: string;
  away: string;
}

export function useMatchDetail(fixtureId: string) {
  return useQuery({
    queryKey: queryKeys.matchDetail(fixtureId),
    queryFn: () =>
      getData<{ fixture: Fixture; prediction: MatchPrediction; stats: MatchStatRow[] }>(
        `/v1/matches/${fixtureId}/detail`,
        () => {
          const fixture = mockFixtures.find((f) => f.fixtureId === fixtureId) ?? mockFixtures[0];
          const prediction = mockMatchPrediction(fixtureId);
          const stats: MatchStatRow[] = [
            { label: 'Expected Goals (xG)', home: prediction.expectedGoals.homeXg.toFixed(2), away: prediction.expectedGoals.awayXg.toFixed(2) },
            { label: 'Possession', home: '56%', away: '44%' },
            { label: 'Shots per Game', home: '15.3', away: '9.1' },
            { label: 'Shots on Target', home: '5.8', away: '3.6' },
            { label: 'Goals Conceded', home: '1.2', away: '1.6' },
          ];
          return { fixture, prediction, stats };
        },
      ),
  });
}

export interface FavouritesHub {
  nextUp: Fixture;
  predictions: Fixture[];
  updates: FavUpdate[];
  teams: FavTeam[];
  leagues: FavLeague[];
  predictionsReady: number;
  alerts: number;
  savedPicks: number;
}

export interface ModelPerformance {
  modelVersion: string;
  accuracy: number | null;
  brierScore: number | null;
  logLoss: number | null;
  sampleSize: number;
}

/** Rolling model accuracy (Brier / log-loss) from the post-match learning loop. */
export function useModelPerformance() {
  return useQuery({
    queryKey: ['model-performance'],
    queryFn: () =>
      getData<ModelPerformance>('/v1/models/performance', () => ({
        modelVersion: 'formula-1.0.0',
        accuracy: 0.55,
        brierScore: 0.19,
        logLoss: 0.62,
        sampleSize: 120,
      })),
  });
}

export interface ManualPredictionResult {
  prediction: MatchPrediction;
  breakdown: PredictBreakdown;
}

/** Generate an ad-hoc prediction + stats breakdown for any two teams (Manual Predict). */
export function predictManual(
  homeTeamId: string,
  awayTeamId: string,
  venue: Venue = 'home',
) {
  return postData<ManualPredictionResult>(
    '/v1/predictions/manual',
    { homeTeamId, awayTeamId, venue },
    () => ({
      prediction: mockMatchPrediction('fx_1'),
      breakdown: buildPredictBreakdown(homeTeamId, awayTeamId, homeTeamId, venue),
    }),
  );
}

/** The personalised Favourites hub: next match, predictions, updates, teams, leagues.
 * No BFF endpoint yet (favourites are assembled client-side for now), so this stays
 * on the mock transport regardless of USE_MOCK. */
export function useFavouritesHub() {
  return useQuery({
    queryKey: ['favourites-hub'],
    queryFn: () =>
      getData<FavouritesHub>('/v1/mobile/favourites', () => ({
        nextUp: mockFixtures[1],
        predictions: mockFixtures.slice(1, 4),
        updates: mockFavUpdates,
        teams: mockFavTeams,
        leagues: mockFavLeagues,
        predictionsReady: 5,
        alerts: mockFavUpdates.length,
        savedPicks: 3,
      })),
  });
}

// --- Team / competition profiles -------------------------------------------

export interface TeamProfileForm {
  attackStrength: number;
  defenceStrength: number;
  matchesSampled: number;
  goalsScoredAvg: number;
  goalsConcededAvg: number;
  recentResults: string[];
}

export interface TeamProfile {
  team: TeamSummary;
  competitionId?: string;
  competitionName?: string;
  elo: number;
  form: TeamProfileForm;
  upcoming: Fixture[];
}

export function useTeamProfile(teamId: string) {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: () =>
      getData<TeamProfile>(`/v1/teams/${teamId}`, () => {
        const fixtures = mockFixtures.filter(
          (f) => f.homeTeam.teamId === teamId || f.awayTeam.teamId === teamId,
        );
        const team = fixtures[0]?.homeTeam ?? mockFixtures[0].homeTeam;
        return {
          team,
          competitionId: fixtures[0]?.competitionId,
          competitionName: fixtures[0]?.competitionName,
          elo: 1600,
          form: {
            attackStrength: 1.8,
            defenceStrength: 1.0,
            matchesSampled: 12,
            goalsScoredAvg: 1.8,
            goalsConcededAvg: 1.0,
            recentResults: ['W', 'W', 'D', 'W', 'L'],
          },
          upcoming: fixtures,
        };
      }),
    enabled: !!teamId,
  });
}

export interface StandingRow {
  team: TeamSummary;
  elo: number;
  matchesPlayed: number;
}

export interface CompetitionProfile {
  competitionId: string;
  name: string;
  table: StandingRow[];
  upcoming: Fixture[];
}

export function useCompetitionProfile(competitionId: string) {
  return useQuery({
    queryKey: ['competition', competitionId],
    queryFn: () =>
      getData<CompetitionProfile>(`/v1/competitions/${competitionId}`, () => {
        const fixtures = mockFixtures.filter((f) => f.competitionId === competitionId);
        return {
          competitionId,
          name: fixtures[0]?.competitionName ?? competitionId,
          table: fixtures.map((f) => ({ team: f.homeTeam, elo: 1550, matchesPlayed: 20 })),
          upcoming: fixtures,
        };
      }),
    enabled: !!competitionId,
  });
}

// --- Saved predictions ------------------------------------------------------

export interface SavedPrediction {
  id: string;
  fixtureId: string;
  savedAt: string;
  prediction: MatchPrediction;
}

export function useSavedPredictions() {
  return useQuery({
    queryKey: ['saved-predictions'],
    queryFn: () => getData<SavedPrediction[]>('/v1/users/me/saved-predictions', () => []),
  });
}

export function savePrediction(fixtureId: string) {
  return postData<SavedPrediction>('/v1/users/me/saved-predictions', { fixtureId }, () => ({
    id: `saved_${fixtureId}`,
    fixtureId,
    savedAt: new Date().toISOString(),
    prediction: mockMatchPrediction(fixtureId),
  }));
}

export function unsavePrediction(id: string) {
  return deleteData<{ deleted: boolean }>(`/v1/users/me/saved-predictions/${id}`, () => ({ deleted: true }));
}

// --- Notifications ----------------------------------------------------------

export interface NotificationItem {
  id: string;
  kind: string;
  title: string;
  body: string;
  fixtureId?: string;
  read: boolean;
  createdAt: string;
}

// --- Persist favourites & preferences --------------------------------------

export interface UserPreferencesPayload {
  oddsFormat: string;
  kitId: string;
  textSize: string;
  notifyPredictions: boolean;
  notifyResults: boolean;
  notifyNews: boolean;
}

/** Replace the user's favourite teams + leagues (called on onboarding completion). */
export function saveFavourites(teams: string[], leagues: string[]) {
  return postData<{ saved: boolean }>('/v1/users/me/favourites', { teams, leagues }, () => ({ saved: true }));
}

/** Persist user preferences (kit, text size, odds format, notification toggles). */
export function savePreferences(prefs: UserPreferencesPayload) {
  return putData<{ updated: boolean }>('/v1/users/me/preferences', prefs, () => ({ updated: true }));
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () =>
      getData<NotificationItem[]>('/v1/notifications', () =>
        mockFavUpdates.map((u) => ({
          id: u.id,
          kind: u.kind,
          title: u.title,
          body: u.detail,
          read: false,
          createdAt: new Date().toISOString(),
        })),
      ),
  });
}
