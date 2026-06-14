import { ThemeProvider as RestyleProvider } from '@shopify/restyle';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motion } from './tokens';
import { kits } from './kits';
import { useThemeStore } from './themeStore';

/**
 * Wraps the app in the active kit's Restyle theme and plays a short cross-fade
 * whenever the kit changes, so switching feels deliberate rather than abrupt.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const kitId = useThemeStore((s) => s.kitId);
  const theme = kits[kitId];

  const fade = useSharedValue(1);

  useEffect(() => {
    fade.value = 0;
    fade.value = withTiming(1, { duration: motion.kitCrossfade });
  }, [kitId, fade]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: 1 - fade.value,
    backgroundColor: theme.colors.background,
  }));

  return (
    <RestyleProvider theme={theme}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, overlayStyle]}
      />
    </RestyleProvider>
  );
}
