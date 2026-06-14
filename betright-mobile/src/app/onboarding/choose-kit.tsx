import { ScrollView } from 'react-native';
import { router } from 'expo-router';

import { Box } from '@/core/theme/restyle';
import { useThemeStore } from '@/core/theme/themeStore';
import { storage } from '@/core/storage/mmkv';
import { saveFavourites, savePreferences } from '@/core/api/hooks';
import { useOnboardingStore } from '@/features/onboarding/onboardingStore';
import { KIT_IDS } from '@/models/theme.model';
import { OnboardingShell } from '@/features/onboarding/OnboardingShell';
import { ThemePreviewCard } from '@/components/cards/ThemePreviewCard';

export default function ChooseKit() {
  const kitId = useThemeStore((s) => s.kitId);
  const setKit = useThemeStore((s) => s.setKit);
  const favourites = useOnboardingStore((s) => s.favourites);

  const finish = () => {
    // Persist the user's picks (no-op in mock mode); don't block navigation on it.
    void saveFavourites(favourites.teams, [...favourites.leagues, ...favourites.competitions]);
    void savePreferences({
      oddsFormat: 'decimal',
      kitId,
      textSize: 'default',
      notifyPredictions: true,
      notifyResults: true,
      notifyNews: false,
    });
    storage.set('betright.onboarded', 'true');
    router.replace('/(tabs)/home');
  };

  return (
    <OnboardingShell
      step={4}
      total={5}
      title="Choose Your Kit"
      subtitle="Pick the look your app wears. You can switch kits anytime."
      onNext={finish}
      nextLabel="Enter"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box flexDirection="row" flexWrap="wrap" gap="md">
          {KIT_IDS.map((id) => (
            <Box key={id} style={{ width: '47%' }}>
              <ThemePreviewCard kitId={id} selected={id === kitId} onSelect={() => setKit(id)} />
            </Box>
          ))}
        </Box>
      </ScrollView>
    </OnboardingShell>
  );
}
