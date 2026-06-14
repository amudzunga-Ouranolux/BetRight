import { Image } from 'expo-image';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Check, ShieldCheck } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { sportIcons } from '@/core/theme/sportAssets';
import { useResponsive } from '@/core/theme/responsive';
import { useOnboardingStore } from '@/features/onboarding/onboardingStore';
import { OnboardingShell } from '@/features/onboarding/OnboardingShell';
import { BRText } from '@/components/primitives/BRText';

/** Dark glass surface used by the onboarding cards. */
const ONBOARDING_SURFACE = 'rgba(11,20,15,0.78)';
const CARD_BORDER = 'rgba(255,255,255,0.13)';

const SPORTS: { code: string; name: string }[] = [
  { code: 'football', name: 'Football' },
  { code: 'basketball', name: 'Basketball' },
  { code: 'tennis', name: 'Tennis' },
  { code: 'rugby', name: 'Rugby' },
  { code: 'cricket', name: 'Cricket' },
  { code: 'esports', name: 'Esports' },
];

interface CardSizes {
  width: number;
  height: number;
  icon: number;
  label: number;
  tick: number;
}

function SportCard({
  code,
  name,
  selected,
  onPress,
  sizes,
}: {
  code: string;
  name: string;
  selected: boolean;
  onPress: () => void;
  sizes: CardSizes;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={name}
      style={{ width: sizes.width }}
      testID={`sport-${code}`}
    >
      <Box
        borderRadius="lg"
        alignItems="center"
        justifyContent="center"
        gap="xs"
        borderWidth={selected ? 2 : 1}
        style={{
          height: sizes.height,
          backgroundColor: ONBOARDING_SURFACE,
          borderColor: selected ? theme.colors.primary : CARD_BORDER,
          ...(selected
            ? {
                shadowColor: theme.colors.primary,
                shadowOpacity: 0.22,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 0 },
                elevation: 4,
              }
            : null),
        }}
      >
        <Image source={sportIcons[code]} style={{ width: sizes.icon, height: sizes.icon }} contentFit="contain" />
        <BRText
          style={{
            fontSize: sizes.label,
            fontWeight: '600',
            color: selected ? theme.colors.primary : theme.colors.textPrimary,
          }}
        >
          {name}
        </BRText>
        {selected && (
          <Box
            position="absolute"
            style={{ top: theme.spacing.sm, right: theme.spacing.sm }}
            width={sizes.tick}
            height={sizes.tick}
            borderRadius="pill"
            alignItems="center"
            justifyContent="center"
            backgroundColor="primary"
          >
            <Check size={sizes.tick * 0.6} color={theme.colors.onPrimary} strokeWidth={3} />
          </Box>
        )}
      </Box>
    </Pressable>
  );
}

export default function ChooseSports() {
  const theme = useTheme();
  const r = useResponsive();
  const sports = useOnboardingStore((s) => s.sports);
  const toggleSport = useOnboardingStore((s) => s.toggleSport);

  // Height-aware sizing: shrink cards/icons/labels on shorter phones so all six
  // stay visible. Width drives the two-column card width directly (true grid).
  const h = r.height;
  const gridGap = h < 740 ? r.s(8) : r.s(10);
  const contentWidth = r.width - theme.spacing.xl * 2;
  const cardWidth = (contentWidth - gridGap) / 2;
  const cardHeight = h >= 820 ? r.s(112) : h >= 740 ? r.s(98) : r.s(86);
  const iconSize = h >= 820 ? r.s(50) : h >= 740 ? r.s(44) : r.s(38);
  const labelSize = h >= 820 ? r.s(14) : h >= 740 ? r.s(13) : r.s(12);
  const noteHeight = h >= 820 ? r.s(56) : h >= 740 ? r.s(48) : r.s(42);
  const tickSize = h >= 820 ? r.s(24) : r.s(22);

  const sizes: CardSizes = {
    width: cardWidth,
    height: cardHeight,
    icon: iconSize,
    label: labelSize,
    tick: tickSize,
  };

  const noteText =
    h < 740
      ? 'Update your choices anytime in settings.'
      : 'You can update your choices anytime in settings.';

  return (
    <OnboardingShell
      step={0}
      total={5}
      title="Choose Sports"
      subtitle="Select the sports you love. We'll personalize your experience."
      onNext={() => router.push('/onboarding/favourites')}
      canContinue={sports.length > 0}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: gridGap }}>
          {SPORTS.map((sport) => (
            <SportCard
              key={sport.code}
              code={sport.code}
              name={sport.name}
              selected={sports.includes(sport.code)}
              onPress={() => toggleSport(sport.code)}
              sizes={sizes}
            />
          ))}
        </View>

        <Box
          flexDirection="row"
          alignItems="center"
          gap="md"
          marginTop="lg"
          paddingHorizontal="md"
          borderRadius="md"
          borderWidth={1}
          style={{
            height: noteHeight,
            backgroundColor: ONBOARDING_SURFACE,
            borderColor: theme.colors.primary + '29',
          }}
        >
          <ShieldCheck size={r.s(24)} color={theme.colors.primary} strokeWidth={2} />
          <BRText variant="bodySmall" style={{ flex: 1, color: theme.colors.textSecondary }}>
            {noteText}
          </BRText>
        </Box>
      </ScrollView>
    </OnboardingShell>
  );
}
