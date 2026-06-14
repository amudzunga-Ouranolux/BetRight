import { Pressable } from 'react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { BRText } from '@/components/primitives/BRText';

export interface SegmentedTabsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  testID?: string;
}

/** Pill segmented control. Used for in-page tabs (Leagues/Teams, Today/Tomorrow). */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  testID,
}: SegmentedTabsProps<T>) {
  const theme = useTheme();
  return (
    <Box
      flexDirection="row"
      backgroundColor="surfaceAlt"
      borderRadius="pill"
      padding="xxs"
      gap="xxs"
      testID={testID}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={{ flex: 1 }}
          >
            <Box
              paddingVertical="sm"
              borderRadius="pill"
              alignItems="center"
              style={{ backgroundColor: active ? theme.colors.primary : 'transparent' }}
            >
              <BRText
                variant="caption"
                style={{
                  color: active ? theme.colors.onPrimary : theme.colors.textSecondary,
                  fontWeight: '700',
                }}
              >
                {opt.label}
              </BRText>
            </Box>
          </Pressable>
        );
      })}
    </Box>
  );
}
