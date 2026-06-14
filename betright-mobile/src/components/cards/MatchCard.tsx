import { Pressable } from 'react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import type { Fixture } from '@/models/fixture.model';
import { formatKickoffLabel } from '@/core/utils/datetime';
import { BRText } from '@/components/primitives/BRText';
import { BRBadge } from '@/components/primitives/BRBadge';
import { BRCard } from '@/components/primitives/BRCard';
import { TeamCrest } from '@/components/media/TeamCrest';
import { ProbabilityBar } from '@/components/data-viz/ProbabilityBar';

export interface MatchCardProps {
  fixture: Fixture;
  onPress?: () => void;
  testID?: string;
}

/** Compact fixture row: crests, kickoff/league, live state, and a mini 1X2 strip.
 *  Used in lightweight lists (Home, Top Picks). The Matches explorer uses the
 *  richer FixtureCard instead. */
export function MatchCard({ fixture, onPress, testID }: MatchCardProps) {
  const theme = useTheme();
  const r = useResponsive();
  const { homeTeam, awayTeam, predictionSummary: p, liveState, status } = fixture;

  const nameStyle = {
    fontSize: r.s(9.5),
    lineHeight: r.s(13),
    fontFamily: theme.fonts.semibold,
    color: theme.colors.textPrimary,
    flexShrink: 1,
  } as const;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" testID={testID}>
      <BRCard variant="flat" marginBottom="xs" paddingVertical="sm" paddingHorizontal="md">
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xs">
          <BRText style={{ fontSize: r.s(8), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }} numberOfLines={1}>
            {fixture.competitionName}
          </BRText>
          {status === 'live' && liveState ? (
            <BRBadge label={`LIVE ${liveState.minute ?? ''}'`} tone="danger" />
          ) : (
            <BRText style={{ fontSize: r.s(8), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>
              {formatKickoffLabel(fixture.kickoffTime)}
            </BRText>
          )}
        </Box>

        <Box flexDirection="row" alignItems="center" gap="sm">
          <Box flex={1} flexDirection="row" alignItems="center" gap="sm">
            <TeamCrest name={homeTeam.name} shortName={homeTeam.shortName} size={r.s(24)} />
            <BRText style={nameStyle} numberOfLines={1}>
              {homeTeam.name}
            </BRText>
          </Box>

          {status === 'live' && liveState ? (
            <BRText variant="numberMd">
              {liveState.homeScore} - {liveState.awayScore}
            </BRText>
          ) : (
            <BRText style={{ fontSize: r.s(8), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>vs</BRText>
          )}

          <Box flex={1} flexDirection="row" alignItems="center" justifyContent="flex-end" gap="sm">
            <BRText style={[nameStyle, { textAlign: 'right' }]} numberOfLines={1}>
              {awayTeam.name}
            </BRText>
            <TeamCrest name={awayTeam.name} shortName={awayTeam.shortName} size={r.s(24)} />
          </Box>
        </Box>

        {p && (
          <Box marginTop="xs">
            <ProbabilityBar
              home={p.homeWinProbability}
              draw={p.drawProbability}
              away={p.awayWinProbability}
              showLabels={false}
              height={r.s(5)}
            />
            <Box flexDirection="row" justifyContent="space-between" marginTop="xxs">
              <BRText style={{ fontSize: r.s(8), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>
                Likely {p.likelyScore}
              </BRText>
              <BRText style={{ fontSize: r.s(8.5), fontFamily: theme.fonts.bold, color: theme.colors.primary }}>
                {p.confidenceScore}%
              </BRText>
            </Box>
          </Box>
        )}
      </BRCard>
    </Pressable>
  );
}
