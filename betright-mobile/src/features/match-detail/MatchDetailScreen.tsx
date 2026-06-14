import { useState } from 'react';
import { Pressable, ScrollView, type TextStyle } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Share2, Sparkles, Star, Trophy } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { AWAY_ACCENT } from '@/core/theme/palette';
import { useMatchDetail, savePrediction, unsavePrediction, type MatchStatRow } from '@/core/api/hooks';
import type { Fixture } from '@/models/fixture.model';
import type { MatchPrediction } from '@/models/prediction.model';
import { formatKickoffTime } from '@/core/utils/datetime';
import { Screen } from '@/components/layout/Screen';
import { BRText } from '@/components/primitives/BRText';
import { GlassCard } from '@/components/primitives/GlassCard';
import { SkeletonLoader } from '@/components/feedback/SkeletonLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { TeamCrest } from '@/components/media/TeamCrest';
import { ProbabilityBar } from '@/components/data-viz/ProbabilityBar';

type Tab = 'overview' | 'stats' | 'form' | 'lineups';
const TABS: { value: Tab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'stats', label: 'Stats' },
  { value: 'form', label: 'Form' },
  { value: 'lineups', label: 'Lineups' },
];

export function MatchDetailScreen({ fixtureId }: { fixtureId: string }) {
  const theme = useTheme();
  const r = useResponsive();
  const [tab, setTab] = useState<Tab>('overview');
  const [savedId, setSavedId] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useMatchDetail(fixtureId);

  const toggleSave = async () => {
    if (savedId) {
      await unsavePrediction(savedId);
      setSavedId(null);
    } else {
      const s = await savePrediction(fixtureId);
      setSavedId(s.id);
    }
  };

  return (
    <Screen edges={['top']}>
      {/* Header */}
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" paddingHorizontal="lg" paddingVertical="sm">
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back">
          <ChevronLeft size={r.s(20)} color={theme.colors.textPrimary} strokeWidth={2.25} />
        </Pressable>
        <Box flexDirection="row" alignItems="center" gap="xxs">
          <Trophy size={r.s(12)} color={theme.colors.primary} strokeWidth={2} />
          <BRText style={{ fontSize: r.s(11), fontFamily: theme.fonts.semibold, color: theme.colors.textPrimary }}>
            {data?.fixture.competitionName ?? 'Match'}
          </BRText>
        </Box>
        <Box flexDirection="row" alignItems="center" gap="md">
          <Pressable hitSlop={8} accessibilityRole="button" accessibilityLabel="Share">
            <Share2 size={r.s(16)} color={theme.colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <Pressable onPress={toggleSave} hitSlop={8} accessibilityRole="button" accessibilityLabel="Save prediction" accessibilityState={{ selected: !!savedId }}>
            <Star
              size={r.s(18)}
              color={theme.colors.primary}
              strokeWidth={2}
              fill={savedId ? theme.colors.primary : 'transparent'}
            />
          </Pressable>
        </Box>
      </Box>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading || !data ? (
        <Box padding="lg" gap="md">
          <SkeletonLoader height={r.s(90)} radius={r.s(12)} />
          <SkeletonLoader height={r.s(140)} radius={r.s(12)} />
        </Box>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg }} showsVerticalScrollIndicator={false}>
          <TeamsHeader fixture={data.fixture} />

          {/* Tabs */}
          <Box flexDirection="row" gap="lg" marginTop="md" marginBottom="sm" borderBottomWidth={1} borderColor="border">
            {TABS.map((t) => {
              const active = t.value === tab;
              return (
                <Pressable key={t.value} onPress={() => setTab(t.value)} accessibilityRole="tab" accessibilityState={{ selected: active }}>
                  <Box paddingBottom="sm" style={{ borderBottomWidth: 2, borderColor: active ? theme.colors.primary : 'transparent' }}>
                    <BRText
                      style={{
                        fontSize: r.s(11),
                        fontFamily: active ? theme.fonts.semibold : theme.fonts.medium,
                        color: active ? theme.colors.primary : theme.colors.textSecondary,
                      }}
                    >
                      {t.label}
                    </BRText>
                  </Box>
                </Pressable>
              );
            })}
          </Box>

          {tab === 'overview' ? (
            <Box>
              <WinProbability fixture={data.fixture} prediction={data.prediction} />
              <SectionDivider />
              <ExpectedGoals prediction={data.prediction} />
              <SectionDivider />
              <LikelyScorelines prediction={data.prediction} />
              <SectionDivider />
              <AiInsight summary={data.prediction.summary} />
              <Box marginTop="sm">
                <KeyStatistics stats={data.stats} />
              </Box>
            </Box>
          ) : (
            <GlassCard padding="md">
              <BRText style={{ fontSize: r.s(10), fontFamily: theme.fonts.regular, color: theme.colors.textSecondary }}>
                {tab === 'stats' ? 'Attack, defence and historical stats' : tab === 'form' ? 'Recent form and momentum' : 'Predicted and confirmed lineups'} appear here once the backend is connected.
              </BRText>
            </GlassCard>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

function TeamsHeader({ fixture }: { fixture: Fixture }) {
  const theme = useTheme();
  const r = useResponsive();
  return (
    <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginTop="sm">
      <Box alignItems="center" flex={1} gap="xs">
        <TeamCrest name={fixture.homeTeam.name} shortName={fixture.homeTeam.shortName} size={r.s(48)} />
        <BRText style={{ fontSize: r.s(11), lineHeight: r.s(14), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary, textAlign: 'center' }} numberOfLines={2}>
          {fixture.homeTeam.name}
        </BRText>
      </Box>
      <Box alignItems="center" gap="xxs">
        <BRText style={{ fontSize: r.s(13), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>VS</BRText>
        <BRText style={{ fontSize: r.s(9), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>
          Today, {formatKickoffTime(fixture.kickoffTime)}
        </BRText>
        {fixture.venue && (
          <BRText style={{ fontSize: r.s(8), fontFamily: theme.fonts.regular, color: theme.colors.textSecondary }}>
            {fixture.venue}
          </BRText>
        )}
      </Box>
      <Box alignItems="center" flex={1} gap="xs">
        <TeamCrest name={fixture.awayTeam.name} shortName={fixture.awayTeam.shortName} size={r.s(48)} />
        <BRText style={{ fontSize: r.s(11), lineHeight: r.s(14), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary, textAlign: 'center' }} numberOfLines={2}>
          {fixture.awayTeam.name}
        </BRText>
      </Box>
    </Box>
  );
}

function CardTitle({ children }: { children: string }) {
  const theme = useTheme();
  const r = useResponsive();
  return (
    <BRText style={{ fontSize: r.s(11), fontFamily: theme.fonts.semibold, color: theme.colors.textPrimary }}>
      {children}
    </BRText>
  );
}

function SectionDivider() {
  const theme = useTheme();
  return <Box marginVertical="sm" style={{ height: 1, backgroundColor: theme.colors.border }} />;
}

function WinProbability({ fixture, prediction: p }: { fixture: Fixture; prediction: MatchPrediction }) {
  const theme = useTheme();
  const r = useResponsive();
  const big = (color: string): TextStyle => ({ fontSize: r.s(14), lineHeight: r.s(16), fontFamily: theme.fonts.extrabold, color, fontVariant: ['tabular-nums'] });
  const lbl: TextStyle = { fontSize: r.s(8), lineHeight: r.s(10), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary };

  return (
    <Box>
      <CardTitle>Win Probability (AI)</CardTitle>
      <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start" marginTop="xs" marginBottom="xs">
        <Box flex={1}>
          <BRText style={lbl} numberOfLines={1}>{fixture.homeTeam.name}</BRText>
          <BRText style={big(theme.colors.primary)}>{p.homeWinProbability}%</BRText>
        </Box>
        <Box flex={1} alignItems="center">
          <BRText style={big(theme.colors.textPrimary)}>{p.drawProbability}%</BRText>
          <BRText style={lbl}>Draw</BRText>
        </Box>
        <Box flex={1} alignItems="flex-end">
          <BRText style={[lbl, { color: AWAY_ACCENT, textAlign: 'right' }]} numberOfLines={1}>{fixture.awayTeam.name}</BRText>
          <BRText style={big(AWAY_ACCENT)}>{p.awayWinProbability}%</BRText>
        </Box>
      </Box>
      <ProbabilityBar home={p.homeWinProbability} draw={p.drawProbability} away={p.awayWinProbability} showLabels={false} height={r.s(6)} />
    </Box>
  );
}

function ExpectedGoals({ prediction: p }: { prediction: MatchPrediction }) {
  const theme = useTheme();
  const r = useResponsive();
  const total = p.expectedGoals.homeXg + p.expectedGoals.awayXg || 1;
  const homePct = (p.expectedGoals.homeXg / total) * 100;
  const knob = r.s(12);

  return (
    <Box>
      <CardTitle>Expected Goals (xG)</CardTitle>
      <Box flexDirection="row" justifyContent="space-between" marginTop="xs" marginBottom="xs">
        <BRText style={{ fontSize: r.s(14), fontFamily: theme.fonts.bold, color: theme.colors.primary, fontVariant: ['tabular-nums'] }}>
          {p.expectedGoals.homeXg.toFixed(2)}
        </BRText>
        <BRText style={{ fontSize: r.s(14), fontFamily: theme.fonts.bold, color: AWAY_ACCENT, fontVariant: ['tabular-nums'] }}>
          {p.expectedGoals.awayXg.toFixed(2)}
        </BRText>
      </Box>
      <Box justifyContent="center" style={{ height: knob }}>
        <Box flexDirection="row" borderRadius="pill" overflow="hidden" style={{ height: r.s(6) }}>
          <Box style={{ width: `${homePct}%`, backgroundColor: theme.colors.primary }} />
          <Box style={{ flex: 1, backgroundColor: AWAY_ACCENT }} />
        </Box>
        <Box
          style={{
            position: 'absolute',
            left: `${homePct}%`,
            width: knob,
            height: knob,
            borderRadius: knob / 2,
            marginLeft: -knob / 2,
            backgroundColor: theme.colors.textPrimary,
            borderWidth: 2,
            borderColor: theme.colors.primary,
          }}
        />
      </Box>
    </Box>
  );
}

function LikelyScorelines({ prediction: p }: { prediction: MatchPrediction }) {
  const theme = useTheme();
  const r = useResponsive();
  const top = p.scorelines.slice(0, 5);
  const otherPct = Math.max(0, 100 - top.reduce((s, x) => s + x.probability, 0));
  const items = [...top.map((s) => ({ score: s.score.replace(/\s/g, ''), pct: s.probability })), { score: 'Other', pct: otherPct }];

  return (
    <Box>
      <CardTitle>Likely Scorelines</CardTitle>
      <Box flexDirection="row" gap="xs" marginTop="xs">
        {items.map((item, i) => {
          const selected = i === 0;
          return (
            <Box
              key={item.score}
              flex={1}
              alignItems="center"
              paddingVertical="xs"
              borderRadius="sm"
              borderWidth={1}
              style={{
                backgroundColor: selected ? theme.colors.primary + '1A' : theme.colors.surfaceAlt + 'B3',
                borderColor: selected ? theme.colors.primary : theme.colors.border,
              }}
            >
              <BRText style={{ fontSize: r.s(10), fontFamily: theme.fonts.bold, color: selected ? theme.colors.primary : theme.colors.textPrimary }}>
                {item.score}
              </BRText>
              <BRText style={{ fontSize: r.s(8), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>
                {item.pct}%
              </BRText>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function AiInsight({ summary }: { summary: string }) {
  const theme = useTheme();
  const r = useResponsive();
  return (
    <Box>
      <Box flexDirection="row" alignItems="center" gap="xxs">
        <Sparkles size={r.s(12)} color={theme.colors.primary} strokeWidth={2.5} />
        <CardTitle>AI Insight</CardTitle>
      </Box>
      <BRText style={{ fontSize: r.s(10), lineHeight: r.s(15), fontFamily: theme.fonts.regular, color: theme.colors.textSecondary, marginTop: theme.spacing.xxs }}>
        {summary}
      </BRText>
    </Box>
  );
}

function KeyStatistics({ stats }: { stats: MatchStatRow[] }) {
  const theme = useTheme();
  const r = useResponsive();
  return (
    <GlassCard padding="md">
      <CardTitle>Key Statistics</CardTitle>
      <Box marginTop="xs">
        {stats.map((row) => (
          <Box key={row.label} flexDirection="row" alignItems="center" paddingVertical="xs">
            <BRText style={{ fontSize: r.s(11), fontFamily: theme.fonts.bold, color: theme.colors.primary, flex: 1, fontVariant: ['tabular-nums'] }}>
              {row.home}
            </BRText>
            <BRText style={{ fontSize: r.s(9), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary, flex: 2, textAlign: 'center' }}>
              {row.label}
            </BRText>
            <BRText style={{ fontSize: r.s(11), fontFamily: theme.fonts.bold, color: AWAY_ACCENT, flex: 1, textAlign: 'right', fontVariant: ['tabular-nums'] }}>
              {row.away}
            </BRText>
          </Box>
        ))}
      </Box>
    </GlassCard>
  );
}
