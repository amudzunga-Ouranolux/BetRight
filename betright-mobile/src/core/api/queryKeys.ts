/** Centralised TanStack Query keys so invalidation stays consistent. */
export const queryKeys = {
  home: ['home'] as const,
  matches: (filter?: string) => ['matches', filter ?? 'all'] as const,
  matchDetail: (fixtureId: string) => ['match', fixtureId] as const,
  favourites: ['favourites'] as const,
  savedPredictions: ['saved-predictions'] as const,
  notifications: ['notifications'] as const,
};
