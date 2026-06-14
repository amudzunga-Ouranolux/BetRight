import { create } from 'zustand';

import { deleteToken, getToken, setToken } from './tokenStorage';

const ACCESS_KEY = 'betright.accessToken';
const REFRESH_KEY = 'betright.refreshToken';
const USER_KEY = 'betright.user';

export interface AuthUser {
  userId: string;
  displayName: string;
  email?: string | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  /** True once a session exists (real or mock). */
  isAuthenticated: () => boolean;
  hydrate: () => Promise<void>;
  setSession: (s: { accessToken: string; refreshToken: string; user: AuthUser }) => Promise<void>;
  /** Update just the tokens after a refresh, keeping the user. */
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  clear: () => Promise<void>;
}

/**
 * Auth session store. Tokens live in SecureStore (see tokenStorage); the in-memory
 * copy here is what `client.ts` reads to attach the Bearer header. `client.ts`
 * reads/writes this via `useAuthStore.getState()` (outside React).
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  hydrated: false,

  isAuthenticated: () => !!get().accessToken,

  hydrate: async () => {
    const [accessToken, refreshToken, userJson] = await Promise.all([
      getToken(ACCESS_KEY),
      getToken(REFRESH_KEY),
      getToken(USER_KEY),
    ]);
    set({
      accessToken,
      refreshToken,
      user: userJson ? (JSON.parse(userJson) as AuthUser) : null,
      hydrated: true,
    });
  },

  setSession: async ({ accessToken, refreshToken, user }) => {
    set({ accessToken, refreshToken, user });
    await Promise.all([
      setToken(ACCESS_KEY, accessToken),
      setToken(REFRESH_KEY, refreshToken),
      setToken(USER_KEY, JSON.stringify(user)),
    ]);
  },

  setTokens: async (accessToken, refreshToken) => {
    set({ accessToken, refreshToken });
    await Promise.all([setToken(ACCESS_KEY, accessToken), setToken(REFRESH_KEY, refreshToken)]);
  },

  clear: async () => {
    set({ accessToken: null, refreshToken: null, user: null });
    await Promise.all([deleteToken(ACCESS_KEY), deleteToken(REFRESH_KEY), deleteToken(USER_KEY)]);
  },
}));
