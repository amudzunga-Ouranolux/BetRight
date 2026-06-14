import { Redirect } from 'expo-router';

import { storage } from '@/core/storage/mmkv';

/**
 * Boot entry. First-time users go through auth -> onboarding; returning users
 * (who completed onboarding) land in the main tab app. Auth wiring is UI-only
 * for now; the onboarded flag is persisted in MMKV at the end of onboarding.
 */
export default function Index() {
  const onboarded = storage.getString('betright.onboarded') === 'true';
  return <Redirect href={onboarded ? '/(tabs)/home' : '/auth/login'} />;
}
