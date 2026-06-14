/**
 * Raw colour ramps per kit, read from the brand CI mocks
 * (Docs/App CI/* and brand/<kit>/*). Components never import these directly —
 * they consume the assembled Restyle themes in `kits.ts`, which map these ramps
 * onto semantic token names.
 */

/** Home — Carbon + Volt (dark). Near-black carbon surfaces, volt-lime accent. */
export const homePalette = {
  carbon900: '#070A07',
  carbon800: '#0A0F0A',
  carbon700: '#10160F',
  carbon600: '#141B14',
  carbon500: '#1B241B',
  carbon400: '#26312596',
  volt500: '#C8F031',
  volt400: '#D6F95A',
  volt600: '#A6CC1F',
  voltGlow: 'rgba(200, 240, 49, 0.35)',
  textPrimary: '#F4F7F1',
  textSecondary: '#9AA89A',
  border: '#27302700',
  success: '#39D98A',
  warning: '#FFC24B',
  danger: '#FF5A5F',
  onPrimary: '#0A0F0A',
  overlay: 'rgba(0,0,0,0.55)',
} as const;

/** Away — Teal Glass (light). Mint/ice surfaces, deep-teal accent, frosted glass. */
export const awayPalette = {
  ice50: '#F7FFFE',
  ice100: '#F2FFFD',
  white: '#FFFFFF',
  mist: '#E8FBF8',
  teal700: '#00545A', // pressed / muted CTA
  teal600: '#007A7E', // primary deep-teal CTA (white-text safe)
  teal500: '#00A8A8', // CTA gradient bright end
  mint300: '#22E7E4', // neon cyan accent (icons, active states, highlights)
  tealGlass: 'rgba(34, 231, 228, 0.16)',
  textPrimary: '#08272A',
  textSecondary: '#526D70',
  border: '#A7C5BF',
  success: '#13B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  onPrimary: '#FFFFFF',
  overlay: 'rgba(0, 26, 34, 0.40)',
} as const;

/** Third — Red Energy (dark). Pure-black surfaces, signal-red accent, red glow. */
export const thirdPalette = {
  black900: '#000000',
  black800: '#08080A',
  carbon700: '#120E10',
  carbon600: '#171115',
  carbon500: '#20171B',
  carbon400: '#2A1E22',
  red500: '#E11D2A',
  red400: '#FF3B45',
  red600: '#B8121E',
  redGlow: 'rgba(225, 29, 42, 0.35)',
  textPrimary: '#F6F3F3',
  textSecondary: '#A89B9D',
  border: '#2A1E22',
  success: '#3ED98A',
  warning: '#FFB13B',
  danger: '#FF5A5F',
  onPrimary: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.6)',
} as const;

/** Away-side accent (blue) — home values use the kit accent, away values use blue. */
export const AWAY_ACCENT = '#3D8BFF';

/**
 * Probability / outcome ramp used by ProbabilityBar and 1X2 displays.
 * Home = kit accent, Draw = neutral grey, Away = blue (consistent across kits).
 */
export const outcomeRamp = {
  home: { home: '#C8F031', draw: '#5B6B5B', away: AWAY_ACCENT },
  away: { home: '#007A7E', draw: '#9FB4B0', away: AWAY_ACCENT },
  third: { home: '#E11D2A', draw: '#6B5256', away: AWAY_ACCENT },
} as const;
