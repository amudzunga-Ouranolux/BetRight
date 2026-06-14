import { useLocalSearchParams } from 'expo-router';

import { MatchDetailScreen } from '@/features/match-detail/MatchDetailScreen';

export default function MatchDetailRoute() {
  const { fixtureId } = useLocalSearchParams<{ fixtureId: string }>();
  return <MatchDetailScreen fixtureId={fixtureId} />;
}
