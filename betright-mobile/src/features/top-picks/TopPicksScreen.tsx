import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { useTopPicks, type TopPickPeriod } from '@/core/api/hooks';
import { Screen } from '@/components/layout/Screen';
import { BRText } from '@/components/primitives/BRText';
import { SegmentedTabs } from '@/components/inputs/SegmentedTabs';
import { SkeletonLoader } from '@/components/feedback/SkeletonLoader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { MatchCard } from '@/components/cards/MatchCard';

const PERIODS: { value: TopPickPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
];

/** Predictions ranked by AI confidence (highest first) for the chosen period. */
export function TopPicksScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const [period, setPeriod] = useState<TopPickPeriod>('today');
  const { data, isLoading, isError, refetch } = useTopPicks(period);

  return (
    <Screen edges={['top']}>
      <Box flexDirection="row" alignItems="center" gap="sm" paddingHorizontal="lg" paddingVertical="sm">
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back">
          <ChevronLeft size={r.s(20)} color={theme.colors.textPrimary} strokeWidth={2.25} />
        </Pressable>
        <BRText style={{ fontSize: r.s(13), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>
          Top AI Picks
        </BRText>
      </Box>

      <Box paddingHorizontal="lg" marginBottom="sm">
        <SegmentedTabs options={PERIODS} value={period} onChange={setPeriod} />
      </Box>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading || !data ? (
        <Box paddingHorizontal="lg" gap="sm">
          <SkeletonLoader height={r.s(96)} radius={r.s(12)} />
          <SkeletonLoader height={r.s(96)} radius={r.s(12)} />
        </Box>
      ) : data.length === 0 ? (
        <EmptyState title="No picks yet" message="Predictions for this period will appear here." />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg }} showsVerticalScrollIndicator={false}>
          {data.map((fx, i) => (
            <Box key={fx.fixtureId} flexDirection="row" alignItems="center" gap="sm">
              <BRText style={{ fontSize: r.s(11), fontFamily: theme.fonts.bold, color: theme.colors.primary, width: r.s(16) }}>
                {i + 1}
              </BRText>
              <Box flex={1}>
                <MatchCard fixture={fx} onPress={() => router.push(`/match/${fx.fixtureId}`)} />
              </Box>
            </Box>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
