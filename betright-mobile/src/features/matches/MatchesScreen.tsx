import { useMemo, useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { CalendarDays, Cpu, Info, Search, SlidersHorizontal, X } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { useMatches, type MatchFilter } from '@/core/api/hooks';
import { Screen } from '@/components/layout/Screen';
import { BRText } from '@/components/primitives/BRText';
import { BRIconButton } from '@/components/primitives/BRIconButton';
import { BRCard } from '@/components/primitives/BRCard';
import { Calendar } from '@/components/inputs/Calendar';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { SkeletonLoader } from '@/components/feedback/SkeletonLoader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { FixtureCard } from '@/components/cards/FixtureCard';

import { FilterSheet } from './FilterSheet';
import { activeFilterCount, applyFilters, defaultFilters, marketMetric, type MatchFilters } from './filters';

const TABS: { value: MatchFilter; label: string }[] = [
  { value: 'live', label: 'Live' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'upcoming', label: 'Upcoming' },
];

/** Demo favourites set (real favourites come from preferences later). */
const FAVOURITE_IDS = new Set(['fx_2', 'fx_3', 'fx_4']);

function formatDateChip(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function MatchesScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const [tab, setTab] = useState<MatchFilter>('tomorrow');
  const [filters, setFilters] = useState<MatchFilters>(defaultFilters);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useMatches(tab);

  const leagueOptions = useMemo(() => {
    const map = new Map<string, string>();
    (data ?? []).forEach((f) => map.set(f.competitionId, f.competitionName));
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [data]);

  const filtered = useMemo(() => (data ? applyFilters(data, filters, FAVOURITE_IDS) : []), [data, filters]);
  const badge = activeFilterCount(filters);

  const iconBtn = (icon: typeof CalendarDays, active: boolean, onPress: () => void, label: string, count?: number) => (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <Box width={r.s(34)} height={r.s(34)} borderRadius="sm" alignItems="center" justifyContent="center" borderWidth={1} borderColor="border" backgroundColor="surfaceAlt">
        {(() => {
          const I = icon;
          return <I size={r.s(16)} color={active ? theme.colors.primary : theme.colors.textSecondary} strokeWidth={2} />;
        })()}
        {count != null && count > 0 && (
          <Box position="absolute" style={{ top: -r.s(4), right: -r.s(4) }} width={r.s(14)} height={r.s(14)} borderRadius="pill" alignItems="center" justifyContent="center" backgroundColor="primary">
            <BRText style={{ fontSize: r.s(8), fontFamily: theme.fonts.bold, color: theme.colors.onPrimary }}>{count}</BRText>
          </Box>
        )}
      </Box>
    </Pressable>
  );

  return (
    <Screen edges={['top']}>
      <ScreenHeader title="Matches" right={<BRIconButton icon={Search} accessibilityLabel="Search matches" />} />

      {/* Tabs + calendar + filter */}
      <Box flexDirection="row" alignItems="center" gap="sm" paddingHorizontal="lg" marginBottom="sm">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ gap: theme.spacing.xs, alignItems: 'center' }}>
          {TABS.map((t) => {
            const active = t.value === tab;
            return (
              <Pressable key={t.value} onPress={() => setTab(t.value)} accessibilityRole="tab" accessibilityState={{ selected: active }}>
                <Box paddingHorizontal="md" paddingVertical="xs" borderRadius="pill" style={{ backgroundColor: active ? theme.colors.primary : 'transparent' }}>
                  <BRText style={{ fontSize: r.s(10), fontFamily: theme.fonts.semibold, color: active ? theme.colors.onPrimary : theme.colors.textSecondary }}>
                    {t.label}
                  </BRText>
                </Box>
              </Pressable>
            );
          })}
        </ScrollView>
        {iconBtn(CalendarDays, !!filters.date, () => setCalendarOpen(true), 'Pick a date')}
        {iconBtn(SlidersHorizontal, badge > 0, () => setFilterOpen(true), 'Filters', badge)}
      </Box>

      {/* Favourites-only context + date chips */}
      {(filters.favouritesOnly || filters.date) && (
        <Box flexDirection="row" gap="xs" paddingHorizontal="lg" marginBottom="sm">
          {filters.favouritesOnly && (
            <Pressable onPress={() => setFilters((f) => ({ ...f, favouritesOnly: false }))} accessibilityRole="button" accessibilityLabel="Clear favourites filter">
              <Box flexDirection="row" alignItems="center" gap="xxs" paddingHorizontal="sm" paddingVertical="xxs" borderRadius="pill" borderWidth={1} style={{ borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '1A' }}>
                <BRText style={{ fontSize: r.s(9), fontFamily: theme.fonts.semibold, color: theme.colors.primary }}>Favourites only</BRText>
                <X size={r.s(11)} color={theme.colors.primary} strokeWidth={2.5} />
              </Box>
            </Pressable>
          )}
          {filters.date && (
            <Pressable onPress={() => setFilters((f) => ({ ...f, date: null }))} accessibilityRole="button" accessibilityLabel="Clear date filter">
              <Box flexDirection="row" alignItems="center" gap="xxs" paddingHorizontal="sm" paddingVertical="xxs" borderRadius="pill" borderWidth={1} style={{ borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '1A' }}>
                <BRText style={{ fontSize: r.s(9), fontFamily: theme.fonts.semibold, color: theme.colors.primary }}>{formatDateChip(filters.date)}</BRText>
                <X size={r.s(11)} color={theme.colors.primary} strokeWidth={2.5} />
              </Box>
            </Pressable>
          )}
        </Box>
      )}

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading || !data ? (
        <Box paddingHorizontal="lg" gap="sm">
          <SkeletonLoader height={r.s(150)} radius={r.s(12)} />
          <SkeletonLoader height={r.s(150)} radius={r.s(12)} />
        </Box>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={filters.favouritesOnly ? 'No favourite matches' : 'No matches'}
          message={filters.favouritesOnly ? 'No favourite matches for this filter. Try a different date or add more favourite teams.' : 'No fixtures match your filters. Try clearing some.'}
        />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.sm }} showsVerticalScrollIndicator={false}>
          {filtered.map((fx) => (
            <FixtureCard key={fx.fixtureId} fixture={fx} metric={marketMetric(fx, filters.market)} onPress={() => router.push(`/match/${fx.fixtureId}`)} />
          ))}
        </ScrollView>
      )}

      <AiModelBar />

      <Calendar
        visible={calendarOpen}
        value={filters.date}
        onSelect={(iso) => {
          setFilters((f) => ({ ...f, date: iso }));
          setCalendarOpen(false);
        }}
        onClose={() => setCalendarOpen(false)}
      />
      <FilterSheet visible={filterOpen} filters={filters} leagueOptions={leagueOptions} onChange={setFilters} onClose={() => setFilterOpen(false)} />
    </Screen>
  );
}

