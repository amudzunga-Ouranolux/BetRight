import { type ViewStyle } from 'react-native';

import { Box, useTheme, type BoxProps } from '@/core/theme/restyle';

type Variant = 'default' | 'elevated' | 'flat';

export interface BRCardProps extends BoxProps {
  variant?: Variant;
  /** Apply the kit's accent glow (Home/Third). No-op when the kit disables glow. */
  glow?: boolean;
  children: React.ReactNode;
}

/**
 * Surface container. Renders as carbon/glass/flat per the kit's cardStyle.
 * Glow and border treatment are driven by theme effect flags — never hard-coded.
 */
export function BRCard({ variant = 'default', glow = false, children, style, ...rest }: BRCardProps) {
  const theme = useTheme();

  const glowStyle: ViewStyle | undefined =
    glow && theme.effects.glowEnabled
      ? {
          shadowColor: theme.colors.primary,
          shadowOpacity: 0.22,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
          elevation: 4,
        }
      : undefined;

  // Translucent glass fill (see DESIGN_SYSTEM.md) so cards match the Home look.
  const base =
    variant === 'flat' ? theme.colors.surfaceAlt : variant === 'elevated' ? theme.colors.surfaceElevated : theme.colors.surface;

  return (
    <Box
      borderRadius="md"
      padding="md"
      borderWidth={variant === 'flat' ? 0 : 1}
      borderColor={variant === 'elevated' ? 'borderStrong' : 'border'}
      style={[{ backgroundColor: base + 'B3' }, glowStyle, style]}
      {...rest}
    >
      {children}
    </Box>
  );
}
