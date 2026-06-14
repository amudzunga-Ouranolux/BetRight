import { Modal, Pressable, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { BRText } from '@/components/primitives/BRText';
import { BRChip } from '@/components/primitives/BRChip';
import { BRButton } from '@/components/primitives/BRButton';
import { Toggle } from '@/components/inputs/Toggle';

import {
  CONFIDENCE_OPTIONS,
  MARKET_OPTIONS,
  SORT_OPTIONS,
  defaultFilters,
  type MatchFilters,
} from './filters';

export interface FilterSheetProps {
  visible: boolean;
  filters: MatchFilters;
  leagueOptions: { id: string; name: string }[];
  onChange: (next: MatchFilters) => void;
  onClose: () => void;
}

function FieldLabel({ children }: { children: string }) {
  const theme = useTheme();
  const r = useResponsive();
  return (
    <BRText style={{ fontSize: r.s(9), fontFamily: theme.fonts.semibold, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs }}>
      {children}
    </BRText>
  );
}

/** Bottom-sheet filter panel for Matches/Favourites. Applies changes live. */
export function FilterSheet({ visible, filters, leagueOptions, onChange, onClose }: FilterSheetProps) {
  const theme = useTheme();
  const r = useResponsive();
  const toggleLeague = (id: string) =>
    onChange({ ...filters, leagues: filters.leagues.includes(id) ? filters.leagues.filter((x) => x !== id) : [...filters.leagues, id] });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' }}>
        <Pressable onPress={() => {}}>
          <Box
            backgroundColor="surface"
            borderColor="border"
            style={{ borderTopLeftRadius: r.s(20), borderTopRightRadius: r.s(20), borderWidth: 1, maxHeight: r.hp(82) }}
          >
            <Box flexDirection="row" alignItems="center" justifyContent="space-between" padding="lg">
              <BRText style={{ fontSize: r.s(13), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>Filters</BRText>
              <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close filters">
                <X size={r.s(18)} color={theme.colors.textSecondary} strokeWidth={2.25} />
              </Pressable>
            </Box>

            <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md }} showsVerticalScrollIndicator={false}>
              <FieldLabel>Show prediction for</FieldLabel>
              <Box flexDirection="row" flexWrap="wrap" gap="xs">
                {MARKET_OPTIONS.map((m) => (
                  <BRChip key={m.key} label={m.label} selected={filters.market === m.key} onPress={() => onChange({ ...filters, market: m.key })} />
                ))}
              </Box>

              <Box height={r.s(14)} />
              <FieldLabel>Confidence</FieldLabel>
              <Box flexDirection="row" flexWrap="wrap" gap="xs">
                {CONFIDENCE_OPTIONS.map((c) => (
                  <BRChip key={c.key} label={c.label} selected={filters.confidence === c.key} onPress={() => onChange({ ...filters, confidence: c.key })} />
                ))}
              </Box>

              <Box height={r.s(14)} />
              <FieldLabel>Sort by</FieldLabel>
              <Box flexDirection="row" flexWrap="wrap" gap="xs">
                {SORT_OPTIONS.map((s) => (
                  <BRChip key={s.key} label={s.label} selected={filters.sort === s.key} onPress={() => onChange({ ...filters, sort: s.key })} />
                ))}
              </Box>

              <Box height={r.s(14)} />
              <FieldLabel>Leagues & competitions</FieldLabel>
              <Box flexDirection="row" flexWrap="wrap" gap="xs">
                {leagueOptions.map((l) => (
                  <BRChip key={l.id} label={l.name} selected={filters.leagues.includes(l.id)} onPress={() => toggleLeague(l.id)} />
                ))}
              </Box>

              <Box height={r.s(14)} />
              <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                <Box flex={1}>
                  <BRText style={{ fontSize: r.s(11), fontFamily: theme.fonts.semibold, color: theme.colors.textPrimary }}>Favourites only</BRText>
                  <BRText style={{ fontSize: r.s(9), fontFamily: theme.fonts.regular, color: theme.colors.textSecondary }}>Show only teams and competitions you follow</BRText>
                </Box>
                <Pressable onPress={() => onChange({ ...filters, favouritesOnly: !filters.favouritesOnly })} accessibilityRole="switch" accessibilityState={{ checked: filters.favouritesOnly }}>
                  <Toggle on={filters.favouritesOnly} />
                </Pressable>
              </Box>
            </ScrollView>

            <Box flexDirection="row" gap="md" padding="lg">
              <Box flex={1}>
                <BRButton label="Reset" variant="secondary" radius="sm" height={r.s(44)} onPress={() => onChange({ ...defaultFilters, date: filters.date })} fullWidth />
              </Box>
              <Box flex={1}>
                <BRButton label="Done" radius="sm" height={r.s(44)} onPress={onClose} fullWidth />
              </Box>
            </Box>
          </Box>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
