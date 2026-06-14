import { Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Trash2 } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { useSavedPredictions, unsavePrediction, type SavedPrediction } from '@/core/api/hooks';
import { Screen } from '@/components/layout/Screen';
import { BRText } from '@/components/primitives/BRText';
import { GlassCard } from '@/components/primitives/GlassCard';
import { SkeletonLoader } from '@/components/feedback/SkeletonLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ProbabilityBar } from '@/components/data-viz/ProbabilityBar';

/** The user's saved predictions (My Picks). */
export function SavedPredictionsScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useSavedPredictions();

  const remove = async (id: string) => {
    await unsavePrediction(id);
    qc.invalidateQueries({ queryKey: ['saved-predictions'] });
    qc.invalidateQueries({ queryKey: ['favourites-hub'] });
  };

  return (
    <Screen edges={['top']}>
      <Box flexDirection="row" alignItems="center" gap="sm" paddingHorizontal="lg" paddingVertical="sm">
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back">
          <ChevronLeft size={r.s(20)} color={theme.colors.textPrimary} strokeWidth={2.25} />
        </Pressable>
        <BRText style={{ fontSize: r.s(13), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>Saved Predictions</BRText>
      </Box>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading || !data ? (
        <Box paddingHorizontal="lg" gap="sm">
          <SkeletonLoader height={r.s(96)} radius={r.s(12)} />
          <SkeletonLoader height={r.s(96)} radius={r.s(12)} />
        </Box>
      ) : data.length === 0 ? (
        <EmptyState title="No saved predictions" message="Save a prediction from a match to find it here." />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg }} showsVerticalScrollIndicator={false}>
          {data.map((s) => (
            <Box key={s.id} marginBottom="sm">
              <SavedRow saved={s} onOpen={() => router.push(`/match/${s.fixtureId}`)} onRemove={() => remove(s.id)} />
            </Box>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

function SavedRow({ saved, onOpen, onRemove }: { saved: SavedPrediction; onOpen: () => void; onRemove: () => void }) {
  const theme = useTheme();
  const r = useResponsive();
  const p = saved.prediction;
  return (
    <GlassCard padding="md">
      <Box flexDirection="row" alignItems="flex-start" justifyContent="space-between">
        <Pressable onPress={onOpen} accessibilityRole="button" style={{ flex: 1 }}>
          <BRText style={{ fontSize: r.s(11), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }} numberOfLines={1}>{p.headline}</BRText>
          <BRText variant="caption" numberOfLines={2}>{p.summary}</BRText>
        </Pressable>
        <Pressable onPress={onRemove} hitSlop={8} accessibilityRole="button" accessibilityLabel="Remove saved prediction">
          <Trash2 size={r.s(15)} color={theme.colors.textSecondary} strokeWidth={2} />
        </Pressable>
      </Box>
      <Box marginTop="sm">
        <ProbabilityBar home={p.homeWinProbability} draw={p.drawProbability} away={p.awayWinProbability} />
      </Box>
      <Box flexDirection="row" justifyContent="space-between" marginTop="xs">
        <BRText variant="label">Confidence {Math.round(p.confidenceScore)}%</BRText>
        <BRText variant="label">Saved {new Date(saved.savedAt).toLocaleDateString()}</BRText>
      </Box>
    </GlassCard>
  );
}
