import { Platform } from 'react-native';

/**
 * Synchronous key-value storage used for UI preferences (active kit, onboarding
 * flag, odds format). MMKV on native; a localStorage/in-memory shim on web so the
 * dev Kit Gallery can be reviewed via `expo start --web` without a native build.
 */
export interface KvStorage {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
}

function createNativeStorage(): KvStorage {
  // Lazily required so web bundles never touch the native module.
  // MMKV v4 (Nitro): instances are created via createMMKV(), not `new MMKV()`.
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy load keeps the native module out of web bundles
  const { createMMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
  const mmkv = createMMKV({ id: 'betright-prefs' });
  return {
    getString: (k) => mmkv.getString(k) ?? undefined,
    set: (k, v) => mmkv.set(k, v),
    delete: (k) => {
      mmkv.remove(k);
    },
  };
}

function createWebStorage(): KvStorage {
  const mem = new Map<string, string>();
  const ls: Storage | undefined =
    typeof globalThis !== 'undefined' ? (globalThis as { localStorage?: Storage }).localStorage : undefined;
  return {
    getString: (k) => (ls ? (ls.getItem(k) ?? undefined) : mem.get(k)),
    set: (k, v) => (ls ? ls.setItem(k, v) : void mem.set(k, v)),
    delete: (k) => (ls ? ls.removeItem(k) : void mem.delete(k)),
  };
}

export const storage: KvStorage = Platform.OS === 'web' ? createWebStorage() : createNativeStorage();
