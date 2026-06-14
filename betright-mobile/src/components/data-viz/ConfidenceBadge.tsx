import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import type { ConfidenceLabel } from '@/models/prediction.model';
import { BRText } from '@/components/primitives/BRText';

export interface ConfidenceBadgeProps {
  score: number;
  label: ConfidenceLabel;
  testID?: string;
}

const LABEL_TEXT: Record<ConfidenceLabel, string> = {
  low: 'Low',
  medium_low: 'Medium-Low',
  medium: 'Medium',
  high: 'High',
  very_high: 'Very High',
};

/** Confidence as a compact dot + label. Colour band scales with the score. */
export function ConfidenceBadge({ score, label, testID }: ConfidenceBadgeProps) {
  const theme = useTheme();
  const r = useResponsive();
  const dot = r.s(8);
  const color =
    score >= 70 ? theme.colors.success : score >= 50 ? theme.colors.warning : theme.colors.danger;

  return (
    <Box flexDirection="row" alignItems="center" gap="xs" testID={testID}>
      <Box width={dot} height={dot} borderRadius="round" style={{ backgroundColor: color }} />
      <BRText variant="caption" style={{ color: theme.colors.textSecondary }}>
        {LABEL_TEXT[label]} confidence
      </BRText>
    </Box>
  );
}
