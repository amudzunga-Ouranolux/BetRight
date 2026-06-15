import { Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, ChevronLeft, CircleCheck, Newspaper, Sparkles, type LucideIcon } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { markNotificationRead, useNotifications, type NotificationItem } from '@/core/api/hooks';
import { Screen } from '@/components/layout/Screen';
import { BRText } from '@/components/primitives/BRText';
import { GlassCard } from '@/components/primitives/GlassCard';
import { Divider } from '@/components/layout/Divider';
import { SkeletonLoader } from '@/components/feedback/SkeletonLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';

const ICON: Record<string, LucideIcon> = {
  prediction: Sparkles,
  result: CircleCheck,
  news: Newspaper,
  alert: Bell,
};

/** Notifications centre: predictions ready, results graded, news. */
export function NotificationsScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useNotifications();

  const open = async (n: NotificationItem) => {
    if (!n.read) {
      await markNotificationRead(n.id);
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread'] });
    }
    if (n.fixtureId) router.push(`/match/${n.fixtureId}`);
  };

  return (
    <Screen edges={['top']}>
      <Box flexDirection="row" alignItems="center" gap="sm" paddingHorizontal="lg" paddingVertical="sm">
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back">
          <ChevronLeft size={r.s(20)} color={theme.colors.textPrimary} strokeWidth={2.25} />
        </Pressable>
        <BRText style={{ fontSize: r.s(13), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>Notifications</BRText>
      </Box>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading || !data ? (
        <Box paddingHorizontal="lg" gap="sm">
          <SkeletonLoader height={r.s(64)} radius={r.s(12)} />
          <SkeletonLoader height={r.s(64)} radius={r.s(12)} />
        </Box>
      ) : data.length === 0 ? (
        <EmptyState title="No notifications" message="Alerts about your predictions and teams will appear here." />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg }} showsVerticalScrollIndicator={false}>
          <GlassCard overflow="hidden">
            {data.map((n, i) => (
              <Row key={n.id} item={n} divider={i > 0} onPress={() => open(n)} />
            ))}
          </GlassCard>
        </ScrollView>
      )}
    </Screen>
  );
}

function Row({ item, divider, onPress }: { item: NotificationItem; divider: boolean; onPress?: () => void }) {
  const theme = useTheme();
  const r = useResponsive();
  const Icon = ICON[item.kind] ?? Bell;
  const dividerLeft = theme.spacing.md + r.s(26) + theme.spacing.sm;
  return (
    <Box>
      {divider && <Divider leftInset={dividerLeft} rightInset={theme.spacing.md} />}
      <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined}>
        <Box flexDirection="row" alignItems="center" paddingVertical="sm">
          <Box paddingLeft="md" paddingRight="sm">
            <Box width={r.s(26)} height={r.s(26)} borderRadius="sm" alignItems="center" justifyContent="center" style={{ backgroundColor: item.read ? theme.colors.surfaceAlt : theme.colors.primary + '26' }}>
              <Icon size={r.s(13)} color={item.read ? theme.colors.textSecondary : theme.colors.primary} strokeWidth={2} />
            </Box>
          </Box>
          <Box flex={1} paddingRight="md">
            <BRText style={{ fontSize: r.s(9.5), lineHeight: r.s(12), fontFamily: theme.fonts.semibold, color: theme.colors.textPrimary }} numberOfLines={1}>{item.title}</BRText>
            <BRText style={{ fontSize: r.s(8), lineHeight: r.s(11), fontFamily: theme.fonts.regular, color: theme.colors.textSecondary }} numberOfLines={2}>{item.body}</BRText>
          </Box>
        </Box>
      </Pressable>
    </Box>
  );
}
