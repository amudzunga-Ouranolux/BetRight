import { useQuery } from '@tanstack/react-query';

import type { Fixture } from '@/models/fixture.model';
import type { MatchPrediction } from '@/models/prediction.model';

import { mockGet } from './client';
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
    queryFn: async () => {
      const res = await mockGet<HomePayload>(() => ({
        greetingName: 'Adriano',
        topPick: mockTopPick,
        followed: mockFixtures.slice(1, 4),
        upcoming: mockFixtures.slice(2, 5),
        trending: mockTrending,
        news: mockNews,
      }));
      return res.data;
    },
  });
}

export type TopPickPeriod = 'today' | 'week';

/** Fixtures ranked by AI confidence (highest first), for the Top Picks list. */
export function useTopPicks(period: TopPickPeriod = 'today') {
  return useQuery({
    queryKey: ['top-picks', period],
    queryFn: async () => {
      const res = await mockGet<Fixture[]>(() => {
        const pool = period === 'week' ? mockFixtures : mockFixtures.filter((f) => f.status !== 'finished');
        return [...pool].sort(
          (a, b) => (b.predictionSummary?.confidenceScore ?? 0) - (a.predictionSummary?.confidenceScore ?? 0),
        );
      });
      return res.data;
    },
  });
}

export type MatchFilter = 'live' | 'today' | 'tomorrow' | 'upcoming';

export function useMatches(filter: MatchFilter = 'today') {
  return useQuery({
    queryKey: queryKeys.matches(filter),
    queryFn: async () => {
      const res = await mockGet<Fixture[]>(() => {
        if (filter === 'live') return mockFixtures.filter((f) => f.status === 'live');
        return mockFixtures;
      });
      return res.data;
    },
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
    queryFn: async () => {
      const res = await mockGet<{ fixture: Fixture; prediction: MatchPrediction; stats: MatchStatRow[] }>(() => {
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
      });
      return res.data;
    },
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

/** The personalised Favourites hub: next match, predictions, updates, teams, leagues. */
export function useFavouritesHub() {
  return useQuery({
    queryKey: ['favourites-hub'],
    queryFn: async () => {
      const res = await mockGet<FavouritesHub>(() => ({
        nextUp: mockFixtures[1],
        predictions: mockFixtures.slice(1, 4),
        updates: mockFavUpdates,
        teams: mockFavTeams,
        leagues: mockFavLeagues,
        predictionsReady: 5,
        alerts: mockFavUpdates.length,
        savedPicks: 3,
      }));
      return res.data;
    },
  });
}
