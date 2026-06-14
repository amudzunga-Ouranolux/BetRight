import { Pressable, ScrollView } from 'react-native';
import { Check, Medal, Trophy, type LucideIcon } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import {
  catalogCompetitions,
  catalogLeagues,
  catalogTeams,
  type CatalogItem,
} from '@/core/api/mock/catalog';
import { BRText } from '@/components/primitives/BRText';
import { TeamCrest } from '@/components/media/TeamCrest';

import { toggleId, type FavouritesSelection, type FavouritesSelectorProps } from './types';

/**
 * Home / Third favourites selector: each category is a bordered, surface-coloured
 * card of compact rows (icon, name, checkbox) separated by dividers — a row-table
 * look distinct from the page, with smaller text.
 */
export function StackedFavSelector({ value, onChange }: FavouritesSelectorProps) {
  const sections: {
    key: keyof FavouritesSelection;
    title: string;
    items: CatalogItem[];
    icon?: LucideIcon;
    useCrest?: boolean;
  }[] = [
    { key: 'leagues', title: 'Leagues', items: catalogLeagues, icon: Trophy },
    { key: 'competitions', title: 'Competitions', items: catalogCompetitions, icon: Medal },
    { key: 'teams', title: 'Teams', items: catalogTeams, useCrest: true },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {sections.map((section) => (
        <Section
          key={section.key}
          title={section.title}
          items={section.items}
          icon={section.icon}
          useCrest={section.useCrest}
          selected={value[section.key]}
          onToggleItem={(id) => onChange({ ...value, [section.key]: toggleId(value[section.key], id) })}
          onSelectAll={(next) => onChange({ ...value, [section.key]: next })}
        />
      ))}
    </ScrollView>
  );
}

function Section({
  title,
  items,
  icon,
  useCrest,
  selected,
  onToggleItem,
  onSelectAll,
}: {
  title: string;
  items: CatalogItem[];
  icon?: LucideIcon;
  useCrest?: boolean;
  selected: string[];
  onToggleItem: (id: string) => void;
  onSelectAll: (next: string[]) => void;
}) {
  const theme = useTheme();
  const allIds = items.map((i) => i.id);
  const allSelected = allIds.every((id) => selected.includes(id));

  return (
    <Box marginBottom="md">
      <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xs">
        <BRText variant="label">{title}</BRText>
        <Pressable onPress={() => onSelectAll(allSelected ? [] : allIds)} accessibilityRole="button">
          <BRText variant="caption" style={{ color: theme.colors.primary, fontWeight: '700' }}>
            Select all
          </BRText>
        </Pressable>
      </Box>

      <Box backgroundColor="surface" borderWidth={1} borderColor="border" borderRadius="md" overflow="hidden">
        {items.map((item, idx) => (
          <Row
            key={item.id}
            item={item}
            icon={icon}
            useCrest={useCrest}
            selected={selected.includes(item.id)}
            onToggle={() => onToggleItem(item.id)}
            divider={idx > 0}
          />
        ))}
      </Box>
    </Box>
  );
}

function Row({
  item,
  icon: Icon,
  useCrest,
  selected,
  onToggle,
  divider,
}: {
  item: CatalogItem;
  icon?: LucideIcon;
  useCrest?: boolean;
  selected: boolean;
  onToggle: () => void;
  divider: boolean;
}) {
  const theme = useTheme();
  const r = useResponsive();
  const box = r.s(20);
  const badge = r.s(24);

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={item.name}
      testID={`fav-${item.id}`}
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
        {useCrest || !Icon ? (
          <TeamCrest name={item.name} size={badge} />
        ) : (
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
        <BRText variant="bodySmall" style={{ flex: 1, fontWeight: '600' }} numberOfLines={1}>
          {item.name}
        </BRText>
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
      </Box>
    </Pressable>
  );
}
