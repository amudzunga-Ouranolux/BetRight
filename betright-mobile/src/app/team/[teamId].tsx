import { useLocalSearchParams } from 'expo-router';

import { TeamProfileScreen } from '@/features/team/TeamProfileScreen';

export default function TeamRoute() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  return <TeamProfileScreen teamId={teamId} />;
}
