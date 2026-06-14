import { Box, useTheme, type BoxProps } from '@/core/theme/restyle';

export interface GlassCardProps extends BoxProps {
  children: React.ReactNode;
  /** 0-255 alpha (hex) applied to the surface fill. Lower = more see-through. */
  opacityHex?: string;
  /** Use the kit accent (green) for the border. */
  accent?: boolean;
  /** Apply an accent glow (only on kits where glow is enabled). */
  glow?: boolean;
}

/**
 * Translucent "glass" surface that lets the kit background show through. Used for
 * the premium see-through cards on Home. Supports an accent (green) border and a
 * subtle glow to match the inspiration design.
 */
export function GlassCard({ children, opacityHex = 'B3', accent = false, glow = false, style, ...rest }: GlassCardProps) {
  const theme = useTheme();
  const glowStyle =
    glow && theme.effects.glowEnabled
      ? {
          shadowColor: theme.colors.primary,
          shadowOpacity: 0.22,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
          elevation: 4,
        }
      : undefined;

  return (
    <Box
      borderRadius="md"
      borderWidth={1}
      style={[
        {
          backgroundColor: theme.colors.surface + opacityHex,
          borderColor: accent ? theme.colors.primary + '80' : theme.colors.border,
        },
        glowStyle,
        style,
      ]}
      {...rest}
    >
      {children}
    </Box>
  );
}
