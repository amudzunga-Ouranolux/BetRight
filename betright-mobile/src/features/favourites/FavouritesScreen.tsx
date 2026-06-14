import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import {
  Activity,
  ArrowRight,
  Bell,
  Bookmark,
  ChevronRight,
  Clock,
  RefreshCw,
  Settings,
  TrendingUp,
  Users,
  CircleCheck,
  type LucideIcon,
} from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { useFavouritesHub, type FavouritesHub } from '@/core/api/hooks';
import type { Fixture } from '@/models/fixture.model';
import type { MatchOutcome } from '@/models/prediction.model';
import type { FavLeague, FavTeam, FavUpdate, FavUpdateKind, FormResult } from '@/core/api/mock/favourites';
import { formatKickoffLabel } from '@/core/utils/datetime';
import { Screen } from '@/components/layout/Screen';
import { BRText } from '@/components/primitives/BRText';
import { GlassCard } from '@/components/primitives/GlassCard';
import { Divider } from '@/components/layout/Divider';
import { SegmentedTabs } from '@/components/inputs/SegmentedTabs';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { SectionHeader } from '@/components/nav/SectionHeader';
import { SkeletonLoader } from '@/components/feedback/SkeletonLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { TeamCrest } from '@/components/media/TeamCrest';

type Tab = 'overview' | 'teams' | 'leagues' | 'alerts';
const TABS: { value: Tab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'teams', label: 'Teams' },
  { value: 'leagues', label: 'Leagues' },
  { value: 'alerts', label: 'Alerts' },
];

function resultLabel(o: MatchOutcome, h: string, a: string) {
  return o === 'home_win' ? `${h} Win` : o === 'away_win' ? `${a} Win` : 'Draw';
}

