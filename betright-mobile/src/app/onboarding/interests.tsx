import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import {
  Trophy,
  Target,
  TrendingUp,
  Activity,
  User,
  Zap,
  ShieldCheck,
  Tag,
} from 'lucide-react-native';

import { useOnboardingStore } from '@/features/onboarding/onboardingStore';
import { OnboardingShell } from '@/features/onboarding/OnboardingShell';
import { OptionTable, type OptionItem } from '@/components/inputs/OptionTable';

const INTERESTS: OptionItem[] = [
  { id: 'winner', title: 'Match winner', description: 'Who comes out on top', icon: Trophy },
  { id: 'exact_score', title: 'Exact score', description: 'Predicted scorelines', icon: Target },
  { id: 'over_under', title: 'Over / Under goals', description: 'Total goals markets', icon: TrendingUp },
  { id: 'btts', title: 'Both teams to score', description: 'BTTS likelihood', icon: Activity },
  { id: 'player', title: 'Player predictions', description: 'Goals and impact', icon: User },
  { id: 'upsets', title: 'Upset watch', description: 'Underdog opportunities', icon: Zap },
  { id: 'high_confidence', title: 'High-confidence picks', description: 'Model is most sure', icon: ShieldCheck },
  { id: 'value', title: 'Value picks', description: 'Best perceived edge', icon: Tag },
];

export default function PredictionInterests() {
  const interests = useOnboardingStore((s) => s.interests);
  const toggleInterest = useOnboardingStore((s) => s.toggleInterest);

  return (
    <OnboardingShell
      step={3}
      total={6}
      title="Prediction Interests"
      subtitle="Tell us what you care about so we surface the right insights."
      onNext={() => router.push('/onboarding/notifications')}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <OptionTable items={INTERESTS} selected={interests} onToggle={toggleInterest} />
      </ScrollView>
    </OnboardingShell>
  );
}
