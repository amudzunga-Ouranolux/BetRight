import { Dimensions, useWindowDimensions } from 'react-native';

/**
 * Responsive scaling. Sizes are authored against a guideline phone (390x844) and
 * scaled to the actual viewport, clamped so very large (tablet/desktop-web) or
 * very small screens stay sane. Use these instead of raw pixel literals.
 *
 * - Static `scale`/`moderateScale`/`fontScale` (captured at load) for module-level
 *   values like design tokens.
 * - `useResponsive()` for layout that must react to live resize (web window, rotation).
 */
export const GUIDELINE_WIDTH = 390;
export const GUIDELINE_HEIGHT = 844;

const MIN_FACTOR = 0.85;
// Cap upper scaling: this is a mobile-first app, so larger phones / tablets / web
// windows should not balloon the UI much beyond the guideline sizing.
const MAX_FACTOR = 1.12;

export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

function factorFor(width: number, height: number): number {
  const shortest = Math.min(width, height);
  return clamp(shortest / GUIDELINE_WIDTH, MIN_FACTOR, MAX_FACTOR);
}

const initial = Dimensions.get('window');
const STATIC_FACTOR = factorFor(initial.width, initial.height);

/** Scale a size by the (clamped) viewport factor. */
export const scale = (size: number) => Math.round(size * STATIC_FACTOR);

/** Scale a size only partially (default half) — good for paddings/heights. */
export const moderateScale = (size: number, factor = 0.5) =>
  Math.round(size + (size * STATIC_FACTOR - size) * factor);

/** Gentle scaling for type so text never balloons or collapses. */
export const fontScale = (size: number) => moderateScale(size, 0.4);

export interface Responsive {
  width: number;
  height: number;
  factor: number;
  /** Scale a guideline size to the live viewport. */
  s: (size: number) => number;
  /** Moderate (partial) scale. */
  ms: (size: number, factor?: number) => number;
  /** Percent of viewport width. */
  wp: (pct: number) => number;
  /** Percent of viewport height. */
  hp: (pct: number) => number;
}

/** Live responsive values that react to viewport changes (resize, rotation). */
export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();
  const factor = factorFor(width, height);
  return {
    width,
    height,
    factor,
    s: (size) => Math.round(size * factor),
    ms: (size, f = 0.5) => Math.round(size + (size * factor - size) * f),
    wp: (pct) => Math.round((width * pct) / 100),
    hp: (pct) => Math.round((height * pct) / 100),
  };
}
