/**
 * Kit-agnostic raw scales: spacing, radii, type scale, motion durations.
 * These never change between kits — only colours, fonts, and effect flags do.
 *
 * Values are authored against the guideline phone and run through the responsive
 * scalers so every token-based component sizes itself to the viewport. `pill`/
 * `round` stay fixed (they are intentionally "infinite" radii).
 */
import { moderateScale, fontScale } from './responsive';

const ms = (n: number) => moderateScale(n);
const fs = (n: number) => fontScale(n);

export const spacing = {
  none: 0,
  xxs: ms(2),
  xs: ms(4),
  sm: ms(8),
  md: ms(12),
  lg: ms(16),
  xl: ms(24),
  xxl: ms(32),
  xxxl: ms(48),
} as const;

export const radii = {
  none: 0,
  xs: ms(4),
  sm: ms(8),
  md: ms(12),
  lg: ms(16),
  xl: ms(24),
  pill: 999,
  round: 9999,
} as const;

/** Type scale (size + line height) shared by every kit, gently font-scaled.
 * Tuned compact for mobile — restrained sizes, not poster-sized headings. */
export const typeScale = {
  display: { fontSize: fs(19), lineHeight: fs(25) },
  h1: { fontSize: fs(19), lineHeight: fs(25) },
  h2: { fontSize: fs(16), lineHeight: fs(22) },
  title: { fontSize: fs(14), lineHeight: fs(19) },
  body: { fontSize: fs(13), lineHeight: fs(18) },
  bodySmall: { fontSize: fs(11.5), lineHeight: fs(16) },
  caption: { fontSize: fs(10.5), lineHeight: fs(14) },
  label: { fontSize: fs(9.5), lineHeight: fs(12) },
  numberLg: { fontSize: fs(20), lineHeight: fs(24) },
  numberMd: { fontSize: fs(14), lineHeight: fs(18) },
} as const;

/** Motion durations (ms) for Reanimated. */
export const motion = {
  fast: 150,
  base: 250,
  slow: 400,
  kitCrossfade: 250,
} as const;

/** Opacity tokens for pressed / disabled states. */
export const opacity = {
  pressed: 0.85,
  disabled: 0.4,
  overlay: 0.6,
  scrim: 0.4,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radii;
