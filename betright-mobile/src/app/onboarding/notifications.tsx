import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Star, Users, RefreshCw, Clock, CalendarDays } from 'lucide-react-native';

import { useOnboardingStore } from '@/features/onboarding/onboardingStore';
import { OnboardingShell } from '@/features/onboarding/OnboardingShell';
import { OptionTable, type OptionItem } from '@/components/inputs/OptionTable';

const NOTIFS: OptionItem[] = [
  { id: 'fav_predictions', title: 'Favourite team alerts', description: 'News, results & important updates', icon: Star },
  { id: 'lineups', title: 'Lineup confirmed', description: 'When lineups are announced', icon: Users },
  { id: 'changes', title: 'Prediction changed', description: 'When a prediction shifts', icon: RefreshCw },
  { id: 'match_start', title: 'Match starting soon', description: 'Get reminded before kick-off', icon: Clock },
  { id: 'recap', title: 'Weekly recap', description: 'How the model performed', icon: CalendarDays },
];

export default function NotificationPreferences() {
  const notifications = useOnboardingStore((s) => s.notifications);
  const toggleNotification = useOnboardingStore((s) => s.toggleNotification);

  return (
    <OnboardingShell
      step={3}
      total={5}
      title="Notifications"
      subtitle="Choose what you want to be alerted about. Adjust anytime in settings."
      onNext={() => router.push('/onboarding/choose-kit')}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <OptionTable items={NOTIFS} selected={notifications} onToggle={toggleNotification} control="toggle" />
      </ScrollView>
    </OnboardingShell>
  );
}
