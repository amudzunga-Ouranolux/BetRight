/**
 * Theme / Kit models.
 *
 * BetRight ships three "kits" (visual identities) the user selects and can change
 * anytime. Mirrors AppTheme from the Tech Stack doc (§7.20) and the design-system
 * skill's ThemeTokens. The Restyle theme objects in `core/theme/kits.ts` are the
 * runtime source of truth; these types document the contract.
 */

export type KitId = 'home-kit' | 'away-kit' | 'third-kit';

export type ThemeMode = 'dark' | 'light';

export type AccentStyle = 'soft' | 'vibrant' | 'neon';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
}

export interface ThemeTypography {
  displayFont: string;
  bodyFont: string;
  numberFont: string;
}

export interface ThemeCardStyle {
  radius: number;
  blurEnabled: boolean;
  gradientEnabled: boolean;
  borderGlowEnabled: boolean;
}

export interface AppTheme {
  themeId: KitId;
  name: string;
  mode: ThemeMode;
  accentStyle: AccentStyle;
  colors: ThemeColors;
  typography: ThemeTypography;
  cardStyle: ThemeCardStyle;
  /** Key into the per-kit asset map (logos, backgrounds). */
  logoVariant: 'home' | 'away' | 'third';
}

export const KIT_IDS: KitId[] = ['home-kit', 'away-kit', 'third-kit'];

export const DEFAULT_KIT_ID: KitId = 'home-kit';
