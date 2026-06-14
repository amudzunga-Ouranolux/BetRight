import { useState } from 'react';
import { ScrollView } from 'react-native';

import { Box } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { mockMatchPrediction } from '@/core/api/mock/fixtures';
import { catalogTeams } from '@/core/api/mock/catalog';
import type { MatchPrediction } from '@/models/prediction.model';
import { Screen } from '@/components/layout/Screen';
import { BRText } from '@/components/primitives/BRText';
import { BRButton } from '@/components/primitives/BRButton';
import { BRCard } from '@/components/primitives/BRCard';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { SegmentedTabs } from '@/components/inputs/SegmentedTabs';
import { TeamCrest } from '@/components/media/TeamCrest';
import { ProbabilityBar } from '@/components/data-viz/ProbabilityBar';
import { ConfidenceBadge } from '@/components/data-viz/ConfidenceBadge';

/** Manual prediction: pick two teams, generate a fresh breakdown. */
export function PredictScreen() {
  const [homeId, setHomeId] = useState(catalogTeams[0].id);
  const [awayId, setAwayId] = useState(catalogTeams[1].id);
  const [venue, setVenue] = useState<'home' | 'neutral'>('home');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchPrediction | null>(null);

  const home = catalogTeams.find((t) => t.id === homeId)!;
  const away = catalogTeams.find((t) => t.id === awayId)!;

  const generate = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(mockMatchPrediction('fx_1'));
      setLoading(false);
    }, 700);
  };

  return (
    <Screen edges={['top']}>
      <ScreenHeader eyebrow="Your call" title="Manual Predict" subtitle="Pick any two teams and generate a breakdown." />
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        <BRCard marginBottom="md">
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <TeamPicker label="Team A" team={home} onCycle={() => setHomeId(nextId(homeId, awayId))} />
            <BRText variant="title">vs</BRText>
            <TeamPicker label="Team B" team={away} onCycle={() => setAwayId(nextId(awayId, homeId))} />
          </Box>
          <Box marginTop="lg">
            <BRText variant="label" marginBottom="sm">
              Venue
            </BRText>
            <SegmentedTabs
              options={[
                { value: 'home', label: 'Home advantage' },
                { value: 'neutral', label: 'Neutral' },
              ]}
              value={venue}
              onChange={setVenue}
            />
          </Box>
          <Box marginTop="lg">
            <BRButton label="Generate Prediction" onPress={generate} loading={loading} fullWidth />
          </Box>
        </BRCard>

        {result && (
          <BRCard glow>
            <BRText variant="label" marginBottom="sm">
              Generated Prediction
            </BRText>
            <ProbabilityBar
              home={result.homeWinProbability}
              draw={result.drawProbability}
              away={result.awayWinProbability}
            />
            <Box marginTop="sm">
              <ConfidenceBadge score={result.confidenceScore} label={result.confidenceLabel} />
            </Box>
            <BRText variant="bodySmall" marginTop="md">
              {result.summary}
            </BRText>
          </BRCard>
        )}
      </ScrollView>
    </Screen>
  );
}

function nextId(current: string, exclude: string): string {
  const ids = catalogTeams.map((t) => t.id);
  let i = (ids.indexOf(current) + 1) % ids.length;
  if (ids[i] === exclude) i = (i + 1) % ids.length;
  return ids[i];
}

function TeamPicker({ label, team, onCycle }: { label: string; team: { name: string }; onCycle: () => void }) {
  const r = useResponsive();
  return (
    <Box flex={1} alignItems="center" gap="xs">
      <BRText variant="label">{label}</BRText>
      <TeamCrest name={team.name} size={r.s(56)} />
      <BRText variant="caption" numberOfLines={1}>
        {team.name}
      </BRText>
      <BRButton label="Change" variant="ghost" size="sm" onPress={onCycle} />
    </Box>
  );
}
