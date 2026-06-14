import { useState } from 'react';
import { Modal, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  Circle,
  CircleDot,
  Crosshair,
  HelpCircle,
  Home as HomeIcon,
  LineChart,
  Link2,
  Plane,
  RectangleVertical,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { catalogTeams } from '@/core/api/mock/catalog';
import { predictManual } from '@/core/api/hooks';
import {
  buildPredictBreakdown,
  type FormResult,
  type KeyStat,
  type Venue,
} from '@/core/api/mock/predict';
import { Screen } from '@/components/layout/Screen';
import { Divider } from '@/components/layout/Divider';
import { BRText } from '@/components/primitives/BRText';
import { BRButton } from '@/components/primitives/BRButton';
import { GlassCard } from '@/components/primitives/GlassCard';
import { TeamCrest } from '@/components/media/TeamCrest';
import { ProbabilityBar } from '@/components/data-viz/ProbabilityBar';
import { ConfidenceBadge } from '@/components/data-viz/ConfidenceBadge';

const VENUE_OPTIONS: { value: Venue; label: string; icon: LucideIcon }[] = [
  { value: 'home', label: 'Home advantage', icon: HomeIcon },
  { value: 'neutral', label: 'Neutral', icon: Circle },
  { value: 'away', label: 'Away advantage', icon: Plane },
];

/** Leading icon for each key-stat row (keyed by label so the mock stays JSX-free). */
const STAT_ICONS: Record<string, LucideIcon> = {
  Possession: CircleDot,
  'Shots per game': Target,
  'Shots on target': Crosshair,
  'Pass accuracy': Link2,
  'Cards per game': RectangleVertical,
};

/**
 * Manual Predict — pick two teams, review their form / head-to-head / key stats,
 * then generate an AI breakdown. The pre-generation content is a stats preview;
 * "Generate Prediction" produces the probabilistic call below it.
 */
export function PredictScreen() {
  const theme = useTheme();
  const r = useResponsive();

  const [homeId, setHomeId] = useState(catalogTeams[0].id);
  const [awayId, setAwayId] = useState(catalogTeams[1].id);
  const [venue, setVenue] = useState<Venue>('home');
  const [revealed, setRevealed] = useState(false);
  /** Which side's team picker is open (null = closed). */
  const [picking, setPicking] = useState<'home' | 'away' | null>(null);

  const home = catalogTeams.find((t) => t.id === homeId)!;
  const away = catalogTeams.find((t) => t.id === awayId)!;

  // Fetch the breakdown + prediction from the backend (mock fallback offline).
  const { data: manual, isFetching } = useQuery({
    queryKey: ['manual', homeId, awayId, venue],
    queryFn: () => predictManual(homeId, awayId, venue),
  });
  const breakdown = manual?.breakdown ?? buildPredictBreakdown(homeId, awayId, home.name, venue);
  const result = revealed ? (manual?.prediction ?? null) : null;
  const loading = revealed && isFetching;

  const generate = () => setRevealed(true);

  // Predict is a tab root; fall back to Home when there is no back stack.
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  return (
    <Screen edges={['top']}>
      {/* Header: back + "How it works" link */}
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" paddingHorizontal="lg" paddingTop="sm">
        <Pressable onPress={goBack} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back">
          <ChevronLeft size={r.s(20)} color={theme.colors.textPrimary} strokeWidth={2.25} />
        </Pressable>
        <Pressable hitSlop={8} accessibilityRole="button" accessibilityLabel="How it works">
          <Box flexDirection="row" alignItems="center" gap="xxs">
            <HelpCircle size={r.s(13)} color={theme.colors.primary} strokeWidth={2} />
            <BRText style={{ fontSize: r.s(11), fontFamily: theme.fonts.semibold, color: theme.colors.primary }}>
              How it works
            </BRText>
          </Box>
        </Pressable>
      </Box>
      <Box paddingHorizontal="lg" marginTop="xs">
        <BRText variant="h1">Manual Predict</BRText>
        <BRText variant="bodySmall">Pick two teams and generate a breakdown.</BRText>
      </Box>

      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.lg, paddingTop: theme.spacing.md, gap: theme.spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Team selection */}
        <GlassCard padding="md">
          <Box flexDirection="row" alignItems="center">
            <TeamPicker label="Team A" id={homeId} name={home.name} onChange={() => setPicking('home')} />
            <VsBeam />
            <TeamPicker label="Team B" id={awayId} name={away.name} onChange={() => setPicking('away')} />
          </Box>
        </GlassCard>

        {/* Venue / advantage */}
        <GlassCard padding="md">
          <SectionLabel icon={CalendarDays} title="Select venue / advantage" />
          <Box flexDirection="row" gap="xs" padding="xxs" borderRadius="md" borderWidth={1} borderColor="border">
            {VENUE_OPTIONS.map((opt) => {
              const active = opt.value === venue;
              const Icon = opt.icon;
              const fg = active ? theme.colors.onPrimary : theme.colors.textSecondary;
              return (
                <Pressable
                  key={opt.value}
                  style={{ flex: 1 }}
                  onPress={() => setVenue(opt.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="center"
                    gap="xxs"
                    paddingVertical="sm"
                    borderRadius="sm"
                    style={{ backgroundColor: active ? theme.colors.primary : 'transparent' }}
                  >
                    <Icon size={r.s(12)} color={fg} strokeWidth={2.25} />
                    <BRText
                      numberOfLines={1}
                      style={{
                        fontSize: r.s(10),
                        fontFamily: active ? theme.fonts.semibold : theme.fonts.medium,
                        color: fg,
                      }}
                    >
                      {opt.label}
                    </BRText>
                  </Box>
                </Pressable>
              );
            })}
          </Box>
        </GlassCard>

        {/* Team form */}
        <GlassCard padding="md" gap="sm">
          <SectionLabel icon={LineChart} title="Team form (last 5 matches)" />
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box flexDirection="row" gap="xs">
              {breakdown.homeForm.results.map((res, i) => (
                <FormBadge key={i} result={res} />
              ))}
            </Box>
            <Box flexDirection="row" gap="xs">
              {breakdown.awayForm.results.map((res, i) => (
                <FormBadge key={i} result={res} />
              ))}
            </Box>
          </Box>
          <Box flexDirection="row" gap="xs">
            <FormStat value={breakdown.homeForm.goalsScored} label="Goals scored" />
            <FormStat value={breakdown.homeForm.goalsConceded} label="Goals conceded" />
            <FormStat value={breakdown.awayForm.goalsScored} label="Goals scored" />
            <FormStat value={breakdown.awayForm.goalsConceded} label="Goals conceded" />
          </Box>
        </GlassCard>

        {/* Head-to-head — winner crest only, separated by thin dividers */}
        <GlassCard padding="md">
          <SectionLabel icon={Users} title="Head-to-head (last 5)" />
          <Box flexDirection="row" alignItems="center">
            {breakdown.h2h.map((m, i) => {
              const homeWon = m.homeGoals > m.awayGoals;
              const awayWon = m.awayGoals > m.homeGoals;
              const winnerName = awayWon ? away.name : home.name;
              const winnerId = awayWon ? awayId : homeId;
              const color = homeWon
                ? theme.colors.success
                : awayWon
                  ? theme.colors.danger
                  : theme.colors.textSecondary;
              return (
                <Box key={i} flexDirection="row" alignItems="center" flex={1}>
                  {i > 0 && (
                    <Box alignSelf="stretch" marginVertical="xxs" style={{ width: 1, backgroundColor: theme.colors.border }} />
                  )}
                  <Box flex={1} alignItems="center" gap="xxs">
                    <TeamCrest name={winnerName} shortName={winnerId} size={r.s(18)} />
                    <BRText style={{ fontSize: r.s(11), fontFamily: theme.fonts.bold, color }}>
                      {m.homeGoals}-{m.awayGoals}
                    </BRText>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </GlassCard>

        {/* Key stats */}
        <GlassCard padding="md">
          <SectionLabel icon={BarChart3} title="Key stats" />
          {breakdown.keyStats.map((stat, i) => (
            <Box key={stat.label}>
              {i > 0 && <Divider />}
              <KeyStatRow stat={stat} />
            </Box>
          ))}
        </GlassCard>

        {/* Tip */}
        <GlassCard accent padding="md">
          <Box flexDirection="row" gap="sm" alignItems="flex-start">
            <ShieldCheck size={r.s(16)} color={theme.colors.primary} strokeWidth={2} />
            <Box flex={1}>
              <BRText variant="label" style={{ color: theme.colors.primary }}>
                Tip
              </BRText>
              <BRText variant="bodySmall" style={{ color: theme.colors.textPrimary }}>
                {breakdown.tip}
              </BRText>
            </Box>
          </Box>
        </GlassCard>

        {/* Generate */}
        <Box gap="xs">
          <BRButton label="Generate Prediction" icon={Sparkles} onPress={generate} loading={loading} radius="md" fullWidth />
          <BRText variant="caption" style={{ textAlign: 'center' }}>
            100% based on stats and recent form
          </BRText>
        </Box>

        {/* Generated breakdown */}
        {result && (
          <GlassCard glow padding="md">
            <BRText variant="label" marginBottom="sm">
              Generated prediction
            </BRText>
            <ProbabilityBar home={result.homeWinProbability} draw={result.drawProbability} away={result.awayWinProbability} />
            <Box marginTop="sm">
              <ConfidenceBadge score={result.confidenceScore} label={result.confidenceLabel} />
            </Box>
            <BRText variant="bodySmall" marginTop="md">
              {result.summary}
            </BRText>
          </GlassCard>
        )}
      </ScrollView>

      <TeamPickerModal
        visible={picking !== null}
        selectedId={picking === 'home' ? homeId : awayId}
        excludeId={picking === 'home' ? awayId : homeId}
        onClose={() => setPicking(null)}
        onSelect={(id) => {
          if (picking === 'home') setHomeId(id);
          else if (picking === 'away') setAwayId(id);
          setPicking(null);
        }}
      />
    </Screen>
  );
}

/** Bottom-sheet team selector opened from a "Change" link. Excludes the opponent. */
function TeamPickerModal({
  visible,
  selectedId,
  excludeId,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selectedId: string;
  excludeId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();
  const r = useResponsive();
  const teams = catalogTeams.filter((t) => t.id !== excludeId);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: theme.colors.overlay }} onPress={onClose} accessibilityLabel="Close team picker">
        {/* Sheet — stop propagation so taps inside don't close it. */}
        <Pressable
          onPress={() => {}}
          style={{ marginTop: 'auto' }}
        >
          <Box
            backgroundColor="surface"
            borderTopLeftRadius="lg"
            borderTopRightRadius="lg"
            paddingHorizontal="lg"
            paddingTop="md"
            paddingBottom="xl"
            borderWidth={1}
            borderColor="border"
          >
            <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="sm">
              <BRText style={{ fontSize: r.s(13), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>
                Choose team
              </BRText>
              <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
                <X size={r.s(18)} color={theme.colors.textSecondary} strokeWidth={2.25} />
              </Pressable>
            </Box>
            <ScrollView style={{ maxHeight: r.hp(50) }} showsVerticalScrollIndicator={false}>
              {teams.map((t, i) => {
                const active = t.id === selectedId;
                return (
                  <Box key={t.id}>
                    {i > 0 && <Divider />}
                    <Pressable onPress={() => onSelect(t.id)} accessibilityRole="button" accessibilityState={{ selected: active }}>
                      <Box flexDirection="row" alignItems="center" gap="sm" paddingVertical="sm">
                        <TeamCrest name={t.name} shortName={t.id} size={r.s(28)} />
                        <Box flex={1}>
                          <BRText style={{ fontSize: r.s(12), fontFamily: theme.fonts.semibold, color: theme.colors.textPrimary }}>
                            {t.name}
                          </BRText>
                          {t.sublabel && <BRText variant="caption">{t.sublabel}</BRText>}
                        </Box>
                        {active && <Check size={r.s(16)} color={theme.colors.primary} strokeWidth={2.5} />}
                      </Box>
                    </Pressable>
                  </Box>
                );
              })}
            </ScrollView>
          </Box>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** One side of the team-selection card: crest, short code, full name, change link. */
function TeamPicker({ label, id, name, onChange }: { label: string; id: string; name: string; onChange: () => void }) {
  const theme = useTheme();
  const r = useResponsive();
  return (
    <Box flex={1} alignItems="center" gap="xxs">
      <BRText variant="label">{label}</BRText>
      <TeamCrest name={name} shortName={id} size={r.s(48)} />
      <BRText style={{ fontSize: r.s(14), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>
        {id.toUpperCase()}
      </BRText>
      <BRText variant="caption" numberOfLines={1}>
        {name}
      </BRText>
      <Pressable onPress={onChange} hitSlop={6} accessibilityRole="button" accessibilityLabel={`Change ${label}`}>
        <Box flexDirection="row" alignItems="center" gap="xxs">
          <BRText style={{ fontSize: r.s(10), fontFamily: theme.fonts.semibold, color: theme.colors.primary }}>
            Change
          </BRText>
          <ChevronDown size={r.s(11)} color={theme.colors.primary} strokeWidth={2.25} />
        </Box>
      </Pressable>
    </Box>
  );
}

/** Glowing vertical line with a "VS" badge centred over it. */
function VsBeam() {
  const theme = useTheme();
  const r = useResponsive();
  const glow = theme.effects.glowEnabled
    ? { shadowColor: theme.colors.primary, shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 4 }
    : undefined;
  return (
    <Box width={r.s(44)} alignSelf="stretch" alignItems="center" justifyContent="center">
      <Box
        style={[
          { position: 'absolute', top: 0, bottom: 0, width: r.s(2), backgroundColor: theme.colors.primary, borderRadius: theme.borderRadii.pill },
          glow,
        ]}
      />
      <Box
        width={r.s(26)}
        height={r.s(26)}
        borderRadius="pill"
        alignItems="center"
        justifyContent="center"
        backgroundColor="surface"
        borderWidth={1}
        borderColor="primary"
      >
        <BRText style={{ fontSize: r.s(10), fontFamily: theme.fonts.extrabold, color: theme.colors.primary }}>VS</BRText>
      </Box>
    </Box>
  );
}

/** Small section label with a leading accent icon (first child of its card). */
function SectionLabel({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  const theme = useTheme();
  const r = useResponsive();
  return (
    <Box flexDirection="row" alignItems="center" gap="xxs" marginBottom="sm">
      <Icon size={r.s(13)} color={theme.colors.primary} strokeWidth={2} />
      <BRText style={{ fontSize: r.s(11), fontFamily: theme.fonts.semibold, color: theme.colors.textPrimary }}>
        {title}
      </BRText>
    </Box>
  );
}

/**
 * One W/D/L result badge: a tinted box with a matching coloured letter — green
 * for a win, red for a loss, neutral grey for a draw (a soft shade, not a solid
 * fill).
 */
function FormBadge({ result }: { result: FormResult }) {
  const theme = useTheme();
  const r = useResponsive();
  const tone =
    result === 'W' ? theme.colors.success : result === 'L' ? theme.colors.danger : theme.colors.textSecondary;
  const bg = result === 'D' ? theme.colors.surfaceAlt : tone + '26';
  const border = result === 'D' ? theme.colors.border : tone + '4D';
  return (
    <Box
      width={r.s(18)}
      height={r.s(18)}
      borderRadius="xs"
      alignItems="center"
      justifyContent="center"
      style={{ backgroundColor: bg, borderWidth: 1, borderColor: border }}
    >
      <BRText style={{ fontSize: r.s(9.5), fontFamily: theme.fonts.bold, color: tone }}>{result}</BRText>
    </Box>
  );
}

/** One bordered cell of the goals scored/conceded strip (accent number). */
function FormStat({ value, label }: { value: number; label: string }) {
  const theme = useTheme();
  const r = useResponsive();
  return (
    <Box
      flex={1}
      alignItems="center"
      gap="xxs"
      paddingVertical="sm"
      paddingHorizontal="xxs"
      borderRadius="sm"
      borderWidth={1}
      borderColor="border"
    >
      <BRText style={{ fontSize: r.s(13), fontFamily: theme.fonts.extrabold, color: theme.colors.primary }}>
        {value.toFixed(1)}
      </BRText>
      <BRText variant="label" numberOfLines={2} style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
        {label}
      </BRText>
    </Box>
  );
}

/** A key-stat comparison row: home value | icon + label | away value (both accented). */
function KeyStatRow({ stat }: { stat: KeyStat }) {
  const theme = useTheme();
  const r = useResponsive();
  const Icon = STAT_ICONS[stat.label] ?? CircleDot;
  const unit = stat.unit ?? '';
  const fmt = (n: number) => (Number.isInteger(n) ? `${n}` : n.toFixed(1));

  const value = (n: number, align: 'flex-start' | 'flex-end') => (
    <Box width={r.s(52)} alignItems={align}>
      <BRText style={{ fontSize: r.s(13), fontFamily: theme.fonts.bold, color: theme.colors.primary }}>
        {fmt(n)}
        {unit}
      </BRText>
    </Box>
  );

  return (
    <Box flexDirection="row" alignItems="center" paddingVertical="sm">
      {value(stat.home, 'flex-start')}
      <Box flex={1} flexDirection="row" alignItems="center" justifyContent="center" gap="xxs">
        <Icon size={r.s(13)} color={theme.colors.textSecondary} strokeWidth={2} />
        <BRText variant="caption" style={{ textAlign: 'center' }}>
          {stat.label}
        </BRText>
      </Box>
      {value(stat.away, 'flex-end')}
    </Box>
  );
}
