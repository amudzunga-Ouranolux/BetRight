import { Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { useTeamProfile } from '@/core/api/hooks';
import { Screen } from '@/components/layout/Screen';
import { BRText } from '@/components/primitives/BRText';
import { GlassCard } from '@/components/primitives/GlassCard';
import { SectionHeader } from '@/components/nav/SectionHeader';
import { SkeletonLoader } from '@/components/feedback/SkeletonLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { TeamCrest } from '@/components/media/TeamCrest';
import { MatchCard } from '@/components/cards/MatchCard';

/** Team profile: rating, recent form, and upcoming fixtures with predictions. */
export function TeamProfileScreen({ teamId }: { teamId: string }) {
  const theme = useTheme();
  const r = useResponsive();
  const { data, isLoading, isError, refetch } = useTeamProfile(teamId);

  return (
    <Screen edges={['top']}>
      <Box flexDirection="row" alignItems="center" gap="sm" paddingHorizontal="lg" paddingVertical="sm">
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back">
          <ChevronLeft size={r.s(20)} color={theme.colors.textPrimary} strokeWidth={2.25} />
        </Pressable>
        <BRText style={{ fontSize: r.s(13), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>
          {data?.team.name ?? 'Team'}
        </BRText>
      </Box>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading || !data ? (
        <Box paddingHorizontal="lg" gap="sm">
          <SkeletonLoader height={r.s(96)} radius={r.s(12)} />
          <SkeletonLoader height={r.s(80)} radius={r.s(12)} />
        </Box>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg }} showsVerticalScrollIndicator={false}>
          <GlassCard padding="md">
            <Box flexDirection="row" alignItems="center" gap="md">
              <TeamCrest name={data.team.name} shortName={data.team.shortName} size={r.s(44)} />
              <Box flex={1}>
                <BRText style={{ fontSize: r.s(14), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>{data.team.name}</BRText>
                {data.competitionName ? (
                  <BRText variant="caption">{data.competitionName}</BRText>
                ) : null}
              </Box>
              <Box alignItems="flex-end">
                <BRText style={{ fontSize: r.s(16), fontFamily: theme.fonts.extrabold, color: theme.colors.primary }}>{Math.round(data.elo)}</BRText>
                <BRText variant="label">Elo rating</BRText>
              </Box>
            </Box>

            <Box flexDirection="row" alignItems="center" gap="sm" marginTop="md">
              <BRText variant="label">Recent form</BRText>
              <Box flexDirection="row" gap="xs">
                {data.form.recentResults.map((res, i) => {
                  const tone = res === 'W' ? theme.colors.success : res === 'L' ? theme.colors.danger : theme.colors.textSecondary;
                  return (
                    <Box key={i} width={r.s(16)} height={r.s(16)} borderRadius="xs" alignItems="center" justifyContent="center" style={{ backgroundColor: tone + '26', borderWidth: 1, borderColor: tone + '4D' }}>
                      <BRText style={{ fontSize: r.s(8.5), fontFamily: theme.fonts.bold, color: tone }}>{res}</BRText>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box flexDirection="row" gap="lg" marginTop="md">
              <Stat label="Goals scored" value={data.form.goalsScoredAvg.toFixed(1)} />
              <Stat label="Goals conceded" value={data.form.goalsConcededAvg.toFixed(1)} />
              <Stat label="Sampled" value={String(data.form.matchesSampled)} />
            </Box>
          </GlassCard>

          <SectionHeader title="Upcoming fixtures" actionLabel="" />
          {data.upcoming.length === 0 ? (
            <GlassCard padding="md">
              <BRText variant="bodySmall">No upcoming fixtures scheduled.</BRText>
            </GlassCard>
          ) : (
            data.upcoming.map((fx) => (
              <Box key={fx.fixtureId} marginBottom="xs">
                <MatchCard fixture={fx} onPress={() => router.push(`/match/${fx.fixtureId}`)} />
              </Box>
            ))
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  const r = useResponsive();
  return (
    <Box>
      <BRText style={{ fontSize: r.s(13), fontFamily: theme.fonts.extrabold, color: theme.colors.primary }}>{value}</BRText>
      <BRText variant="label">{label}</BRText>
    </Box>
  );
}
