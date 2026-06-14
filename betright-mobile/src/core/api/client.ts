import type { ApiEnvelope } from './envelope';

/**
 * API transport. The ONE place that knows where data comes from.
 *
 * Two modes, chosen at build time by env (Expo inlines EXPO_PUBLIC_*):
 *   - mock (default): returns local sample data in the standard envelope, so the
 *     app runs with no backend.
 *   - live: HTTP calls to the .NET BFF (which fronts the Python ML service).
 *
 * Call sites use `getData` / `postData` and pass a mock producer as the fallback,
 * so flipping EXPO_PUBLIC_USE_MOCK=false switches the whole app to the real API
 * without touching any screen or hook body.
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';
export const USE_MOCK = (process.env.EXPO_PUBLIC_USE_MOCK ?? 'true') !== 'false';

let requestCounter = 0;

function wrap<T>(data: T): ApiEnvelope<T> {
  requestCounter += 1;
  return {
    data,
    meta: { requestId: `mock_${requestCounter}`, generatedAt: '2026-06-13T09:00:00Z', cacheStatus: 'mock' },
    errors: [],
  };
}

/** Mock transport: wrap a locally-produced payload in the standard envelope. */
export async function mockGet<T>(produce: () => T, delayMs = 350): Promise<ApiEnvelope<T>> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return wrap(produce());
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!res.ok || !body) {
    const message = body?.errors?.[0]?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body;
}

/** GET `path` from the BFF, or fall back to the mock producer when in mock mode. */
export async function getData<T>(path: string, mock: () => T): Promise<T> {
  if (USE_MOCK) return (await mockGet(mock)).data;
  return (await request<T>(path)).data;
}

/** POST `body` to `path` on the BFF, or return the mock producer's result in mock mode. */
export async function postData<T>(path: string, payload: unknown, mock: () => T): Promise<T> {
  if (USE_MOCK) return (await mockGet(mock)).data;
  return (await request<T>(path, { method: 'POST', body: JSON.stringify(payload) })).data;
}

/** DELETE `path` on the BFF, or return the mock producer's result in mock mode. */
export async function deleteData<T>(path: string, mock: () => T): Promise<T> {
  if (USE_MOCK) return (await mockGet(mock)).data;
  return (await request<T>(path, { method: 'DELETE' })).data;
}
