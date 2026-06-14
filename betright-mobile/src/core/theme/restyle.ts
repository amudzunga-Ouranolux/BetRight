import {
  createBox,
  createText,
  useTheme as useRestyleTheme,
  type VariantProps,
} from '@shopify/restyle';

import type { Theme } from './kits';

/** Typed Restyle primitives bound to the BetRight theme. */
export const Box = createBox<Theme>();
export const Text = createText<Theme>();

export type BoxProps = React.ComponentProps<typeof Box>;
export type TextProps = React.ComponentProps<typeof Text>;

/** Active theme (all kit tokens + custom meta/effects/gradients/charts). */
export const useTheme = () => useRestyleTheme<Theme>();

/** Shorthand for the colour palette of the active kit. */
export const useTokens = () => useRestyleTheme<Theme>();

export type CardVariant = VariantProps<Theme, 'cardVariants'>['variant'];
export type ButtonVariant = VariantProps<Theme, 'buttonVariants'>['variant'];
export type TextVariant = Exclude<keyof Theme['textVariants'], 'defaults'>;
