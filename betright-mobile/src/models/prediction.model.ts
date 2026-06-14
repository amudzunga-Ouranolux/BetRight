import { z } from 'zod';

export const matchOutcomeSchema = z.enum(['home_win', 'draw', 'away_win']);
export type MatchOutcome = z.infer<typeof matchOutcomeSchema>;

export const confidenceLabelSchema = z.enum([
  'low',
  'medium_low',
  'medium',
  'high',
  'very_high',
]);
export type ConfidenceLabel = z.infer<typeof confidenceLabelSchema>;

export const predictionFlagSchema = z.enum([
  'high_confidence',
  'value_pick',
  'risky_favourite',
  'likely_draw',
  'goal_heavy',
  'upset_watch',
  'over_25',
  'btts',
]);
export type PredictionFlag = z.infer<typeof predictionFlagSchema>;

/** Per-market probabilities surfaced on list rows when a market filter is active. */
export const summaryMarketsSchema = z.object({
  over25: z.number(),
  over35: z.number(),
  btts: z.number(),
  cleanSheetHome: z.number(),
  cleanSheetAway: z.number(),
});
export type SummaryMarkets = z.infer<typeof summaryMarketsSchema>;

/** Compact prediction shown on cards and list rows. */
export const predictionSummarySchema = z.object({
  predictionId: z.string(),
  fixtureId: z.string(),
  modelVersion: z.string(),
  predictedResult: matchOutcomeSchema,
  confidenceScore: z.number(),
  confidenceLabel: confidenceLabelSchema,
  likelyScore: z.string(),
  homeWinProbability: z.number(),
  drawProbability: z.number(),
  awayWinProbability: z.number(),
  markets: summaryMarketsSchema.optional(),
  quickFlags: z.array(predictionFlagSchema),
  generatedAt: z.string(),
});
export type PredictionSummary = z.infer<typeof predictionSummarySchema>;

export const scorelineProbabilitySchema = z.object({
  score: z.string(),
  homeGoals: z.number(),
  awayGoals: z.number(),
  probability: z.number(),
  rank: z.number(),
});
export type ScorelineProbability = z.infer<typeof scorelineProbabilitySchema>;

export const expectedGoalsSchema = z.object({
  homeXg: z.number(),
  awayXg: z.number(),
  totalXg: z.number(),
});
export type ExpectedGoals = z.infer<typeof expectedGoalsSchema>;

export const predictionMarketsSchema = z.object({
  over15: z.number(),
  over25: z.number(),
  over35: z.number(),
  under25: z.number(),
  bttsYes: z.number(),
  bttsNo: z.number(),
});
export type PredictionMarkets = z.infer<typeof predictionMarketsSchema>;

export const explanationReasonSchema = z.object({
  title: z.string(),
  description: z.string(),
  impact: z.enum(['positive', 'negative', 'neutral']),
  strength: z.number(),
});
export type ExplanationReason = z.infer<typeof explanationReasonSchema>;

/** Full breakdown used on Match Detail and Manual Predict result. */
export const matchPredictionSchema = z.object({
  predictionId: z.string(),
  fixtureId: z.string(),
  modelVersion: z.string(),
  generatedAt: z.string(),
  predictedResult: matchOutcomeSchema,
  homeWinProbability: z.number(),
  drawProbability: z.number(),
  awayWinProbability: z.number(),
  confidenceScore: z.number(),
  confidenceLabel: confidenceLabelSchema,
  expectedGoals: expectedGoalsSchema,
  scorelines: z.array(scorelineProbabilitySchema),
  markets: predictionMarketsSchema,
  headline: z.string(),
  summary: z.string(),
  keyReasons: z.array(explanationReasonSchema),
  riskFactors: z.array(explanationReasonSchema),
});
export type MatchPrediction = z.infer<typeof matchPredictionSchema>;
