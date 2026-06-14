import { z } from 'zod';

import { predictionSummarySchema } from './prediction.model';
import { sportCodeSchema, teamSummarySchema } from './team.model';

export const fixtureStatusSchema = z.enum([
  'scheduled',
  'live',
  'halftime',
  'finished',
  'postponed',
  'cancelled',
]);
export type FixtureStatus = z.infer<typeof fixtureStatusSchema>;

export const liveMatchStateSchema = z.object({
  minute: z.number().optional(),
  period: z
    .enum(['first_half', 'halftime', 'second_half', 'extra_time', 'penalties'])
    .optional(),
  homeScore: z.number(),
  awayScore: z.number(),
});
export type LiveMatchState = z.infer<typeof liveMatchStateSchema>;

export const fixtureSchema = z.object({
  fixtureId: z.string(),
  sportCode: sportCodeSchema,
  competitionId: z.string(),
  competitionName: z.string(),
  homeTeam: teamSummarySchema,
  awayTeam: teamSummarySchema,
  kickoffTime: z.string(),
  status: fixtureStatusSchema,
  venue: z.string().optional(),
  liveState: liveMatchStateSchema.optional(),
  predictionSummary: predictionSummarySchema.optional(),
});
export type Fixture = z.infer<typeof fixtureSchema>;
