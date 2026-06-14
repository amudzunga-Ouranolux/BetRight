import type { Fixture } from '@/models/fixture.model';

/** Market the user wants the prediction percentage for. 'winner' = default 1X2 view. */
export type MarketKey = 'winner' | 'over25' | 'over35' | 'btts' | 'cs_home' | 'cs_away';

export const MARKET_OPTIONS: { key: MarketKey; label: string }[] = [
  { key: 'winner', label: 'Match Winner' },
  { key: 'over25', label: 'Over 2.5 Goals' },
  { key: 'over35', label: 'Over 3.5 Goals' },
  { key: 'btts', label: 'Both Teams to Score' },
  { key: 'cs_home', label: 'Clean Sheet (Home)' },
  { key: 'cs_away', label: 'Clean Sheet (Away)' },
];

export type ConfidenceLevel = 'all' | 'high' | 'medium' | 'low';

export const CONFIDENCE_OPTIONS: { key: ConfidenceLevel; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
];

export type SortKey = 'kickoff' | 'confidence' | 'favourites';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'kickoff', label: 'Kickoff Time' },
  { key: 'confidence', label: 'Highest Confidence' },
  { key: 'favourites', label: 'Favourites First' },
];

export interface MatchFilters {
  market: MarketKey;
  confidence: ConfidenceLevel;
  leagues: string[];
  favouritesOnly: boolean;
  sort: SortKey;
  /** ISO yyyy-mm-dd, or null for no date filter. */
  date: string | null;
}

export const defaultFilters: MatchFilters = {
  market: 'winner',
  confidence: 'all',
  leagues: [],
  favouritesOnly: false,
  sort: 'kickoff',
  date: null,
};

/** Count of non-default filters, for the filter button badge. */
export function activeFilterCount(f: MatchFilters): number {
  let n = 0;
  if (f.market !== 'winner') n += 1;
  if (f.confidence !== 'all') n += 1;
  if (f.leagues.length) n += 1;
  if (f.favouritesOnly) n += 1;
  if (f.date) n += 1;
  return n;
}

/** The market percentage + short label to show on a row for the selected market. */
export function marketMetric(fixture: Fixture, market: MarketKey): { label: string; value: number } | null {
  const m = fixture.predictionSummary?.markets;
  if (market === 'winner' || !m) return null;
  switch (market) {
    case 'over25':
      return { label: 'Over 2.5', value: m.over25 };
    case 'over35':
      return { label: 'Over 3.5', value: m.over35 };
    case 'btts':
      return { label: 'BTTS', value: m.btts };
    case 'cs_home':
      return { label: 'CS Home', value: m.cleanSheetHome };
    case 'cs_away':
      return { label: 'CS Away', value: m.cleanSheetAway };
    default:
      return null;
  }
}

export function applyFilters(fixtures: Fixture[], f: MatchFilters, favouriteIds: Set<string>): Fixture[] {
  const filtered = fixtures.filter((fx) => {
    const conf = fx.predictionSummary?.confidenceScore ?? 0;
    if (f.confidence === 'high' && conf < 65) return false;
    if (f.confidence === 'medium' && (conf < 50 || conf >= 65)) return false;
    if (f.confidence === 'low' && conf >= 50) return false;
    if (f.leagues.length && !f.leagues.includes(fx.competitionId)) return false;
    if (f.favouritesOnly && !favouriteIds.has(fx.fixtureId)) return false;
    if (f.date && fx.kickoffTime.slice(0, 10) !== f.date) return false;
    return true;
  });

  const conf = (fx: Fixture) => fx.predictionSummary?.confidenceScore ?? 0;
  return [...filtered].sort((a, b) => {
    // Live always first.
    if ((a.status === 'live') !== (b.status === 'live')) return a.status === 'live' ? -1 : 1;
    if (f.sort === 'confidence') return conf(b) - conf(a);
    if (f.sort === 'favourites') {
      const fa = favouriteIds.has(a.fixtureId) ? 0 : 1;
      const fb = favouriteIds.has(b.fixtureId) ? 0 : 1;
      if (fa !== fb) return fa - fb;
    }
    return a.kickoffTime.localeCompare(b.kickoffTime);
  });
}