/** Pinned AI-model status strip above the tab bar. */
function AiModelBar() {
  const theme = useTheme();
  const r = useResponsive();
  return (
    <Box paddingHorizontal="lg" paddingTop="xs" paddingBottom="sm">
      <BRCard padding="sm" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box flexDirection="row" alignItems="center" gap="sm" flex={1}>
          <Box width={r.s(26)} height={r.s(26)} borderRadius="sm" alignItems="center" justifyContent="center" style={{ backgroundColor: theme.colors.primary + '1A' }}>
            <Cpu size={r.s(14)} color={theme.colors.primary} strokeWidth={2} />
          </Box>
          <Box flex={1}>
            <BRText style={{ fontSize: r.s(9.5), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>AI Model</BRText>
            <BRText style={{ fontSize: r.s(7.5), fontFamily: theme.fonts.regular, color: theme.colors.textSecondary }} numberOfLines={1}>
              Predictions updated every 15 minutes
            </BRText>
          </Box>
        </Box>
        <Box flexDirection="row" alignItems="center" gap="md">
          <FooterStat value="84%" label="Accuracy" />
          <FooterStat value="12" label="High conf." />
          <Info size={r.s(14)} color={theme.colors.textSecondary} strokeWidth={2} />
        </Box>
      </BRCard>
    </Box>
  );
}

function FooterStat({ value, label }: { value: string; label: string }) {
  const theme = useTheme();
  const r = useResponsive();
  return (
    <Box alignItems="center">
      <BRText style={{ fontSize: r.s(11), fontFamily: theme.fonts.extrabold, color: theme.colors.primary }}>{value}</BRText>
      <BRText style={{ fontSize: r.s(7), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>{label}</BRText>
    </Box>
  );
}
