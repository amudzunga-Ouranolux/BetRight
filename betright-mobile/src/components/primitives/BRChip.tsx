import { Pressable } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';

import { BRText } from './BRText';

export interface BRChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: LucideIcon;
  testID?: string;
}

/** Pill filter/selector chip. Used for quick filters and segmented selections. */
export function BRChip({ label, selected = false, onPress, icon: Icon, testID }: BRChipProps) {
  const theme = useTheme();
  const r = useResponsive();
  const bg = selected ? theme.colors.primary : theme.colors.surfaceAlt;
  const fg = selected ? theme.colors.onPrimary : theme.colors.textSecondary;
  const borderColor = selected ? theme.colors.primary : theme.colors.border;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      testID={testID}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        gap="xs"
        paddingVertical="sm"
        paddingHorizontal="md"
        borderRadius="pill"
        borderWidth={1}
        style={{ backgroundColor: bg, borderColor }}
      >
        {Icon && <Icon size={r.s(14)} color={fg} strokeWidth={2.25} />}
        <BRText variant="caption" style={{ color: fg, fontWeight: '600' }}>
          {label}
        </BRText>
      </Box>
    </Pressable>
  );
}
