import { Platform } from 'react-native';

import { storage } from '@/core/storage/mmkv';

/**
 * Secure token storage. Uses Expo SecureStore (Keychain / Keystore) on device so
 * auth tokens are never in plain storage; falls back to the web key-value shim for
 * browser review (`expo start --web`). Async to match SecureStore's API.
 */

async function nativeSecureStore() {
  // Lazily required so the web bundle never touches the native module.
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy load keeps the native module out of web bundles
  return require('expo-secure-store') as typeof import('expo-secure-store');
}

export async function setToken(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    storage.set(key, value);
    return;
  }
  const SecureStore = await nativeSecureStore();
  await SecureStore.setItemAsync(key, value);
}

export async function getToken(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return storage.getString(key) ?? null;
  }
  const SecureStore = await nativeSecureStore();
  return SecureStore.getItemAsync(key);
}

export async function deleteToken(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    storage.delete(key);
    return;
  }
  const SecureStore = await nativeSecureStore();
  await SecureStore.deleteItemAsync(key);
}
