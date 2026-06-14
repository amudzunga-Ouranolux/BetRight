import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/core/theme/restyle';

export interface SkeletonLoaderProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  testID?: string;
}

/** Shimmering placeholder block. Colours come from the kit's chart skeleton ramp. */
export function SkeletonLoader({ width = '100%', height = 16, radius = 8, testID }: SkeletonLoaderProps) {
  const theme = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1100 }), -1, true);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + progress.value * 0.5,
  }));

  return (
    <Animated.View
      testID={testID}
      style={[
        { width, height, borderRadius: radius, backgroundColor: theme.charts.skeletonBase },
        animatedStyle,
      ]}
    />
  );
}