export function FavouritesScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const [tab, setTab] = useState<Tab>('overview');
  const { data, isLoading, isError, refetch } = useFavouritesHub();

  return (
    <Screen edges={['top']}>
      <ScreenHeader eyebrow="Your hub" title="My Favourites" subtitle="Your teams, leagues and predictions." />

      <Box paddingHorizontal="lg" marginBottom="sm">
        <SegmentedTabs options={TABS} value={tab} onChange={setTab} />
      </Box>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading || !data ? (
        <Box paddingHorizontal="lg" gap="sm">
          <SkeletonLoader height={r.s(56)} radius={r.s(12)} />
          <SkeletonLoader height={r.s(120)} radius={r.s(12)} />
        </Box>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg }} showsVerticalScrollIndicator={false}>
          {tab === 'overview' && <Overview data={data} />}
          {tab === 'teams' && data.teams.map((t, i) => <TeamCard key={t.id} team={t} top={i === 0} onPress={() => router.push(`/team/${t.id}` as never)} />)}
          {tab === 'leagues' && data.leagues.map((l, i) => <LeagueCard key={l.id} league={l} top={i === 0} onPress={() => router.push(`/competition/${l.id}` as never)} />)}
          {tab === 'alerts' && (
            <GlassCard overflow="hidden">
              {data.updates.map((u, i) => (
                <UpdateRow key={u.id} update={u} divider={i > 0} />
              ))}
            </GlassCard>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

function Overview({ data }: { data: FavouritesHub }) {
  const theme = useTheme();
  const r = useResponsive();
  return (
    <Box>
      {/* Personal summary */}
      <Box flexDirection="row" gap="sm">
        <StatCard icon={Activity} value={String(data.predictionsReady)} label="Predictions" sub="ready" />
        <StatCard icon={Bell} value={String(data.alerts)} label="Alerts" sub="new" />
        <StatCard icon={Bookmark} value={String(data.savedPicks)} label="Saved Picks" sub="" />
      </Box>

      <SectionHeader title="Next Up for Your Teams" actionLabel="" />
      <NextUp fixture={data.nextUp} />

      <SectionHeader title="AI Predictions for Your Favourites" onAction={() => router.push('/top-picks')} />
      <GlassCard overflow="hidden">
        {data.predictions.map((fx, i) => (
          <FavPredictionRow key={fx.fixtureId} fixture={fx} divider={i > 0} />
        ))}
      </GlassCard>

      <SectionHeader title="Important Updates" actionLabel="" />
      <GlassCard overflow="hidden">
        {data.updates.slice(0, 3).map((u, i) => (
          <UpdateRow key={u.id} update={u} divider={i > 0} />
        ))}
      </GlassCard>

      <Pressable onPress={() => router.push('/onboarding/favourites')} accessibilityRole="button" style={{ marginTop: theme.spacing.md }}>
        <GlassCard padding="md" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Settings size={r.s(16)} color={theme.colors.primary} strokeWidth={2} />
            <BRText style={{ fontSize: r.s(11), fontFamily: theme.fonts.semibold, color: theme.colors.textPrimary }}>Manage favourites</BRText>
          </Box>
          <ChevronRight size={r.s(14)} color={theme.colors.textSecondary} strokeWidth={2} />
        </GlassCard>
      </Pressable>
    </Box>
  );
}

function StatCard({ icon: Icon, value, label, sub }: { icon: LucideIcon; value: string; label: string; sub: string }) {
  const theme = useTheme();
  const r = useResponsive();
  return (
    <GlassCard padding="sm" style={{ flex: 1 }}>
      <Box flexDirection="row" alignItems="flex-start" justifyContent="space-between">
        <BRText style={{ fontSize: r.s(18), lineHeight: r.s(20), fontFamily: theme.fonts.extrabold, color: theme.colors.primary }}>{value}</BRText>
        <Icon size={r.s(13)} color={theme.colors.textSecondary} strokeWidth={2} />
      </Box>
      <BRText style={{ fontSize: r.s(8.5), lineHeight: r.s(11), fontFamily: theme.fonts.semibold, color: theme.colors.textPrimary }}>{label}</BRText>
      {sub ? (
        <BRText style={{ fontSize: r.s(8), lineHeight: r.s(10), fontFamily: theme.fonts.regular, color: theme.colors.textSecondary }}>{sub}</BRText>
      ) : null}
    </GlassCard>
  );
}

function FavPredictionRow({ fixture, divider }: { fixture: Fixture; divider: boolean }) {
  const theme = useTheme();
  const r = useResponsive();
  const p = fixture.predictionSummary;
  if (!p) return null;
  return (
    <Box>
      {divider && <Divider inset />}
      <Pressable onPress={() => router.push(`/match/${fixture.fixtureId}`)} accessibilityRole="button">
        <Box paddingHorizontal="md" paddingVertical="sm">
          <Box flexDirection="row" justifyContent="space-between">
            <BRText style={{ fontSize: r.s(7.5), fontFamily: theme.fonts.semibold, letterSpacing: 0.3, color: theme.colors.textSecondary }}>
              {fixture.competitionName.toUpperCase()}
            </BRText>
            <BRText style={{ fontSize: r.s(7.5), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>
              {formatKickoffLabel(fixture.kickoffTime)}
            </BRText>
          </Box>
          <Box flexDirection="row" alignItems="center" gap="xs" marginTop="xxs">
            <TeamCrest name={fixture.homeTeam.name} shortName={fixture.homeTeam.shortName} size={r.s(18)} />
            <BRText style={{ fontSize: r.s(9.5), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>{fixture.homeTeam.shortName}</BRText>
            <BRText style={{ fontSize: r.s(10), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary, marginHorizontal: theme.spacing.xs, fontVariant: ['tabular-nums'] }}>
              {p.likelyScore}
            </BRText>
            <BRText style={{ fontSize: r.s(9.5), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>{fixture.awayTeam.shortName}</BRText>
            <TeamCrest name={fixture.awayTeam.name} shortName={fixture.awayTeam.shortName} size={r.s(18)} />
            <Box flex={1} />
            <BRText style={{ fontSize: r.s(11), fontFamily: theme.fonts.extrabold, color: theme.colors.primary, fontVariant: ['tabular-nums'] }}>{p.confidenceScore}%</BRText>
          </Box>
          <Box marginTop="xs" borderRadius="pill" overflow="hidden" style={{ height: r.s(3), backgroundColor: theme.charts.confidenceTrack }}>
            <Box style={{ width: `${p.confidenceScore}%`, height: '100%', backgroundColor: theme.colors.primary }} />
          </Box>
        </Box>
      </Pressable>
    </Box>
  );
}

function NextUp({ fixture }: { fixture: Fixture }) {
  const theme = useTheme();
  const r = useResponsive();
  const p = fixture.predictionSummary;
  return (
    <GlassCard accent glow padding="md">
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="sm">
        <BRText style={{ fontSize: r.s(8), fontFamily: theme.fonts.semibold, color: theme.colors.primary }}>{fixture.competitionName}</BRText>
        <BRText style={{ fontSize: r.s(8), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>{formatKickoffLabel(fixture.kickoffTime)}</BRText>
      </Box>
      <Box flexDirection="row" alignItems="center" justifyContent="space-between">
        <Box alignItems="center" flex={1} gap="xxs">
          <TeamCrest name={fixture.homeTeam.name} shortName={fixture.homeTeam.shortName} size={r.s(34)} />
          <BRText style={{ fontSize: r.s(9.5), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }} numberOfLines={1}>{fixture.homeTeam.name}</BRText>
        </Box>
        <BRText style={{ fontSize: r.s(9.5), fontFamily: theme.fonts.semibold, color: theme.colors.textSecondary }}>VS</BRText>
        <Box alignItems="center" flex={1} gap="xxs">
          <TeamCrest name={fixture.awayTeam.name} shortName={fixture.awayTeam.shortName} size={r.s(34)} />
          <BRText style={{ fontSize: r.s(9.5), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }} numberOfLines={1}>{fixture.awayTeam.name}</BRText>
        </Box>
      </Box>
      {p && (
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginTop="sm" paddingTop="sm" borderTopWidth={1} borderColor="border">
          <Box>
            <BRText style={{ fontSize: r.s(8), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>AI Prediction</BRText>
            <BRText style={{ fontSize: r.s(10), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>
              {resultLabel(p.predictedResult, fixture.homeTeam.name, fixture.awayTeam.name)} — {p.confidenceScore}%
            </BRText>
          </Box>
          <Pressable onPress={() => router.push(`/match/${fixture.fixtureId}`)} accessibilityRole="button" accessibilityLabel="View prediction">
            <Box flexDirection="row" alignItems="center" gap="xs" paddingHorizontal="md" borderRadius="sm" style={{ height: r.s(30), backgroundColor: theme.colors.primary }}>
              <BRText style={{ fontSize: r.s(9), fontFamily: theme.fonts.bold, color: theme.colors.onPrimary }}>View Prediction</BRText>
              <ArrowRight size={r.s(12)} color={theme.colors.onPrimary} strokeWidth={2.5} />
            </Box>
          </Pressable>
        </Box>
      )}
    </GlassCard>
  );
}

const UPDATE_ICON: Record<FavUpdateKind, LucideIcon> = {
  prediction_changed: RefreshCw,
  lineup: Users,
  confidence_up: TrendingUp,
  starting_soon: Clock,
  result: CircleCheck,
};

function UpdateRow({ update, divider }: { update: FavUpdate; divider: boolean }) {
  const theme = useTheme();
  const r = useResponsive();
  const Icon = UPDATE_ICON[update.kind];
  const dividerLeft = theme.spacing.md + r.s(26) + theme.spacing.sm;
  return (
    <Box>
      {divider && <Divider leftInset={dividerLeft} rightInset={theme.spacing.md} />}
      <Box flexDirection="row" alignItems="center" paddingVertical="sm">
        <Box paddingLeft="md" paddingRight="sm">
          <Box width={r.s(26)} height={r.s(26)} borderRadius="sm" alignItems="center" justifyContent="center" backgroundColor="surfaceAlt">
            <Icon size={r.s(13)} color={theme.colors.primary} strokeWidth={2} />
          </Box>
        </Box>
        <Box flex={1} paddingRight="md">
          <BRText style={{ fontSize: r.s(9.5), lineHeight: r.s(12), fontFamily: theme.fonts.semibold, color: theme.colors.textPrimary }} numberOfLines={1}>{update.title}</BRText>
          <BRText style={{ fontSize: r.s(8), lineHeight: r.s(11), fontFamily: theme.fonts.regular, color: theme.colors.textSecondary }} numberOfLines={2}>{update.detail}</BRText>
        </Box>
        <BRText style={{ fontSize: r.s(8), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary, paddingRight: theme.spacing.md }}>{update.timeAgo}</BRText>
      </Box>
    </Box>
  );
}

function FormPills({ form }: { form: FormResult[] }) {
  const theme = useTheme();
  const r = useResponsive();
  const color = (f: FormResult) => (f === 'W' ? theme.colors.success : f === 'L' ? theme.colors.danger : theme.colors.textSecondary);
  return (
    <Box flexDirection="row" gap="xxs">
      {form.map((f, i) => (
        <Box key={i} width={r.s(13)} height={r.s(13)} borderRadius="xs" alignItems="center" justifyContent="center" style={{ backgroundColor: color(f) + '2E' }}>
          <BRText style={{ fontSize: r.s(7), fontFamily: theme.fonts.bold, color: color(f) }}>{f}</BRText>
        </Box>
      ))}
    </Box>
  );
}

function TeamCard({ team, top, onPress }: { team: FavTeam; top: boolean; onPress: () => void }) {
  const theme = useTheme();
  const r = useResponsive();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={team.name} style={{ marginTop: top ? 0 : theme.spacing.xs }}>
      <GlassCard padding="md">
        <Box flexDirection="row" alignItems="center" gap="sm">
          <TeamCrest name={team.name} shortName={team.shortName} size={r.s(30)} />
          <Box flex={1}>
            <BRText style={{ fontSize: r.s(11), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>{team.name}</BRText>
            <BRText style={{ fontSize: r.s(8.5), fontFamily: theme.fonts.regular, color: theme.colors.textSecondary }}>Next: {team.opponent} · {team.kickoff}</BRText>
          </Box>
          <ChevronRight size={r.s(14)} color={theme.colors.textSecondary} />
        </Box>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginTop="sm">
          <FormPills form={team.form} />
          <BRText style={{ fontSize: r.s(9), fontFamily: theme.fonts.semibold, color: theme.colors.primary }}>{team.predLabel} {team.predPct}%</BRText>
        </Box>
      </GlassCard>
    </Pressable>
  );
}

function LeagueCard({ league, top, onPress }: { league: FavLeague; top: boolean; onPress: () => void }) {
  const theme = useTheme();
  const r = useResponsive();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={league.name} style={{ marginTop: top ? 0 : theme.spacing.xs }}>
      <GlassCard padding="md">
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <BRText style={{ fontSize: r.s(11), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>{league.name}</BRText>
          <ChevronRight size={r.s(14)} color={theme.colors.textSecondary} />
        </Box>
        <Box flexDirection="row" gap="md" marginTop="xs">
          <BRText style={{ fontSize: r.s(8.5), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>{league.matchesToday} today</BRText>
          <BRText style={{ fontSize: r.s(8.5), fontFamily: theme.fonts.semibold, color: theme.colors.primary }}>{league.highConfidence} high-confidence</BRText>
        </Box>
        <BRText style={{ fontSize: r.s(8.5), fontFamily: theme.fonts.regular, color: theme.colors.textSecondary, marginTop: theme.spacing.xxs }}>{league.note}</BRText>
      </GlassCard>
    </Pressable>
  );
}
