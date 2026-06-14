import { z } from 'zod';

/**
 * Standard BetRight API envelope (per the API contract skill). Every response
 * wraps its payload in `data`, with `meta` + `errors`. The mock transport produces
 * the same shape so the real BFF swap is transparent to callers.
 */
export const apiMetaSchema = z.object({
  requestId: z.string(),
  generatedAt: z.string(),
  cacheStatus: z.enum(['hit', 'miss', 'mock']).optional(),
});

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export function envelopeSchema<T extends z.ZodTypeAny>(data: T) {
  return z.object({
    data,
    meta: apiMetaSchema,
    errors: z.array(apiErrorSchema),
  });
}

export interface ApiEnvelope<T> {
  data: T;
  meta: z.infer<typeof apiMetaSchema>;
  errors: ApiError[];
}
