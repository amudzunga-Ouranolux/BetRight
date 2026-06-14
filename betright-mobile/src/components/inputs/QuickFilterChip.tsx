import { Pressable } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { BRText } from '@/components/primitives/BRText';

export interface QuickFilterChipProps {
  icon: LucideIcon;
  label: string;
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
}

/** Compact square quick-filter: icon on top, tiny label below. Fills its row slot. */
export function QuickFilterChip({ icon: Icon, label, selected = false, onPress, testID }: QuickFilterChipProps) {
  const theme = useTheme();
  const r = useResponsive();

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }} style={{ flex: 1 }} testID={testID}>
      <Box
        alignItems="center"
        justifyContent="center"
        gap="xxs"
        borderRadius="sm"
        borderWidth={1}
        style={{
          height: r.s(42),
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface + 'D9',
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        }}
      >
        <Icon
          size={r.s(14)}
          color={selected ? theme.colors.onPrimary : theme.colors.primary}
          strokeWidth={2}
        />
        <BRText
          numberOfLines={1}
          style={{
            fontSize: r.s(8),
            lineHeight: r.s(10),
            fontFamily: theme.fonts.semibold,
            color: selected ? theme.colors.onPrimary : theme.colors.textSecondary,
          }}
        >
          {label}
        </BRText>
      </Box>
    </Pressable>
  );
}
