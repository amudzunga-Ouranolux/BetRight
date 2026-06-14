import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Box, useTheme } from '@/core/theme/restyle';
import { motion } from '@/core/theme/tokens';
import { BRText } from '@/components/primitives/BRText';

export interface ProbabilityBarProps {
  home: number;
  draw: number;
  away: number;
  /** Show the H / D / A percentage labels above the bar. */
  showLabels?: boolean;
  height?: number;
  testID?: string;
}

function Segment({ flexBasis, color }: { flexBasis: number; color: string }) {
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withTiming(flexBasis, { duration: motion.slow });
  }, [flexBasis, width]);
  const style = useAnimatedStyle(() => ({ width: `${width.value}%` }));
  return <Animated.View style={[{ backgroundColor: color, height: '100%' }, style]} />;
}

/** Three-segment 1X2 probability bar with animated fill. The Home/Third confidence display. */
export function ProbabilityBar({
  home,
  draw,
  away,
  showLabels = true,
  height = 10,
  testID,
}: ProbabilityBarProps) {
  const theme = useTheme();
  const total = home + draw + away || 1;
  const pct = (n: number) => (n / total) * 100;

  return (
    <Box gap="xs" testID={testID}>
      {showLabels && (
        <Box flexDirection="row" justifyContent="space-between">
          <BRText variant="numberMd" style={{ color: theme.colors.outcomeHome }}>
            {home}%
          </BRText>
          <BRText variant="numberMd" style={{ color: theme.colors.textSecondary }}>
            {draw}%
          </BRText>
          <BRText variant="numberMd" style={{ color: theme.colors.outcomeAway }}>
            {away}%
          </BRText>
        </Box>
      )}
      <Box
        flexDirection="row"
        borderRadius="pill"
        overflow="hidden"
        style={{ height, backgroundColor: theme.charts.confidenceTrack }}
      >
        <Segment flexBasis={pct(home)} color={theme.colors.outcomeHome} />
        <Segment flexBasis={pct(draw)} color={theme.colors.outcomeDraw} />
        <Segment flexBasis={pct(away)} color={theme.colors.outcomeAway} />
      </Box>
    </Box>
  );
}
