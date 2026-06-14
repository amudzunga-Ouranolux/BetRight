import { Image, ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, ChevronLeft } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { kitAssets } from '@/core/theme/assets';
import { onboardingStadiumBg } from '@/core/theme/sportAssets';
import { useResponsive } from '@/core/theme/responsive';
import { useThemeStore } from '@/core/theme/themeStore';
import { BRText } from '@/components/primitives/BRText';

/** Dark stadium overlay gradient (top glow -> black base for legibility). */
const OVERLAY_COLORS = ['rgba(0,0,0,0.18)', 'rgba(0,0,0,0.45)', 'rgba(1,4,3,0.82)', 'rgba(1,4,3,0.97)'] as const;
const OVERLAY_STOPS = [0, 0.28, 0.6, 1] as const;
const PILL_BG = 'rgba(10,18,13,0.86)';
const SECONDARY_BTN_BG = 'rgba(11,20,15,0.72)';
const SECONDARY_BTN_BORDER = 'rgba(255,255,255,0.16)';

export interface OnboardingShellProps {
  step: number;
  total: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onNext: () => void;
  nextLabel?: string;
  /** Left action. Defaults: step 0 -> "Skip", otherwise "Back". */
  onBack?: () => void;
  backLabel?: string;
  canContinue?: boolean;
}

/**
 * Premium stadium-lit onboarding frame (Home/Lime kit reference). Stadium photo
 * sits behind a dark gradient so the upper half glows and the lower half stays
 * black for legibility. All sizing flows through the responsive scalers.
 */
export function OnboardingShell({
  step,
  total,
  title,
  subtitle,
  children,
  onNext,
  nextLabel = 'Next',
  onBack,
  backLabel,
  canContinue = true,
}: OnboardingShellProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const r = useResponsive();
  const kitId = useThemeStore((s) => s.kitId);
  const isFirst = step === 0;
  const leftLabel = backLabel ?? (isFirst ? 'Skip' : 'Back');
  const handleLeft = onBack ?? (isFirst ? () => router.replace('/(tabs)/home') : () => router.back());

  const padX = theme.spacing.xl;
  const logoWidth = r.s(150);
  const logoHeight = logoWidth / kitAssets[kitId].logoAR;
  const lineWidth = r.s(96);
  const buttonHeight = r.s(46);
  const iconSm = r.s(26);
  const iconMd = r.s(16);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style="light" />
      <ImageBackground source={onboardingStadiumBg} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" />
      <LinearGradient colors={OVERLAY_COLORS} locations={OVERLAY_STOPS} style={StyleSheet.absoluteFill} />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + theme.spacing.sm,
          paddingBottom: Math.max(insets.bottom, theme.spacing.lg) + theme.spacing.sm,
          paddingHorizontal: padX,
        }}
      >
        {/* Logo + back arrow */}
        <View style={{ height: logoHeight, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={kitAssets[kitId].logoFull} style={{ width: logoWidth, height: logoHeight }} contentFit="contain" />
          {!isFirst && (
            <Pressable
              onPress={handleLeft}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={theme.spacing.sm}
              style={{ position: 'absolute', left: 0 }}
            >
              <ChevronLeft size={iconSm} color={theme.colors.textPrimary} strokeWidth={2.25} />
            </Pressable>
          )}
        </View>

        {/* Step indicator pill */}
        <Box flexDirection="row" alignItems="center" justifyContent="center" gap="sm" marginTop="lg">
          <Box flex={1} height={1} style={{ maxWidth: lineWidth, backgroundColor: theme.colors.primary, opacity: 0.35 }} />
          <Box
            paddingHorizontal="md"
            paddingVertical="xs"
            borderRadius="pill"
            borderWidth={1}
            style={{ backgroundColor: PILL_BG, borderColor: theme.colors.primary + '47' }}
          >
            <BRText variant="label" style={{ color: theme.colors.primary }}>
              {step + 1} OF {total}
            </BRText>
          </Box>
          <Box flex={1} height={1} style={{ maxWidth: lineWidth, backgroundColor: theme.colors.primary, opacity: 0.35 }} />
        </Box>

        {/* Title block */}
        <Box marginTop="lg" marginBottom="lg">
          <BRText variant="display">{title}</BRText>
          <BRText variant="bodySmall" marginTop="xs" style={{ color: theme.colors.textSecondary, maxWidth: r.s(320) }}>
            {subtitle}
          </BRText>
        </Box>

        {/* Content */}
        <View style={{ flex: 1 }}>{children}</View>

        {/* Bottom actions */}
        <Box flexDirection="row" gap="md" marginTop="md">
          <Pressable onPress={handleLeft} accessibilityRole="button" accessibilityLabel={leftLabel} style={{ flex: 1 }}>
            <Box
              height={buttonHeight}
              borderRadius="md"
              alignItems="center"
              justifyContent="center"
              borderWidth={1}
              style={{ backgroundColor: SECONDARY_BTN_BG, borderColor: SECONDARY_BTN_BORDER }}
            >
              <BRText variant="bodySmall" style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>
                {leftLabel}
              </BRText>
            </Box>
          </Pressable>
          <Pressable
            onPress={onNext}
            disabled={!canContinue}
            accessibilityRole="button"
            accessibilityLabel={nextLabel}
            accessibilityState={{ disabled: !canContinue }}
            style={{ flex: 1.1 }}
          >
            <Box
              flexDirection="row"
              height={buttonHeight}
              borderRadius="md"
              alignItems="center"
              justifyContent="center"
              gap="sm"
              style={{ backgroundColor: theme.colors.primary, opacity: canContinue ? 1 : 0.4 }}
            >
              <BRText variant="bodySmall" style={{ color: theme.colors.onPrimary, fontWeight: '700' }}>
                {nextLabel}
              </BRText>
              <ArrowRight size={iconMd} color={theme.colors.onPrimary} strokeWidth={2.5} />
            </Box>
          </Pressable>
        </Box>
      </View>
    </View>
  );
}
