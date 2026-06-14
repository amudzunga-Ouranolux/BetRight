import { QueryClient } from '@tanstack/react-query';

/**
 * Shared TanStack Query client. Server state lives here (never in Zustand).
 * Conservative defaults suited to a prediction feed that refreshes on open.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
