import { createTheme } from '@shopify/restyle';

import type { KitId } from '@/models/theme.model';

import { homePalette, awayPalette, thirdPalette, outcomeRamp, AWAY_ACCENT } from './palette';
import { spacing, radii, typeScale } from './tokens';

/** Inter weight-specific font families (loaded in app/_layout.tsx). */
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

/**
 * Per-kit inputs that vary; everything else (spacing, radii, type scale, variant
 * structure) is shared so all three themes share one shape and can be swapped at
 * runtime through the Restyle ThemeProvider.
 */
interface KitInput {
  themeId: KitId;
  name: string;
  mode: 'dark' | 'light';
  accentStyle: 'soft' | 'vibrant' | 'neon';
  logoVariant: 'home' | 'away' | 'third';
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    surfaceElevated: string;
    primary: string;
    primaryMuted: string;
    secondary: string;
    onPrimary: string;
    success: string;
    warning: string;
    danger: string;
    textPrimary: string;
    textSecondary: string;
    textInverse: string;
    border: string;
    borderStrong: string;
    overlay: string;
    glow: string;
    outcomeHome: string;
    outcomeDraw: string;
    outcomeAway: string;
  };
  effects: {
    glowEnabled: boolean;
    blurEnabled: boolean;
    gradientEnabled: boolean;
    glowColor: string;
  };
  gradients: {
    accent: readonly [string, string];
    cta: readonly [string, string];
    card: readonly [string, string];
    hero: readonly [string, string];
  };
  charts: {
    skeletonBase: string;
    skeletonHighlight: string;
    confidenceTrack: string;
    xgHome: string;
    xgAway: string;
  };
}

const makeTheme = (kit: KitInput) =>
  createTheme({
    colors: {
      ...kit.colors,
      transparent: 'transparent',
    },
    spacing,
    borderRadii: radii,
    textVariants: {
      defaults: {
        color: 'textPrimary',
        fontFamily: fonts.regular,
        fontSize: typeScale.body.fontSize,
        lineHeight: typeScale.body.lineHeight,
      },
      display: { ...typeScale.display, fontFamily: fonts.extrabold, color: 'textPrimary' },
      h1: { ...typeScale.h1, fontFamily: fonts.bold, color: 'textPrimary' },
      h2: { ...typeScale.h2, fontFamily: fonts.bold, color: 'textPrimary' },
      title: { ...typeScale.title, fontFamily: fonts.semibold, color: 'textPrimary' },
      body: { ...typeScale.body, fontFamily: fonts.regular, color: 'textPrimary' },
      bodySmall: { ...typeScale.bodySmall, fontFamily: fonts.regular, color: 'textSecondary' },
      caption: { ...typeScale.caption, fontFamily: fonts.regular, color: 'textSecondary' },
      label: {
        ...typeScale.label,
        fontFamily: fonts.semibold,
        letterSpacing: 0.2,
        color: 'textSecondary',
      },
      numberLg: {
        ...typeScale.numberLg,
        fontFamily: fonts.extrabold,
        fontVariant: ['tabular-nums'],
        color: 'textPrimary',
      },
      numberMd: {
        ...typeScale.numberMd,
        fontFamily: fonts.bold,
        fontVariant: ['tabular-nums'],
        color: 'textPrimary',
      },
      button: { ...typeScale.body, fontFamily: fonts.bold, color: 'onPrimary' },
    },
    cardVariants: {
      defaults: {
        backgroundColor: 'surface',
        borderRadius: 'lg',
        padding: 'lg',
        borderWidth: 1,
        borderColor: 'border',
      },
      elevated: {
        backgroundColor: 'surfaceElevated',
        borderRadius: 'lg',
        padding: 'lg',
        borderWidth: 1,
        borderColor: 'borderStrong',
      },
      flat: {
        backgroundColor: 'surfaceAlt',
        borderRadius: 'lg',
        padding: 'lg',
        borderWidth: 0,
        borderColor: 'transparent',
      },
    },
    buttonVariants: {
      defaults: {
        borderRadius: 'pill',
        paddingVertical: 'md',
        paddingHorizontal: 'xl',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 'sm',
      },
      primary: { backgroundColor: 'primary' },
      secondary: { backgroundColor: 'surfaceAlt', borderWidth: 1, borderColor: 'border' },
      ghost: { backgroundColor: 'transparent' },
    },
    // --- Custom (non-Restyle) metadata, read via useTheme() ---
    meta: {
      themeId: kit.themeId,
      name: kit.name,
      mode: kit.mode,
      accentStyle: kit.accentStyle,
      logoVariant: kit.logoVariant,
    },
    effects: kit.effects,
    gradients: kit.gradients,
    charts: kit.charts,
    fonts,
  });

