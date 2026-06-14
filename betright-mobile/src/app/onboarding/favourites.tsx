import { router } from 'expo-router';

import { useKitVariant } from '@/core/theme/variants';
import { useOnboardingStore } from '@/features/onboarding/onboardingStore';
import { OnboardingShell } from '@/features/onboarding/OnboardingShell';
import {
  FAVOURITES_SELECTOR_SLOT,
  type FavouritesSelectorProps,
} from '@/components/variants/favourites-selector';

/**
 * Choose Favourites — the per-kit divergent step. Home/Third render stacked
 * checklists; Away renders segmented tabs. Same props, resolved by the kit.
 */
export default function ChooseFavourites() {
  const value = useOnboardingStore((s) => s.favourites);
  const setFavourites = useOnboardingStore((s) => s.setFavourites);
  const FavSelector = useKitVariant<FavouritesSelectorProps>(FAVOURITES_SELECTOR_SLOT);

  const total = value.leagues.length + value.competitions.length + value.teams.length;

  return (
    <OnboardingShell
      step={1}
      total={5}
      title="Choose Favourites"
      subtitle="Select the leagues, competitions and teams you want analysed."
      onNext={() => router.push('/onboarding/interests')}
      canContinue={total > 0}
    >
      <FavSelector value={value} onChange={setFavourites} />
    </OnboardingShell>
  );
}
