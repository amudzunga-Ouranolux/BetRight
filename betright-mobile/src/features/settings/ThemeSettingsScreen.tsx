import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { Box } from '@/core/theme/restyle';
import { useThemeStore } from '@/core/theme/themeStore';
import { usePrefsStore, TEXT_SCALE, type TextSizeMode } from '@/core/prefs/prefsStore';
import { KIT_IDS } from '@/models/theme.model';
import { Screen } from '@/components/layout/Screen';
import { BRText } from '@/components/primitives/BRText';
import { BRIconButton } from '@/components/primitives/BRIconButton';
import { SegmentedTabs } from '@/components/inputs/SegmentedTabs';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { ThemePreviewCard } from '@/components/cards/ThemePreviewCard';

const TEXT_SIZE_OPTIONS: { value: TextSizeMode; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'default', label: 'Default' },
  { value: 'large', label: 'Large' },
];

function modeForScale(scale: number): TextSizeMode {
  return (Object.keys(TEXT_SCALE) as TextSizeMode[]).find((m) => TEXT_SCALE[m] === scale) ?? 'default';
}

/**
 * The kit chooser. Live preview cards rendered in each kit's own tokens; tapping
 * one switches the whole app with a cross-fade. Built early so every later screen
 * validates against it.
 */
export function ThemeSettingsScreen() {
  const kitId = useThemeStore((s) => s.kitId);
  const setKit = useThemeStore((s) => s.setKit);
  const textScale = usePrefsStore((s) => s.textScale);
  const setTextScale = usePrefsStore((s) => s.setTextScale);

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Appearance"
        title="Choose Your Theme"
        subtitle="Pick the kit your app wears. Change it anytime."
        right={
          router.canGoBack() ? (
            <BRIconButton icon={ChevronLeft} accessibilityLabel="Back" onPress={() => router.back()} />
          ) : undefined
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        <Box flexDirection="row" gap="md" flexWrap="wrap">
          {KIT_IDS.map((id) => (
            <Box key={id} style={{ width: '47%' }}>
              <ThemePreviewCard
                kitId={id}
                selected={id === kitId}
                onSelect={() => setKit(id)}
                testID={`theme-preview-${id}`}
              />
            </Box>
          ))}
        </Box>

        <Box marginTop="xl">
          <BRText variant="bodySmall" marginBottom="sm" style={{ fontWeight: '700' }}>
            Text Size
          </BRText>
          <SegmentedTabs
            options={TEXT_SIZE_OPTIONS}
            value={modeForScale(textScale)}
            onChange={(mode) => setTextScale(TEXT_SCALE[mode])}
          />
        </Box>

        <Box marginTop="xl" padding="lg" borderRadius="lg" backgroundColor="surfaceAlt">
          <BRText variant="title" marginBottom="xs">
            Three kits, one app
          </BRText>
          <BRText variant="bodySmall">
            Home is carbon and volt lime. Away is a light teal-glass look. Third is red energy on
            black. Some screens change layout between kits, not just colour.
          </BRText>
        </Box>
      </ScrollView>
    </Screen>
  );
}