export const homeTheme = makeTheme({
  themeId: 'home-kit',
  name: 'Home — Carbon Volt',
  mode: 'dark',
  accentStyle: 'neon',
  logoVariant: 'home',
  colors: {
    background: homePalette.carbon800,
    surface: homePalette.carbon700,
    surfaceAlt: homePalette.carbon600,
    surfaceElevated: homePalette.carbon500,
    primary: homePalette.volt500,
    primaryMuted: homePalette.volt600,
    secondary: homePalette.volt400,
    onPrimary: homePalette.onPrimary,
    success: homePalette.success,
    warning: homePalette.warning,
    danger: homePalette.danger,
    textPrimary: homePalette.textPrimary,
    textSecondary: homePalette.textSecondary,
    textInverse: homePalette.carbon900,
    border: '#283028',
    borderStrong: '#39463A',
    overlay: homePalette.overlay,
    glow: homePalette.voltGlow,
    outcomeHome: outcomeRamp.home.home,
    outcomeDraw: outcomeRamp.home.draw,
    outcomeAway: outcomeRamp.home.away,
  },
  effects: {
    glowEnabled: true,
    blurEnabled: false,
    gradientEnabled: true,
    glowColor: homePalette.voltGlow,
  },
  gradients: {
    accent: [homePalette.volt400, homePalette.volt600],
    cta: [homePalette.volt400, homePalette.volt500],
    card: [homePalette.carbon700, homePalette.carbon800],
    hero: ['#13201380', '#0A0F0AF2'],
  },
  charts: {
    skeletonBase: '#161E16',
    skeletonHighlight: '#222C22',
    confidenceTrack: '#222C22',
    xgHome: homePalette.volt500,
    xgAway: AWAY_ACCENT,
  },
});

export const awayTheme: typeof homeTheme = makeTheme({
  themeId: 'away-kit',
  name: 'Away — Teal Glass',
  mode: 'light',
  accentStyle: 'soft',
  logoVariant: 'away',
  colors: {
    background: awayPalette.ice100,
    surface: awayPalette.white,
    surfaceAlt: awayPalette.mist,
    surfaceElevated: awayPalette.white,
    primary: awayPalette.teal600,
    primaryMuted: awayPalette.teal700,
    secondary: awayPalette.mint300,
    onPrimary: awayPalette.onPrimary,
    success: awayPalette.success,
    warning: awayPalette.warning,
    danger: awayPalette.danger,
    textPrimary: awayPalette.textPrimary,
    textSecondary: awayPalette.textSecondary,
    textInverse: awayPalette.white,
    border: awayPalette.border,
    borderStrong: '#86C7BF',
    overlay: awayPalette.overlay,
    glow: awayPalette.tealGlass,
    outcomeHome: outcomeRamp.away.home,
    outcomeDraw: outcomeRamp.away.draw,
    outcomeAway: outcomeRamp.away.away,
  },
  effects: {
    glowEnabled: false,
    blurEnabled: true,
    gradientEnabled: true,
    glowColor: awayPalette.tealGlass,
  },
  gradients: {
    accent: [awayPalette.teal500, awayPalette.teal700],
    cta: [awayPalette.teal500, awayPalette.teal600],
    card: [awayPalette.white, awayPalette.mist],
    hero: ['#FFFFFFCC', '#E9F4F1F2'],
  },
  charts: {
    skeletonBase: '#E4EFEC',
    skeletonHighlight: '#F2F8F6',
    confidenceTrack: '#E4EFEC',
    xgHome: awayPalette.teal600,
    xgAway: AWAY_ACCENT,
  },
});

export const thirdTheme: typeof homeTheme = makeTheme({
  themeId: 'third-kit',
  name: 'Third — Red Energy',
  mode: 'dark',
  accentStyle: 'vibrant',
  logoVariant: 'third',
  colors: {
    background: thirdPalette.black800,
    surface: thirdPalette.carbon700,
    surfaceAlt: thirdPalette.carbon600,
    surfaceElevated: thirdPalette.carbon500,
    primary: thirdPalette.red500,
    primaryMuted: thirdPalette.red600,
    secondary: thirdPalette.red400,
    onPrimary: thirdPalette.onPrimary,
    success: thirdPalette.success,
    warning: thirdPalette.warning,
    danger: thirdPalette.danger,
    textPrimary: thirdPalette.textPrimary,
    textSecondary: thirdPalette.textSecondary,
    textInverse: thirdPalette.black900,
    border: thirdPalette.border,
    borderStrong: '#3A2A2E',
    overlay: thirdPalette.overlay,
    glow: thirdPalette.redGlow,
    outcomeHome: outcomeRamp.third.home,
    outcomeDraw: outcomeRamp.third.draw,
    outcomeAway: outcomeRamp.third.away,
  },
  effects: {
    glowEnabled: true,
    blurEnabled: false,
    gradientEnabled: true,
    glowColor: thirdPalette.redGlow,
  },
  gradients: {
    accent: [thirdPalette.red400, thirdPalette.red600],
    cta: [thirdPalette.red400, thirdPalette.red500],
    card: [thirdPalette.carbon700, thirdPalette.black800],
    hero: ['#2010138C', '#000000F2'],
  },
  charts: {
    skeletonBase: '#1A1216',
    skeletonHighlight: '#271A1F',
    confidenceTrack: '#271A1F',
    xgHome: thirdPalette.red500,
    xgAway: AWAY_ACCENT,
  },
});

export type Theme = typeof homeTheme;

export const kits: Record<KitId, Theme> = {
  'home-kit': homeTheme,
  'away-kit': awayTheme,
  'third-kit': thirdTheme,
};
