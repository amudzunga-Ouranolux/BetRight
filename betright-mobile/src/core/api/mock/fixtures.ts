import type { Fixture } from '@/models/fixture.model';
import type { MatchPrediction, PredictionSummary } from '@/models/prediction.model';

/**
 * Static mock dataset for the FE phase. Shapes mirror predict.py output and the
 * §7 data models. When the .NET BFF lands, only the transport in `client.ts`
 * changes — this file (and the query hooks) stay the same.
 */

const team = (teamId: string, name: string, shortName: string) => ({ teamId, name, shortName });

function summary(
  fixtureId: string,
  home: number,
  draw: number,
  away: number,
  likely: string,
  confidence: number,
  label: PredictionSummary['confidenceLabel'],
  result: PredictionSummary['predictedResult'],
  flags: PredictionSummary['quickFlags'],
): PredictionSummary {
  // Deterministic per-market probabilities derived from the 1X2 split so each
  // fixture has stable, plausible numbers for the market filter.
  const total = home - away; // home dominance
  return {
    predictionId: `pred_${fixtureId}`,
    fixtureId,
    modelVersion: 'v1.4.2',
    predictedResult: result,
    confidenceScore: confidence,
    confidenceLabel: label,
    likelyScore: likely,
    homeWinProbability: home,
    drawProbability: draw,
    awayWinProbability: away,
    markets: {
      over25: Math.round(45 + draw * 0.5 + (away % 7)),
      over35: Math.round(25 + (away % 9)),
      btts: Math.round(40 + draw * 0.6),
      cleanSheetHome: Math.round(30 + Math.max(0, total) * 0.4),
      cleanSheetAway: Math.round(20 + Math.max(0, -total) * 0.4),
    },
    quickFlags: flags,
    generatedAt: '2026-06-13T09:00:00Z',
  };
}

export const mockFixtures: Fixture[] = [
  {
    fixtureId: 'fx_1',
    sportCode: 'football',
    competitionId: 'ucl',
    competitionName: 'UEFA Champions League',
    homeTeam: team('mci', 'Man City', 'MCI'),
    awayTeam: team('mun', 'Man United', 'MUN'),
    kickoffTime: '2026-06-13T20:00:00Z',
    status: 'scheduled',
    venue: 'Etihad Stadium',
    predictionSummary: summary('fx_1', 62, 23, 15, '2 - 1', 68, 'high', 'home_win', [
      'high_confidence',
      'over_25',
    ]),
  },
  {
    fixtureId: 'fx_2',
    sportCode: 'football',
    competitionId: 'epl',
    competitionName: 'Premier League',
    homeTeam: team('ars', 'Arsenal', 'ARS'),
    awayTeam: team('che', 'Chelsea', 'CHE'),
    kickoffTime: '2026-06-13T17:30:00Z',
    status: 'scheduled',
    venue: 'Emirates Stadium',
    predictionSummary: summary('fx_2', 48, 27, 25, '2 - 1', 54, 'medium', 'home_win', [
      'value_pick',
      'btts',
    ]),
  },
  {
    fixtureId: 'fx_3',
    sportCode: 'football',
    competitionId: 'laliga',
    competitionName: 'La Liga',
    homeTeam: team('rma', 'Real Madrid', 'RMA'),
    awayTeam: team('fcb', 'Barcelona', 'BAR'),
    kickoffTime: '2026-06-13T21:00:00Z',
    status: 'scheduled',
    venue: 'Santiago Bernabeu',
    predictionSummary: summary('fx_3', 42, 27, 31, '2 - 1', 61, 'medium', 'home_win', [
      'goal_heavy',
      'upset_watch',
    ]),
  },
  {
    fixtureId: 'fx_4',
    sportCode: 'football',
    competitionId: 'ligue1',
    competitionName: 'Ligue 1',
    homeTeam: team('psg', 'Paris Saint-Germain', 'PSG'),
    awayTeam: team('om', 'Marseille', 'OM'),
    kickoffTime: '2026-06-13T19:00:00Z',
    status: 'live',
    venue: 'Parc des Princes',
    liveState: { minute: 57, period: 'second_half', homeScore: 1, awayScore: 0 },
    predictionSummary: summary('fx_4', 64, 22, 14, '2 - 0', 71, 'high', 'home_win', [
      'high_confidence',
    ]),
  },
  {
    fixtureId: 'fx_5',
    sportCode: 'football',
    competitionId: 'epl',
    competitionName: 'Premier League',
    homeTeam: team('liv', 'Liverpool', 'LIV'),
    awayTeam: team('tot', 'Tottenham', 'TOT'),
    kickoffTime: '2026-06-14T16:00:00Z',
    status: 'scheduled',
    venue: 'Anfield',
    predictionSummary: summary('fx_5', 55, 24, 21, '2 - 1', 58, 'medium', 'home_win', [
      'over_25',
      'btts',
    ]),
  },
];

