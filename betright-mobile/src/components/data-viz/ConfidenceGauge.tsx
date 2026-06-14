import { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/core/theme/restyle';
import { motion } from '@/core/theme/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface ConfidenceGaugeProps {
  /** 0-100. */
  score: number;
  /** Overall width of the gauge. */
  width: number;
  strokeWidth?: number;
  testID?: string;
}

/**
 * 180° speedometer-style confidence arc (opens downward). Track + green progress
 * sweeping left-to-right. Pair it to the right of the percentage text.
 */
export function ConfidenceGauge({ score, width, strokeWidth, testID }: ConfidenceGaugeProps) {
  const theme = useTheme();
  const stroke = strokeWidth ?? Math.max(3, width * 0.1);
  const radius = (width - stroke) / 2;
  const cy = radius + stroke / 2;
  const length = Math.PI * radius;
  const d = `M ${stroke / 2} ${cy} A ${radius} ${radius} 0 0 1 ${width - stroke / 2} ${cy}`;

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(Math.max(0, Math.min(100, score)) / 100, { duration: motion.slow });
  }, [score, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - progress.value),
  }));

  return (
    <View style={{ width, height: cy + stroke / 2 }} testID={testID}>
      <Svg width={width} height={cy + stroke / 2}>
        <Path d={d} stroke={theme.charts.confidenceTrack} strokeWidth={stroke} strokeLinecap="round" fill="none" />
        <AnimatedPath
          d={d}
          stroke={theme.colors.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={length}
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
}
