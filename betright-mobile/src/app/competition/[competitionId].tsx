import { useLocalSearchParams } from 'expo-router';

import { CompetitionProfileScreen } from '@/features/competition/CompetitionProfileScreen';

export default function CompetitionRoute() {
  const { competitionId } = useLocalSearchParams<{ competitionId: string }>();
  return <CompetitionProfileScreen competitionId={competitionId} />;
}
