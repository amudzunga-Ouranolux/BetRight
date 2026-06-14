import { Pressable } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';

type Tone = 'surface' | 'primary' | 'ghost';

export interface BRIconButtonProps {
  icon: LucideIcon;
  onPress?: () => void;
  accessibilityLabel: string;
  tone?: Tone;
  size?: number;
  testID?: string;
}

/** Square/round tappable icon. Used in headers, cards, and toolbars. */
export function BRIconButton({
  icon: Icon,
  onPress,
  accessibilityLabel,
  tone = 'surface',
  size = 40,
  testID,
}: BRIconButtonProps) {
  const theme = useTheme();
  const bg =
    tone === 'primary' ? theme.colors.primary : tone === 'surface' ? theme.colors.surfaceAlt : 'transparent';
  const fg = tone === 'primary' ? theme.colors.onPrimary : theme.colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      hitSlop={8}
    >
      <Box
        width={size}
        height={size}
        borderRadius="pill"
        alignItems="center"
        justifyContent="center"
        style={{ backgroundColor: bg }}
      >
        <Icon size={size * 0.5} color={fg} strokeWidth={2} />
      </Box>
    </Pressable>
  );
}
