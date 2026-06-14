import { ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import {
  Palette,
  Bell,
  Bookmark,
  SlidersHorizontal,
  Shield,
  CircleHelp,
  CreditCard,
  ChevronRight,
  LogOut,
  type LucideIcon,
} from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { logout } from '@/core/api/auth';
import { storage } from '@/core/storage/mmkv';
import { Screen } from '@/components/layout/Screen';
import { BRText } from '@/components/primitives/BRText';
import { BRCard } from '@/components/primitives/BRCard';
import { BRButton } from '@/components/primitives/BRButton';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { TeamCrest } from '@/components/media/TeamCrest';

interface Row {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  href?: string;
}

const ROWS: Row[] = [
  { icon: Bookmark, label: 'Saved Predictions', sublabel: 'Your saved picks', href: '/saved' },
  { icon: Palette, label: 'Theme', sublabel: 'Choose your kit', href: '/settings/theme' },
  { icon: Bell, label: 'Notifications', sublabel: 'Alerts and reminders', href: '/notifications' },
  { icon: SlidersHorizontal, label: 'Prediction Preferences' },
  { icon: CreditCard, label: 'Subscription', sublabel: 'Free plan' },
  { icon: Shield, label: 'Privacy & Responsible Use' },
  { icon: CircleHelp, label: 'Help' },
];

export function ProfileScreen() {
  const theme = useTheme();
  const r = useResponsive();

  const signOut = async () => {
    await logout();
    storage.delete('betright.onboarded');
    router.replace('/auth/login');
  };

  return (
    <Screen edges={['top']}>
      <ScreenHeader title="Profile" />
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        <BRCard variant="flat" marginBottom="lg">
          <Box flexDirection="row" alignItems="center" gap="md">
            <TeamCrest name="Adriano Silva" shortName="AS" size={r.s(56)} />
            <Box flex={1}>
              <BRText variant="title">Adriano Silva</BRText>
              <BRText variant="caption">adriano@example.com</BRText>
            </Box>
          </Box>
        </BRCard>

        <BRCard variant="flat" padding="none">
          {ROWS.map((row, i) => {
            const Icon = row.icon;
            return (
              <Pressable
                key={row.label}
                onPress={() => row.href && router.push(row.href as never)}
                accessibilityRole="button"
                accessibilityLabel={row.label}
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  gap="md"
                  padding="lg"
                  borderTopWidth={i === 0 ? 0 : 1}
                  borderColor="border"
                >
                  <Icon size={r.s(20)} color={theme.colors.primary} strokeWidth={2} />
                  <Box flex={1}>
                    <BRText variant="body" style={{ fontFamily: theme.fonts.semibold }}>
                      {row.label}
                    </BRText>
                    {row.sublabel && <BRText variant="caption">{row.sublabel}</BRText>}
                  </Box>
                  <ChevronRight size={r.s(18)} color={theme.colors.textSecondary} />
                </Box>
              </Pressable>
            );
          })}
        </BRCard>

        <Box marginTop="lg">
          <BRButton
            label="Sign out"
            variant="secondary"
            icon={LogOut}
            radius="sm"
            height={r.s(44)}
            onPress={signOut}
            fullWidth
          />
        </Box>
      </ScrollView>
    </Screen>
  );
}
