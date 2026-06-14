/**
 * Mock breakdown for the Manual Predict screen. Given two team ids and a venue
 * setting, it produces deterministic, plausible form / head-to-head / key-stat
 * data so the screen is fully populated before the .NET BFF lands. Values are
 * derived from a stable seed (team ids) — no randomness — so the UI doesn't
 * flicker between renders.
 */

export type FormResult = 'W' | 'D' | 'L';
export type Venue = 'home' | 'neutral' | 'away';

export interface TeamForm {
  /** Last five results, oldest first. */
  results: FormResult[];
  goalsScored: number;
  goalsConceded: number;
}

export interface H2HResult {
  homeGoals: number;
  awayGoals: number;
}

export interface KeyStat {
  label: string;
  home: number;
  away: number;
  /** Suffix shown after the value (e.g. '%'). */
  unit?: string;
  /** When true the lower value is the stronger one (e.g. cards per game). */
  lowerIsBetter?: boolean;
}

export interface PredictBreakdown {
  homeForm: TeamForm;
  awayForm: TeamForm;
  h2h: H2HResult[];
  keyStats: KeyStat[];
  tip: string;
}

/** Small deterministic seed from a string id (0–96). */
function seed(id: string): number {
  let s = 0;
  for (let i = 0; i < id.length; i += 1) s = (s + id.charCodeAt(i) * (i + 1)) % 97;
  return s;
}

const FORM_PATTERNS: FormResult[][] = [
  ['W', 'W', 'D', 'W', 'L'],
  ['W', 'L', 'W', 'W', 'D'],
  ['D', 'W', 'W', 'L', 'W'],
  ['L', 'W', 'D', 'W', 'W'],
  ['W', 'D', 'W', 'L', 'W'],
];

function teamForm(id: string, attackBias: number): TeamForm {
  const s = seed(id);
  return {
    results: FORM_PATTERNS[s % FORM_PATTERNS.length],
    goalsScored: Math.round((1.6 + (s % 9) / 10 + attackBias) * 10) / 10,
    goalsConceded: Math.round((0.6 + (s % 5) / 10) * 10) / 10,
  };
}

/** Round to one decimal place. */
const d1 = (n: number) => Math.round(n * 10) / 10;

export function buildPredictBreakdown(
  homeId: string,
  awayId: string,
  homeName: string,
  venue: Venue,
): PredictBreakdown {
  const hs = seed(homeId);
  const as = seed(awayId);
  // Venue tilts the home side's attacking output up or down.
  const homeEdge = venue === 'home' ? 0.4 : venue === 'away' ? -0.2 : 0;

  const keyStats: KeyStat[] = [
    { label: 'Possession', home: 50 + (hs % 8) + (homeEdge > 0 ? 4 : 0), away: 50 + (as % 8), unit: '%' },
    { label: 'Shots per game', home: d1(14 + (hs % 6)), away: d1(13 + (as % 6)) },
    { label: 'Shots on target', home: d1(5 + (hs % 3)), away: d1(5 + (as % 3)) },
    { label: 'Pass accuracy', home: 85 + (hs % 9), away: 84 + (as % 9), unit: '%' },
    { label: 'Cards per game', home: d1(1 + (hs % 12) / 10), away: d1(1 + (as % 12) / 10), lowerIsBetter: true },
  ];

  // Normalise possession so the two sides total 100%.
  const possTotal = keyStats[0].home + keyStats[0].away;
  keyStats[0].home = Math.round((keyStats[0].home / possTotal) * 100);
  keyStats[0].away = 100 - keyStats[0].home;

  const wins = keyStats.filter((k) =>
    k.lowerIsBetter ? k.home < k.away : k.home > k.away,
  ).length;
  const venueLine =
    venue === 'home'
      ? 'a slight home advantage'
      : venue === 'away'
        ? 'work to do away from home'
        : 'a balanced matchup on neutral ground';
  const tip =
    wins >= 3
      ? `${homeName} have ${venueLine} with stronger possession and attacking output across recent games.`
      : `${homeName} have ${venueLine}; the two sides are closely matched on recent numbers.`;

  return {
    homeForm: teamForm(homeId, homeEdge),
    awayForm: teamForm(awayId, 0),
    h2h: [
      { homeGoals: 2, awayGoals: 1 },
      { homeGoals: 4, awayGoals: 3 },
      { homeGoals: 1, awayGoals: 1 },
      { homeGoals: 0, awayGoals: 2 },
      { homeGoals: 3, awayGoals: 2 },
    ],
    keyStats,
    tip,
  };
}
