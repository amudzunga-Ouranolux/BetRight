import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { motion } from '@/core/theme/tokens';

export interface ToggleProps {
  on: boolean;
  testID?: string;
}

/**
 * Presentational switch (track + animated knob). The parent row owns the press,
 * so this only reflects state. On = kit accent track with white knob to the right.
 */
export function Toggle({ on, testID }: ToggleProps) {
  const theme = useTheme();
  const r = useResponsive();
  const trackW = r.s(42);
  const trackH = r.s(24);
  const knob = r.s(18);
  const pad = (trackH - knob) / 2;
  const onX = trackW - knob - pad;

  const tx = useSharedValue(on ? onX : pad);
  useEffect(() => {
    tx.value = withTiming(on ? onX : pad, { duration: motion.fast });
  }, [on, onX, pad, tx]);

  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));

  return (
    <Box
      width={trackW}
      height={trackH}
      borderRadius="pill"
      justifyContent="center"
      borderWidth={1}
      testID={testID}
      style={{
        backgroundColor: on ? theme.colors.primary : theme.colors.surfaceAlt,
        borderColor: on ? theme.colors.primary : theme.colors.border,
      }}
    >
      <Animated.View
        style={[
          {
            width: knob,
            height: knob,
            borderRadius: knob / 2,
            position: 'absolute',
            backgroundColor: on ? theme.colors.onPrimary : theme.colors.textSecondary,
          },
          knobStyle,
        ]}
      />
    </Box>
  );
}
