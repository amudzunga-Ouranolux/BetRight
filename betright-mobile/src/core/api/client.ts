import type { ApiEnvelope } from './envelope';

/**
 * Mock transport. The ONLY place that knows data is local. Returns the standard
 * API envelope after a small delay to exercise loading states. Swap this module
 * for an axios-backed client against the .NET BFF later — call sites don't change.
 */

let requestCounter = 0;

function wrap<T>(data: T): ApiEnvelope<T> {
  requestCounter += 1;
  return {
    data,
    meta: {
      requestId: `mock_${requestCounter}`,
      generatedAt: '2026-06-13T09:00:00Z',
      cacheStatus: 'mock',
    },
    errors: [],
  };
}

export async function mockGet<T>(produce: () => T, delayMs = 350): Promise<ApiEnvelope<T>> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return wrap(produce());
}
