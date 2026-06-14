import { useAuthStore, type AuthUser } from '@/core/auth/authStore';

import { BASE_URL, USE_MOCK } from './client';

/**
 * Auth API. Real mode calls the BFF `/v1/auth/*` endpoints and persists the
 * session (tokens in SecureStore via authStore). Mock mode skips the network and
 * sets a local dev session so the app is usable offline.
 */

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AuthUser;
}

async function authRequest(path: string, body: unknown): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const env = (await res.json().catch(() => null)) as { data?: AuthResponse; errors?: { message: string }[] } | null;
  if (!res.ok || !env?.data) {
    throw new Error(env?.errors?.[0]?.message ?? `Request failed (${res.status})`);
  }
  return env.data;
}

function mockSession(email: string, displayName = 'Player'): AuthResponse {
  const session = {
    accessToken: 'mock-access',
    refreshToken: 'mock-refresh',
    user: { userId: 'dev-user', displayName, email },
  };
  void useAuthStore.getState().setSession(session);
  return { ...session, expiresAt: '' };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  if (USE_MOCK) return mockSession(email);
  const data = await authRequest('/v1/auth/login', { email, password });
  await useAuthStore.getState().setSession(data);
  return data;
}

export async function register(email: string, password: string, displayName: string): Promise<AuthResponse> {
  if (USE_MOCK) return mockSession(email, displayName || 'Player');
  const data = await authRequest('/v1/auth/register', { email, password, displayName });
  await useAuthStore.getState().setSession(data);
  return data;
}

export async function logout(): Promise<void> {
  const rt = useAuthStore.getState().refreshToken;
  if (!USE_MOCK && rt) {
    try {
      await authRequest('/v1/auth/logout', { refreshToken: rt });
    } catch {
      /* best-effort; clear locally regardless */
    }
  }
  await useAuthStore.getState().clear();
}