export const mockTopPick = mockFixtures[0];

export interface TrendingPick {
  id: string;
  title: string;
  market: string;
  odds: number;
  confidence: number;
  badge: 'hot' | 'value';
  /** Team name to render a crest for; falls back to a generic icon when absent. */
  crestName?: string;
}

export const mockTrending: TrendingPick[] = [
  { id: 't1', title: 'Man City Win', market: '1X2 Full Time', odds: 1.68, confidence: 72, badge: 'hot', crestName: 'Man City' },
  { id: 't2', title: 'Over 2.5 Goals', market: 'Total Goals', odds: 1.83, confidence: 69, badge: 'value' },
];

export type NewsKind = 'injury' | 'lineup' | 'form';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  timeAgo: string;
  kind: NewsKind;
}

export const mockNews: NewsItem[] = [
  { id: 'n1', title: 'Key forward a late fitness doubt', summary: 'Home striker carrying a knock ahead of kickoff.', timeAgo: '2h ago', kind: 'injury' },
  { id: 'n2', title: 'Squad rotation expected', summary: 'Several changes likely after a busy schedule.', timeAgo: '4h ago', kind: 'lineup' },
  { id: 'n3', title: 'Strong home form continues', summary: 'Unbeaten across the last twelve at home.', timeAgo: '6h ago', kind: 'form' },
];

export function mockMatchPrediction(fixtureId: string): MatchPrediction {
  const fx = mockFixtures.find((f) => f.fixtureId === fixtureId) ?? mockFixtures[0];
  const s = fx.predictionSummary!;
  return {
    predictionId: s.predictionId,
    fixtureId: fx.fixtureId,
    modelVersion: s.modelVersion,
    generatedAt: s.generatedAt,
    predictedResult: s.predictedResult,
    homeWinProbability: s.homeWinProbability,
    drawProbability: s.drawProbability,
    awayWinProbability: s.awayWinProbability,
    confidenceScore: s.confidenceScore,
    confidenceLabel: s.confidenceLabel,
    expectedGoals: { homeXg: 2.1, awayXg: 1.25, totalXg: 3.35 },
    scorelines: [
      { score: '2 - 1', homeGoals: 2, awayGoals: 1, probability: 14, rank: 1 },
      { score: '1 - 1', homeGoals: 1, awayGoals: 1, probability: 12, rank: 2 },
      { score: '2 - 0', homeGoals: 2, awayGoals: 0, probability: 11, rank: 3 },
      { score: '1 - 0', homeGoals: 1, awayGoals: 0, probability: 9, rank: 4 },
      { score: '3 - 1', homeGoals: 3, awayGoals: 1, probability: 8, rank: 5 },
    ],
    markets: { over15: 82, over25: 61, over35: 34, under25: 39, bttsYes: 58, bttsNo: 42 },
    headline: `${fx.homeTeam.name} favoured at home`,
    summary:
      `${fx.homeTeam.name} carry stronger recent form and home advantage. The model leans to a ` +
      `narrow home win, though ${fx.awayTeam.name}'s counter-attack keeps both-teams-to-score live. ` +
      'Predictions are probabilistic and never guaranteed.',
    keyReasons: [
      {
        title: 'Home form',
        description: `${fx.homeTeam.name} unbeaten in their last 6 at home.`,
        impact: 'positive',
        strength: 0.8,
      },
      {
        title: 'Attacking output',
        description: 'Higher expected goals across recent fixtures.',
        impact: 'positive',
        strength: 0.7,
      },
    ],
    riskFactors: [
      {
        title: 'Key player doubt',
        description: 'A late fitness check could shift the lineup and the prediction.',
        impact: 'negative',
        strength: 0.5,
      },
    ],
  };
}
