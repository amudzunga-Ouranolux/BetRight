import { Box, useTheme } from '@/core/theme/restyle';

import { BRText } from './BRText';

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export interface BRBadgeProps {
  label: string;
  tone?: Tone;
  testID?: string;
}

/** Compact status label (e.g. LIVE, HIGH, UPSET WATCH). Tone maps to a token. */
export function BRBadge({ label, tone = 'neutral', testID }: BRBadgeProps) {
  const theme = useTheme();
  const toneColor: Record<Tone, string> = {
    neutral: theme.colors.textSecondary,
    primary: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
  };
  const color = toneColor[tone];

  return (
    <Box
      alignSelf="flex-start"
      paddingVertical="xxs"
      paddingHorizontal="sm"
      borderRadius="sm"
      style={{ backgroundColor: color + '22', borderWidth: 1, borderColor: color + '55' }}
      testID={testID}
    >
      <BRText variant="label" style={{ color }}>
        {label}
      </BRText>
    </Box>
  );
}
