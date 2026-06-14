import { useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import {
  ArrowRight,
  Activity,
  Bell,
  Calendar,
  CalendarDays,
  ChevronRight,
  CircleDot,
  Crown,
  Flame,
  Menu,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { kitAssets } from '@/core/theme/assets';
import { useThemeStore } from '@/core/theme/themeStore';
import { useHome } from '@/core/api/hooks';
import type { Fixture } from '@/models/fixture.model';
import type { MatchOutcome } from '@/models/prediction.model';
import type { TrendingPick, NewsItem } from '@/core/api/mock/fixtures';
import { formatKickoffTime, formatKickoffDay } from '@/core/utils/datetime';
import { Screen } from '@/components/layout/Screen';
import { Divider } from '@/components/layout/Divider';
import { BRText } from '@/components/primitives/BRText';
import { GlassCard } from '@/components/primitives/GlassCard';
import { QuickFilterChip } from '@/components/inputs/QuickFilterChip';
import { TeamCrest } from '@/components/media/TeamCrest';
import { ConfidenceGauge } from '@/components/data-viz/ConfidenceGauge';
import { SectionHeader } from '@/components/nav/SectionHeader';
import { SkeletonLoader } from '@/components/feedback/SkeletonLoader';
import { ErrorState } from '@/components/feedback/ErrorState';

const QUICK_FILTERS: { icon: LucideIcon; label: string }[] = [
  { icon: Calendar, label: 'Today' },
  { icon: CalendarDays, label: 'Tomorrow' },
  { icon: Zap, label: 'High Conf.' },
  { icon: TrendingUp, label: 'Over 2.5' },
  { icon: Target, label: 'BTTS' },
];

function resultLabel(outcome: MatchOutcome, home: string, away: string): string {
  if (outcome === 'home_win') return `${home} Win`;
  if (outcome === 'away_win') return `${away} Win`;
  return 'Draw';
}

export function HomeScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const kitId = useThemeStore((s) => s.kitId);
  const { data, isLoading, isError, refetch } = useHome();

  const logoW = r.s(96);
  // Taller screens show one more row per list so the page fills the viewport;
  // compact screens stay short. Trending stays at 2 (the two standout picks).
  const tall = r.height >= 820;
  const followedCount = tall ? 3 : 2;
  const upcomingCount = tall ? 3 : 2;
  const newsCount = tall ? 3 : 2;

  return (
    <Screen edges={['top']} scrim={0.5}>
      {/* Header: menu / logo / bell + avatar */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="lg"
        paddingVertical="sm"
      >
        <Pressable accessibilityRole="button" accessibilityLabel="Menu" hitSlop={8}>
          <Menu size={r.s(22)} color={theme.colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Image source={kitAssets[kitId].logoFull} style={{ width: logoW, height: logoW / kitAssets[kitId].logoAR }} contentFit="contain" />
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Pressable accessibilityRole="button" accessibilityLabel="Notifications" hitSlop={8} onPress={() => router.push('/notifications' as never)}>
            <Bell size={r.s(20)} color={theme.colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Profile" onPress={() => router.push('/(tabs)/profile')}>
            <TeamCrest name="Adriano Silva" shortName="AS" size={r.s(28)} />
          </Pressable>
        </Box>
      </Box>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading || !data ? (
        <Box gap="md" paddingHorizontal="lg">
          <SkeletonLoader height={r.s(40)} radius={r.s(12)} />
          <SkeletonLoader height={r.s(190)} radius={r.s(16)} />
          <SkeletonLoader height={r.s(56)} radius={r.s(12)} />
        </Box>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg }}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting */}
          <Box flexDirection="row" alignItems="flex-start" justifyContent="space-between" marginBottom="sm">
            <Box flex={1}>
              <BRText style={{ fontSize: r.s(8.5), lineHeight: r.s(11), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>
                Good evening,
              </BRText>
              <BRText style={{ fontSize: r.s(13), lineHeight: r.s(16), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>
                {data.greetingName}
              </BRText>
              <BRText style={{ fontSize: r.s(8.5), lineHeight: r.s(11), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>
                Your AI match outlook is ready.
              </BRText>
            </Box>
            <Box
              flexDirection="row"
              alignItems="center"
              gap="xxs"
              paddingHorizontal="sm"
              paddingVertical="xxs"
              borderRadius="pill"
              borderWidth={1}
              style={{ borderColor: theme.colors.primary + '66', backgroundColor: theme.colors.primary + '1A' }}
            >
              <Crown size={r.s(12)} color={theme.colors.primary} strokeWidth={2.5} />
              <BRText variant="label" style={{ color: theme.colors.primary }}>
                Level Pro
              </BRText>
            </Box>
          </Box>

          <SectionHeader title="Top AI Pick Today" size={r.s(10)} onAction={() => router.push('/top-picks')} />
          <TopPredictionCard fixture={data.topPick} />

          <SectionHeader title="Quick Filters" size={r.s(10)} onAction={() => router.push('/(tabs)/matches')} />
          <Box flexDirection="row" gap="sm">
            {QUICK_FILTERS.map((f, i) => (
              <QuickFilterChip key={f.label} icon={f.icon} label={f.label} selected={i === 0} />
            ))}
          </Box>

          <SectionHeader title="Trending AI Picks" size={r.s(9)} onAction={() => router.push('/top-picks')} />
          <Box flexDirection="row" gap="sm">
            {data.trending.map((pick) => (
              <TrendingCard key={pick.id} pick={pick} />
            ))}
          </Box>

          <SectionHeader title="Followed Matches" size={r.s(9)} onAction={() => router.push('/(tabs)/favourites')} />
          <GlassCard overflow="hidden">
            {data.followed.slice(0, followedCount).map((fx, i) => (
              <FollowedRow key={fx.fixtureId} fixture={fx} divider={i > 0} />
            ))}
          </GlassCard>

          <SectionHeader title="Upcoming" size={r.s(9)} onAction={() => router.push('/(tabs)/matches')} />
          <GlassCard overflow="hidden">
            {data.upcoming.slice(0, upcomingCount).map((fx, i) => (
              <FollowedRow key={fx.fixtureId} fixture={fx} divider={i > 0} showBell={false} />
            ))}
          </GlassCard>

          <SectionHeader title="News / Context Feed" size={r.s(9)} />
          <GlassCard overflow="hidden">
            {data.news.slice(0, newsCount).map((item, i) => (
              <NewsRow key={item.id} item={item} divider={i > 0} />
            ))}
          </GlassCard>
        </ScrollView>
      )}
    </Screen>
  );
}

/** Thin vertical divider used to separate inline cells. */
function VDivider() {
  const theme = useTheme();
  return <Box alignSelf="stretch" marginHorizontal="sm" style={{ width: 1, backgroundColor: theme.colors.border }} />;
}

function TopPredictionCard({ fixture }: { fixture: Fixture }) {
  const theme = useTheme();
  const r = useResponsive();
  const p = fixture.predictionSummary;
  if (!p) return null;

  return (
    <GlassCard accent glow padding="sm" opacityHex="99">
      {/* League + time */}
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="xs">
        <BRText style={{ fontSize: r.s(8), color: theme.colors.primary, fontFamily: theme.fonts.semibold }}>
          {fixture.competitionName} • Today
        </BRText>
        <BRText style={{ fontSize: r.s(8), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>
          {formatKickoffTime(fixture.kickoffTime)}
        </BRText>
      </Box>

      {/* Teams */}
      <Box flexDirection="row" alignItems="center" justifyContent="space-between">
        <Box alignItems="center" flex={1} gap="xxs">
          <TeamCrest name={fixture.homeTeam.name} shortName={fixture.homeTeam.shortName} size={r.s(36)} />
          <BRText style={{ fontSize: r.s(9.5), lineHeight: r.s(12), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }} numberOfLines={1}>
            {fixture.homeTeam.name}
          </BRText>
        </Box>
        <BRText style={{ fontSize: r.s(9.5), fontFamily: theme.fonts.semibold, color: theme.colors.textSecondary }}>
          VS
        </BRText>
        <Box alignItems="center" flex={1} gap="xxs">
          <TeamCrest name={fixture.awayTeam.name} shortName={fixture.awayTeam.shortName} size={r.s(36)} />
          <BRText style={{ fontSize: r.s(9.5), lineHeight: r.s(12), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }} numberOfLines={1}>
            {fixture.awayTeam.name}
          </BRText>
        </Box>
      </Box>

      {/* Percentages separated by vertical lines */}
      <Box flexDirection="row" marginTop="xs">
        <Stat value={`${p.homeWinProbability}%`} label={fixture.homeTeam.name} color={theme.colors.primary} />
        <VDivider />
        <Stat value={`${p.drawProbability}%`} label="Draw" color={theme.colors.textPrimary} />
        <VDivider />
        <Stat value={`${p.awayWinProbability}%`} label={fixture.awayTeam.name} color={theme.colors.textPrimary} />
      </Box>

      {/* Result / confidence / score inside a bordered box (equal thirds + dividers) */}
      <Box
        flexDirection="row"
        marginTop="xs"
        paddingVertical="xs"
        paddingHorizontal="sm"
        borderRadius="sm"
        borderWidth={1}
        borderColor="border"
      >
        <Box flex={1} alignItems="flex-start">
          <BRText style={{ fontSize: r.s(8.5), lineHeight: r.s(10), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>
            AI Predicted Result
          </BRText>
          <Box flexDirection="row" alignItems="center" gap="xxs">
            <BRText style={{ fontSize: r.s(9.5), lineHeight: r.s(12), fontFamily: theme.fonts.medium, color: theme.colors.textPrimary }} numberOfLines={1}>
              {resultLabel(p.predictedResult, fixture.homeTeam.name, fixture.awayTeam.name)}
            </BRText>
            <TrendingUp size={r.s(11)} color={theme.colors.primary} strokeWidth={2.5} />
          </Box>
        </Box>
        <VDivider />
        <Box flex={1} alignItems="flex-start">
          <BRText style={{ fontSize: r.s(8.5), lineHeight: r.s(10), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>
            Confidence
          </BRText>
          <Box flexDirection="row" alignItems="center" gap="xs">
            <BRText style={{ fontSize: r.s(9.5), lineHeight: r.s(12), fontFamily: theme.fonts.medium, color: theme.colors.textPrimary }}>
              {p.confidenceScore}%
            </BRText>
            <ConfidenceGauge score={p.confidenceScore} width={r.s(26)} />
          </Box>
        </Box>
        <VDivider />
        <Box flex={1} alignItems="flex-start">
          <BRText style={{ fontSize: r.s(8.5), lineHeight: r.s(10), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>
            Likely Score
          </BRText>
          <BRText style={{ fontSize: r.s(9.5), lineHeight: r.s(12), fontFamily: theme.fonts.medium, color: theme.colors.textPrimary }}>
            {p.likelyScore}
          </BRText>
        </Box>
      </Box>

      <Pressable onPress={() => router.push(`/match/${fixture.fixtureId}`)} accessibilityRole="button">
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          gap="xs"
          marginTop="xs"
          borderRadius="sm"
          style={{ height: r.s(28), backgroundColor: theme.colors.primary }}
        >
          <BRText style={{ fontSize: r.s(9), lineHeight: r.s(11), color: theme.colors.onPrimary, fontFamily: theme.fonts.bold }}>
            View Prediction
          </BRText>
          <ArrowRight size={r.s(12)} color={theme.colors.onPrimary} strokeWidth={2.5} />
        </Box>
      </Pressable>
    </GlassCard>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  const r = useResponsive();
  const theme = useTheme();
  return (
    <Box alignItems="center" flex={1}>
      <BRText style={{ fontSize: r.s(14), lineHeight: r.s(16), fontFamily: theme.fonts.extrabold, color, fontVariant: ['tabular-nums'] }}>
        {value}
      </BRText>
      <BRText
        style={{ fontSize: r.s(9), lineHeight: r.s(11), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}
        numberOfLines={1}
      >
        {label}
      </BRText>
    </Box>
  );
}

function TrendingCard({ pick }: { pick: TrendingPick }) {
  const theme = useTheme();
  const r = useResponsive();
  const isHot = pick.badge === 'hot';
  const BadgeIcon = isHot ? Flame : Star;

  return (
    <GlassCard accent glow paddingHorizontal="sm" paddingVertical="xs" style={{ flex: 1 }}>
      <Box flexDirection="row" alignItems="center" gap="xxs">
        <BadgeIcon size={r.s(10)} color={theme.colors.warning} fill={theme.colors.warning} strokeWidth={2} />
        <BRText style={{ fontSize: r.s(8), lineHeight: r.s(10), fontFamily: theme.fonts.semibold, color: theme.colors.textPrimary }}>
          {isHot ? 'Hot' : 'Nice Value'}
        </BRText>
      </Box>

      <Box flexDirection="row" alignItems="center" gap="xs" marginTop="xxs">
        {pick.crestName ? (
          <TeamCrest name={pick.crestName} size={r.s(18)} />
        ) : (
          <Box
            width={r.s(18)}
            height={r.s(18)}
            borderRadius="pill"
            alignItems="center"
            justifyContent="center"
            backgroundColor="surfaceAlt"
          >
            <CircleDot size={r.s(11)} color={theme.colors.primary} strokeWidth={2} />
          </Box>
        )}
        <Box flex={1}>
          <BRText style={{ fontSize: r.s(9.5), lineHeight: r.s(12), fontFamily: theme.fonts.semibold, color: theme.colors.textPrimary }} numberOfLines={1}>
            {pick.title}
          </BRText>
          <BRText style={{ fontSize: r.s(8), lineHeight: r.s(10), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }} numberOfLines={1}>
            {pick.market}
          </BRText>
        </Box>
      </Box>

      <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginTop="xs">
        <BRText style={{ fontSize: r.s(12), lineHeight: r.s(14), fontFamily: theme.fonts.bold, color: theme.colors.primary }}>
          {pick.odds.toFixed(2)}
        </BRText>
        <Box flexDirection="row" alignItems="center" gap="xxs">
          <BRText style={{ fontSize: r.s(8), lineHeight: r.s(10), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>
            Conf.
          </BRText>
          <BRText style={{ fontSize: r.s(8.5), lineHeight: r.s(10), fontFamily: theme.fonts.bold, color: theme.colors.primary }}>
            {pick.confidence}%
          </BRText>
        </Box>
      </Box>
      {/* Full-width green confidence bar along the bottom */}
      <Box
        marginTop="xxs"
        borderRadius="pill"
        overflow="hidden"
        style={{ height: r.s(4), backgroundColor: theme.charts.confidenceTrack }}
      >
        <Box style={{ width: `${pick.confidence}%`, height: '100%', backgroundColor: theme.colors.primary }} />
      </Box>
    </GlassCard>
  );
}

function FollowedRow({ fixture, divider, showBell = true }: { fixture: Fixture; divider: boolean; showBell?: boolean }) {
  const theme = useTheme();
  const r = useResponsive();
  const conf = fixture.predictionSummary?.confidenceScore ?? 0;
  const [notify, setNotify] = useState(false);

  return (
    <Box>
      {divider && <Divider inset />}
      {/* Sibling pressables (no nesting): teams + chevron navigate, bell toggles. */}
      <Box flexDirection="row" alignItems="center" paddingHorizontal="md" paddingVertical="xs">
        {/* Left half: crests + team names (opens match) */}
        <Pressable
          onPress={() => router.push(`/match/${fixture.fixtureId}`)}
          accessibilityRole="button"
          accessibilityLabel={`Open ${fixture.homeTeam.name} versus ${fixture.awayTeam.name}`}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
        >
          <Box gap="xxs" marginRight="sm">
            <TeamCrest name={fixture.homeTeam.name} shortName={fixture.homeTeam.shortName} size={r.s(16)} />
            <TeamCrest name={fixture.awayTeam.name} shortName={fixture.awayTeam.shortName} size={r.s(16)} />
          </Box>
          <Box flex={1}>
            <BRText style={{ fontSize: r.s(9.5), lineHeight: r.s(13), fontFamily: theme.fonts.semibold, color: theme.colors.textPrimary }} numberOfLines={1}>
              {fixture.homeTeam.name}
            </BRText>
            <BRText style={{ fontSize: r.s(9.5), lineHeight: r.s(13), fontFamily: theme.fonts.semibold, color: theme.colors.textPrimary }} numberOfLines={1}>
              {fixture.awayTeam.name}
            </BRText>
          </Box>
        </Pressable>

        <VDivider />

        {/* Right half: date/time, bell (toggle), confidence, chevron (open) */}
        <Box flex={1} flexDirection="row" alignItems="center" justifyContent="space-between">
          <Box alignItems="flex-start">
            <BRText style={{ fontSize: r.s(8), lineHeight: r.s(11), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>
              {formatKickoffDay(fixture.kickoffTime)}
            </BRText>
            <BRText style={{ fontSize: r.s(8), lineHeight: r.s(11), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>
              {formatKickoffTime(fixture.kickoffTime)}
            </BRText>
          </Box>
          {showBell && (
            <Pressable
              onPress={() => setNotify((n) => !n)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Toggle match notifications"
            >
              <Bell
                size={r.s(14)}
                color={notify ? theme.colors.primary : theme.colors.textSecondary}
                strokeWidth={2}
                fill={notify ? theme.colors.primary : 'transparent'}
              />
            </Pressable>
          )}
          <Box
            paddingHorizontal="sm"
            paddingVertical="xxs"
            borderRadius="pill"
            borderWidth={1}
            style={{ backgroundColor: theme.colors.primary + '1A', borderColor: theme.colors.primary + '4D' }}
          >
            <BRText style={{ fontSize: r.s(8), lineHeight: r.s(11), fontFamily: theme.fonts.semibold, color: theme.colors.primary }}>
              {conf}%
            </BRText>
          </Box>
          <Pressable
            onPress={() => router.push(`/match/${fixture.fixtureId}`)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Open match"
          >
            <ChevronRight size={r.s(14)} color={theme.colors.textSecondary} />
          </Pressable>
        </Box>
      </Box>
    </Box>
  );
}

const NEWS_ICON: Record<NewsItem['kind'], LucideIcon> = {
  injury: Activity,
  lineup: Users,
  form: TrendingUp,
};

function NewsRow({ item, divider }: { item: NewsItem; divider: boolean }) {
  const theme = useTheme();
  const r = useResponsive();
  const Icon = NEWS_ICON[item.kind];
  // Divider starts after the icon column and stops before the right padding.
  const dividerLeft = theme.spacing.md + r.s(26) + theme.spacing.sm;

  return (
    <Box>
      {divider && <Divider leftInset={dividerLeft} rightInset={theme.spacing.md} />}
      <Box flexDirection="row" alignItems="center" paddingVertical="xs">
        <Box paddingLeft="md" paddingRight="sm">
          <Box
            width={r.s(26)}
            height={r.s(26)}
            borderRadius="sm"
            alignItems="center"
            justifyContent="center"
            backgroundColor="surfaceAlt"
          >
            <Icon size={r.s(13)} color={theme.colors.primary} strokeWidth={2} />
          </Box>
        </Box>
        <Box flex={1} flexDirection="row" alignItems="center" gap="sm" paddingRight="md">
          <Box flex={1}>
            <BRText style={{ fontSize: r.s(9.5), lineHeight: r.s(12), fontFamily: theme.fonts.semibold, color: theme.colors.textPrimary }} numberOfLines={1}>
              {item.title}
            </BRText>
            <BRText style={{ fontSize: r.s(8), lineHeight: r.s(11), fontFamily: theme.fonts.regular, color: theme.colors.textSecondary }} numberOfLines={1}>
              {item.summary}
            </BRText>
          </Box>
          <BRText style={{ fontSize: r.s(8), lineHeight: r.s(11), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>
            {item.timeAgo}
          </BRText>
        </Box>
      </Box>
    </Box>
  );
}
