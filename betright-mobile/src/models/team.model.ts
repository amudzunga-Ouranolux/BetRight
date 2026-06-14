import { z } from 'zod';

export const sportCodeSchema = z.enum([
  'football',
  'basketball',
  'tennis',
  'rugby',
  'cricket',
  'esports',
  'formula1',
  'mma',
]);
export type SportCode = z.infer<typeof sportCodeSchema>;

export const teamSummarySchema = z.object({
  teamId: z.string(),
  name: z.string(),
  shortName: z.string().optional(),
  logoUrl: z.string().optional(),
});
export type TeamSummary = z.infer<typeof teamSummarySchema>;

export const competitionSchema = z.object({
  competitionId: z.string(),
  sportCode: sportCodeSchema,
  name: z.string(),
  countryCode: z.string().optional(),
  type: z.enum(['league', 'cup', 'tournament', 'international']),
  logoUrl: z.string().optional(),
});
export type Competition = z.infer<typeof competitionSchema>;
