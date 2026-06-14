import { Pressable } from 'react-native';
import { Check, type LucideIcon } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { BRText } from '@/components/primitives/BRText';
import { Toggle } from '@/components/inputs/Toggle';

export interface OptionItem {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export type OptionControl = 'check' | 'toggle';

export interface OptionTableProps {
  items: OptionItem[];
  selected: string[];
  onToggle: (id: string) => void;
  /** Trailing control: checkbox (default) or switch. */
  control?: OptionControl;
  testID?: string;
}

/**
 * Bordered, surface-coloured card of compact selectable rows (icon badge, title,
 * optional description, checkbox) separated by dividers. Shared by the onboarding
 * Prediction Interests and Notification steps so they match the favourites table.
 */
export function OptionTable({ items, selected, onToggle, control = 'check', testID }: OptionTableProps) {
  return (
    <Box
      backgroundColor="surface"
      borderWidth={1}
      borderColor="border"
      borderRadius="md"
      overflow="hidden"
      testID={testID}
    >
      {items.map((item, idx) => (
        <Row
          key={item.id}
          item={item}
          selected={selected.includes(item.id)}
          onToggle={() => onToggle(item.id)}
          control={control}
          divider={idx > 0}
        />
      ))}
    </Box>
  );
}

function Row({
  item,
  selected,
  onToggle,
  control,
  divider,
}: {
  item: OptionItem;
  selected: boolean;
  onToggle: () => void;
  control: OptionControl;
  divider: boolean;
}) {
  const theme = useTheme();
  const r = useResponsive();
  const box = r.s(20);
  const badge = r.s(24);
  const Icon = item.icon;

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole={control === 'toggle' ? 'switch' : 'checkbox'}
      accessibilityState={{ checked: selected }}
      accessibilityLabel={item.title}
      testID={`option-${item.id}`}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        gap="sm"
        paddingVertical="sm"
        paddingHorizontal="md"
        borderTopWidth={divider ? 1 : 0}
        borderColor="border"
      >
        {Icon && (
          <Box
            width={badge}
            height={badge}
            borderRadius="sm"
            alignItems="center"
            justifyContent="center"
            backgroundColor="surfaceAlt"
            borderWidth={1}
            borderColor="border"
          >
            <Icon size={badge * 0.6} color={theme.colors.primary} strokeWidth={2} />
          </Box>
        )}
        <Box flex={1}>
          <BRText variant="bodySmall" style={{ fontWeight: '600' }} numberOfLines={1}>
            {item.title}
          </BRText>
          {item.description && (
            <BRText variant="caption" numberOfLines={1}>
              {item.description}
            </BRText>
          )}
        </Box>
        {control === 'toggle' ? (
          <Toggle on={selected} />
        ) : (
          <Box
            width={box}
            height={box}
            borderRadius="xs"
            alignItems="center"
            justifyContent="center"
            borderWidth={selected ? 0 : 1}
            borderColor="border"
            style={{ backgroundColor: selected ? theme.colors.primary : 'transparent' }}
          >
            {selected && <Check size={box * 0.62} color={theme.colors.onPrimary} strokeWidth={3} />}
          </Box>
        )}
      </Box>
    </Pressable>
  );
}
