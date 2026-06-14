import { useState } from 'react';
import { Pressable } from 'react-native';
import { Star } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { AWAY_ACCENT } from '@/core/theme/palette';
import type { Fixture } from '@/models/fixture.model';
import { formatKickoffLabel } from '@/core/utils/datetime';
import { BRText } from '@/components/primitives/BRText';
import { BRCard } from '@/components/primitives/BRCard';
import { TeamCrest } from '@/components/media/TeamCrest';
import { ProbabilityBar } from '@/components/data-viz/ProbabilityBar';

export interface FixtureCardProps {
  fixture: Fixture;
  onPress?: () => void;
  /** Optional market line shown when a non-default market filter is active. */
  metric?: { label: string; value: number } | null;
  testID?: string;
}

/** Rich fixture card for the Matches explorer: meta, teams, AI prediction + confidence,
 *  and 1X2 probabilities with a segmented bar. */
export function FixtureCard({ fixture, onPress, metric, testID }: FixtureCardProps) {
  const theme = useTheme();
  const r = useResponsive();
  const { homeTeam, awayTeam, predictionSummary: p, liveState, status } = fixture;
  const [fav, setFav] = useState(false);
  if (!p) return null;

  const winner =
    p.predictedResult === 'home_win' ? `${homeTeam.name} win` : p.predictedResult === 'away_win' ? `${awayTeam.name} win` : 'Draw';

  const teamName = (name: string, align: 'left' | 'right') =>
    ({ fontSize: r.s(11), lineHeight: r.s(14), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary, textAlign: align }) as const;

  return (
    <BRCard padding="md" marginBottom="sm" overflow="hidden" testID={testID}>
      {/* Meta: league tag (left) · kickoff + favourite (right) */}
      <Box flexDirection="row" alignItems="center" justifyContent="space-between">
        <Pressable onPress={onPress} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Box width={r.s(9)} height={r.s(9)} borderRadius="xs" marginRight="xs" style={{ backgroundColor: theme.colors.primary }} />
          <BRText style={{ fontSize: r.s(8), fontFamily: theme.fonts.semibold, letterSpacing: 0.4, color: theme.colors.textSecondary }} numberOfLines={1}>
            {fixture.competitionName.toUpperCase()}
          </BRText>
        </Pressable>
        <Box flexDirection="row" alignItems="center" gap="sm">
          <BRText style={{ fontSize: r.s(8), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>
            {formatKickoffLabel(fixture.kickoffTime)}
          </BRText>
          <Pressable onPress={() => setFav((f) => !f)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Favourite">
            <Star size={r.s(14)} color={fav ? theme.colors.primary : theme.colors.textSecondary} strokeWidth={2} fill={fav ? theme.colors.primary : 'transparent'} />
          </Pressable>
        </Box>
      </Box>

      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${homeTeam.name} versus ${awayTeam.name}`}>
        {/* Teams */}
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginTop="sm">
          <Box flex={1} flexDirection="row" alignItems="center" gap="sm">
            <TeamCrest name={homeTeam.name} shortName={homeTeam.shortName} size={r.s(26)} />
            <BRText style={teamName(homeTeam.name, 'left')} numberOfLines={1}>
              {homeTeam.name}
            </BRText>
          </Box>
          <BRText style={{ fontSize: r.s(13), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary, marginHorizontal: theme.spacing.sm, fontVariant: ['tabular-nums'] }}>
            {status === 'live' && liveState ? `${liveState.homeScore} - ${liveState.awayScore}` : 'vs'}
          </BRText>
          <Box flex={1} flexDirection="row" alignItems="center" justifyContent="flex-end" gap="sm">
            <BRText style={teamName(awayTeam.name, 'right')} numberOfLines={1}>
              {awayTeam.name}
            </BRText>
            <TeamCrest name={awayTeam.name} shortName={awayTeam.shortName} size={r.s(26)} />
          </Box>
        </Box>

        <Box marginVertical="sm" style={{ height: 1, backgroundColor: theme.colors.border }} />

        {/* AI prediction + confidence */}
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <BRText style={{ fontSize: r.s(8), fontFamily: theme.fonts.semibold, letterSpacing: 0.4, color: theme.colors.textSecondary }}>
            AI PREDICTION
          </BRText>
          <Box flexDirection="row" alignItems="center" gap="sm">
            <BRText style={{ fontSize: r.s(10), fontFamily: theme.fonts.bold, color: theme.colors.primary }} numberOfLines={1}>
              {winner}
            </BRText>
            <Box alignItems="center" paddingHorizontal="sm" paddingVertical="xxs" borderRadius="sm" borderWidth={1} style={{ borderColor: theme.colors.primary + '4D', backgroundColor: theme.colors.primary + '14' }}>
              <BRText style={{ fontSize: r.s(10), lineHeight: r.s(11), fontFamily: theme.fonts.bold, color: theme.colors.primary }}>{p.confidenceScore}%</BRText>
              <BRText style={{ fontSize: r.s(6.5), lineHeight: r.s(8), fontFamily: theme.fonts.semibold, letterSpacing: 0.3, color: theme.colors.textSecondary }}>AI CONFIDENCE</BRText>
            </Box>
          </Box>
        </Box>

        {/* Probabilities */}
        <Box flexDirection="row" marginTop="sm">
          <ProbCol label="HOME WIN" value={p.homeWinProbability} color={theme.colors.primary} align="flex-start" />
          <ProbCol label="DRAW" value={p.drawProbability} color={theme.colors.textPrimary} align="center" />
          <ProbCol label="AWAY WIN" value={p.awayWinProbability} color={AWAY_ACCENT} align="flex-end" />
        </Box>
        <Box marginTop="xs">
          <ProbabilityBar home={p.homeWinProbability} draw={p.drawProbability} away={p.awayWinProbability} showLabels={false} height={r.s(4)} />
        </Box>

        {metric && (
          <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginTop="xs">
            <BRText style={{ fontSize: r.s(8), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>{metric.label}</BRText>
            <BRText style={{ fontSize: r.s(9), fontFamily: theme.fonts.bold, color: theme.colors.primary }}>{metric.value}%</BRText>
          </Box>
        )}
      </Pressable>
    </BRCard>
  );
}

function ProbCol({ label, value, color, align }: { label: string; value: number; color: string; align: 'flex-start' | 'center' | 'flex-end' }) {
  const theme = useTheme();
  const r = useResponsive();
  return (
    <Box flex={1} alignItems={align}>
      <BRText style={{ fontSize: r.s(7.5), fontFamily: theme.fonts.semibold, letterSpacing: 0.3, color: theme.colors.textSecondary }}>{label}</BRText>
      <BRText style={{ fontSize: r.s(12), fontFamily: theme.fonts.extrabold, color, fontVariant: ['tabular-nums'] }}>{value}%</BRText>
    </Box>
  );
}
