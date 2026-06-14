import { Pressable } from 'react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { BRText } from '@/components/primitives/BRText';

import { PROVIDERS, type AuthSocialButtonsProps } from './types';

/** Home / Away: full-width stacked social buttons with label. */
export function StackedSocial({ onGoogle, onApple, height }: AuthSocialButtonsProps) {
  const theme = useTheme();
  const r = useResponsive();
  const badge = r.s(22);
  const rowHeight = height ?? r.s(48);
  const handlers = { google: onGoogle, apple: onApple };

  return (
    <Box gap="sm">
      {PROVIDERS.map((p) => (
        <Pressable
          key={p.key}
          onPress={handlers[p.key]}
          accessibilityRole="button"
          accessibilityLabel={p.label}
        >
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            gap="sm"
            height={rowHeight}
            borderRadius="sm"
            borderWidth={1}
            backgroundColor="surfaceAlt"
            style={{ borderColor: theme.colors.border }}
          >
            <Box
              width={badge}
              height={badge}
              borderRadius="round"
              alignItems="center"
              justifyContent="center"
              style={{ backgroundColor: theme.colors.surface }}
            >
              <BRText variant="caption" style={{ fontWeight: '800' }}>
                {p.monogram}
              </BRText>
            </Box>
            <BRText variant="body" style={{ fontWeight: '600' }}>
              {p.label}
            </BRText>
          </Box>
        </Pressable>
      ))}
    </Box>
  );
}
