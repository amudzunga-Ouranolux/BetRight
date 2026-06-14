import { Pressable } from 'react-native';
import { Check } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { BRText } from '@/components/primitives/BRText';

export interface SelectableRowProps {
  label: string;
  sublabel?: string;
  selected: boolean;
  onToggle: () => void;
  /** 'check' = trailing checkmark box (Home/Third); 'chip' = filled pill (Away). */
  indicator?: 'check' | 'chip';
  leading?: React.ReactNode;
  testID?: string;
}

/** A single selectable list item used by the favourites selectors. */
export function SelectableRow({
  label,
  sublabel,
  selected,
  onToggle,
  indicator = 'check',
  leading,
  testID,
}: SelectableRowProps) {
  const theme = useTheme();
  const r = useResponsive();
  const box = r.s(24);
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      testID={testID}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        gap="md"
        paddingVertical="md"
        paddingHorizontal="md"
        borderRadius="md"
        style={{
          backgroundColor: selected && indicator === 'chip' ? theme.colors.primary + '14' : 'transparent',
        }}
      >
        {leading}
        <Box flex={1}>
          <BRText variant="body" style={{ fontWeight: '600' }}>
            {label}
          </BRText>
          {sublabel && <BRText variant="caption">{sublabel}</BRText>}
        </Box>
        <Box
          width={box}
          height={box}
          borderRadius={indicator === 'chip' ? 'pill' : 'xs'}
          alignItems="center"
          justifyContent="center"
          borderWidth={selected ? 0 : 1}
          borderColor="border"
          style={{ backgroundColor: selected ? theme.colors.primary : 'transparent' }}
        >
          {selected && <Check size={box * 0.62} color={theme.colors.onPrimary} strokeWidth={3} />}
        </Box>
      </Box>
    </Pressable>
  );
}
