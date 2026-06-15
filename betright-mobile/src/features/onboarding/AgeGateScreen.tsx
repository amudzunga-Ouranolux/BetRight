import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { setCompliance } from '@/core/api/hooks';
import { OnboardingShell } from '@/features/onboarding/OnboardingShell';
import { BRText } from '@/components/primitives/BRText';
import { BRChip } from '@/components/primitives/BRChip';

const REGIONS = [
  { code: 'uk', label: 'United Kingdom' },
  { code: 'eu', label: 'Europe' },
  { code: 'us', label: 'United States' },
  { code: 'za', label: 'South Africa' },
  { code: 'other', label: 'Other' },
];

/**
 * Age + region gate. BetRight is prediction intelligence, not gambling — but we
 * still confirm the user is an adult and capture their region (the backend is the
 * source of truth for compliance). Continue is disabled until 18+ is confirmed.
 */
export function AgeGateScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const [adult, setAdult] = useState(false);
  const [region, setRegion] = useState('uk');

  const next = () => {
    void setCompliance(true, region);
    router.replace('/onboarding/sports');
  };

  return (
    <OnboardingShell
      step={0}
      total={6}
      title="Before you start"
      subtitle="Confirm your age and region. BetRight is prediction intelligence, not betting."
      onNext={next}
      onBack={() => router.replace('/auth/register')}
      backLabel="Back"
      canContinue={adult}
    >
      <View style={{ gap: theme.spacing.lg }}>
        <Pressable onPress={() => setAdult((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked: adult }}>
          <Box flexDirection="row" alignItems="center" gap="md">
            <Box
              width={r.s(22)}
              height={r.s(22)}
              borderRadius="xs"
              alignItems="center"
              justifyContent="center"
              borderWidth={1.5}
              style={{
                backgroundColor: adult ? theme.colors.primary : 'transparent',
                borderColor: adult ? theme.colors.primary : theme.colors.border,
              }}
            >
              {adult && <Check size={r.s(14)} color={theme.colors.onPrimary} strokeWidth={3} />}
            </Box>
            <BRText variant="bodySmall" style={{ flex: 1, color: theme.colors.textPrimary }}>
              I confirm I am 18 years or older.
            </BRText>
          </Box>
        </Pressable>

        <Box gap="sm">
          <BRText variant="label">Your region</BRText>
          <Box flexDirection="row" flexWrap="wrap" gap="sm">
            {REGIONS.map((reg) => (
              <BRChip key={reg.code} label={reg.label} selected={region === reg.code} onPress={() => setRegion(reg.code)} />
            ))}
          </Box>
        </Box>

        <BRText variant="caption" style={{ color: theme.colors.textSecondary }}>
          Predictions are probabilistic and for entertainment and analysis only.
        </BRText>
      </View>
    </OnboardingShell>
  );
}
