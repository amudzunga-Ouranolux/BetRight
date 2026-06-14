import { Pressable } from 'react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { BRText } from '@/components/primitives/BRText';

import { PROVIDERS, type AuthSocialButtonsProps } from './types';

/** Third: a centred row of circular social icon buttons (no labels). */
export function IconSocial({ onGoogle, onApple, height }: AuthSocialButtonsProps) {
  const theme = useTheme();
  const r = useResponsive();
  const circle = height ?? r.s(52);
  const handlers = { google: onGoogle, apple: onApple };

  return (
    <Box flexDirection="row" justifyContent="center" gap="lg">
      {PROVIDERS.map((p) => (
        <Pressable
          key={p.key}
          onPress={handlers[p.key]}
          accessibilityRole="button"
          accessibilityLabel={p.label}
        >
          <Box
            width={circle}
            height={circle}
            borderRadius="pill"
            alignItems="center"
            justifyContent="center"
            backgroundColor="surfaceAlt"
            borderWidth={1}
            style={{ borderColor: theme.colors.border }}
          >
            <BRText variant="title" style={{ fontWeight: '800' }}>
              {p.monogram}
            </BRText>
          </Box>
        </Pressable>
      ))}
    </Box>
  );
}
