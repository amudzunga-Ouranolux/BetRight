import { Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { useCompetitionProfile } from '@/core/api/hooks';
import { Screen } from '@/components/layout/Screen';
import { BRText } from '@/components/primitives/BRText';
import { GlassCard } from '@/components/primitives/GlassCard';
import { Divider } from '@/components/layout/Divider';
import { SectionHeader } from '@/components/nav/SectionHeader';
import { SkeletonLoader } from '@/components/feedback/SkeletonLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { TeamCrest } from '@/components/media/TeamCrest';
import { MatchCard } from '@/components/cards/MatchCard';

/** Competition profile: power-ranking table (by Elo) + upcoming fixtures. */
export function CompetitionProfileScreen({ competitionId }: { competitionId: string }) {
  const theme = useTheme();
  const r = useResponsive();
  const { data, isLoading, isError, refetch } = useCompetitionProfile(competitionId);

  return (
    <Screen edges={['top']}>
      <Box flexDirection="row" alignItems="center" gap="sm" paddingHorizontal="lg" paddingVertical="sm">
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back">
          <ChevronLeft size={r.s(20)} color={theme.colors.textPrimary} strokeWidth={2.25} />
        </Pressable>
        <BRText style={{ fontSize: r.s(13), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>
          {data?.name ?? 'Competition'}
        </BRText>
      </Box>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading || !data ? (
        <Box paddingHorizontal="lg" gap="sm">
          <SkeletonLoader height={r.s(140)} radius={r.s(12)} />
        </Box>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg }} showsVerticalScrollIndicator={false}>
          <SectionHeader title="Power ranking" actionLabel="" />
          <GlassCard overflow="hidden">
            {data.table.map((row, i) => (
              <Box key={row.team.teamId}>
                {i > 0 && <Divider inset />}
                <Pressable onPress={() => router.push(`/team/${row.team.teamId}` as never)} accessibilityRole="button">
                  <Box flexDirection="row" alignItems="center" gap="sm" paddingHorizontal="md" paddingVertical="sm">
                    <BRText style={{ width: r.s(16), fontSize: r.s(10), fontFamily: theme.fonts.bold, color: theme.colors.textSecondary }}>{i + 1}</BRText>
                    <TeamCrest name={row.team.name} shortName={row.team.shortName} size={r.s(22)} />
                    <BRText style={{ flex: 1, fontSize: r.s(11), fontFamily: theme.fonts.semibold, color: theme.colors.textPrimary }} numberOfLines={1}>{row.team.name}</BRText>
                    <BRText style={{ fontSize: r.s(11), fontFamily: theme.fonts.extrabold, color: theme.colors.primary }}>{Math.round(row.elo)}</BRText>
                  </Box>
                </Pressable>
              </Box>
            ))}
          </GlassCard>

          <SectionHeader title="Upcoming fixtures" actionLabel="" />
          {data.upcoming.map((fx) => (
            <Box key={fx.fixtureId} marginBottom="xs">
              <MatchCard fixture={fx} onPress={() => router.push(`/match/${fx.fixtureId}`)} />
            </Box>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
