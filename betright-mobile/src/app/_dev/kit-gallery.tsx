import { ScrollView } from 'react-native';
import { Bell, Search, Star, TrendingUp } from 'lucide-react-native';

import { Box } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { useThemeStore } from '@/core/theme/themeStore';
import { KIT_IDS } from '@/models/theme.model';
import { Screen } from '@/components/layout/Screen';
import { BRText } from '@/components/primitives/BRText';
import { BRButton } from '@/components/primitives/BRButton';
import { BRIconButton } from '@/components/primitives/BRIconButton';
import { BRCard } from '@/components/primitives/BRCard';
import { BRChip } from '@/components/primitives/BRChip';
import { BRBadge } from '@/components/primitives/BRBadge';
import { BRInput } from '@/components/primitives/BRInput';
import { SkeletonLoader } from '@/components/feedback/SkeletonLoader';
import { EmptyState } from '@/components/feedback/EmptyState';

function GallerySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box gap="md" marginBottom="xl">
      <BRText variant="label">{title}</BRText>
      {children}
    </Box>
  );
}

/** Dev-only: every primitive rendered in the active kit. Switch kits at the top. */
export default function KitGallery() {
  const kitId = useThemeStore((s) => s.kitId);
  const setKit = useThemeStore((s) => s.setKit);
  const r = useResponsive();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <BRText variant="h1" marginBottom="md">
          Kit Gallery
        </BRText>

        <GallerySection title="Active kit">
          <Box flexDirection="row" gap="sm" flexWrap="wrap">
            {KIT_IDS.map((id) => (
              <BRChip key={id} label={id} selected={id === kitId} onPress={() => setKit(id)} />
            ))}
          </Box>
        </GallerySection>

        <GallerySection title="Buttons">
          <Box gap="sm">
            <BRButton label="Primary" variant="primary" icon={TrendingUp} fullWidth />
            <BRButton label="Secondary" variant="secondary" fullWidth />
            <BRButton label="Ghost" variant="ghost" />
            <BRButton label="Loading" variant="primary" loading fullWidth />
          </Box>
        </GallerySection>

        <GallerySection title="Icon buttons">
          <Box flexDirection="row" gap="sm">
            <BRIconButton icon={Search} tone="surface" accessibilityLabel="Search" />
            <BRIconButton icon={Bell} tone="primary" accessibilityLabel="Notifications" />
            <BRIconButton icon={Star} tone="ghost" accessibilityLabel="Favourite" />
          </Box>
        </GallerySection>

        <GallerySection title="Cards">
          <BRCard glow marginBottom="sm">
            <BRText variant="title">Default card (glow)</BRText>
            <BRText variant="bodySmall">Carbon on Home/Third, glass on Away.</BRText>
          </BRCard>
          <BRCard variant="flat">
            <BRText variant="title">Flat card</BRText>
          </BRCard>
        </GallerySection>

        <GallerySection title="Chips & badges">
          <Box flexDirection="row" gap="sm" flexWrap="wrap">
            <BRChip label="Today" selected />
            <BRChip label="High Confidence" />
            <BRChip label="Over 2.5" />
          </Box>
          <Box flexDirection="row" gap="sm" flexWrap="wrap" marginTop="sm">
            <BRBadge label="LIVE" tone="danger" />
            <BRBadge label="HIGH" tone="success" />
            <BRBadge label="UPSET WATCH" tone="warning" />
            <BRBadge label="VALUE" tone="primary" />
          </Box>
        </GallerySection>

        <GallerySection title="Input">
          <Box gap="sm">
            <BRInput label="Email" placeholder="adriano@example.com" icon={Search} />
            <BRInput label="Password" placeholder="Password" secureToggle secureTextEntry />
          </Box>
        </GallerySection>

        <GallerySection title="Skeletons">
          <Box gap="sm">
            <SkeletonLoader height={r.s(20)} width="60%" />
            <SkeletonLoader height={r.s(56)} />
          </Box>
        </GallerySection>

        <GallerySection title="Empty state">
          <BRCard>
            <Box height={r.s(220)}>
              <EmptyState title="No saved predictions" message="Predictions you save will appear here." />
            </Box>
          </BRCard>
        </GallerySection>
      </ScrollView>
    </Screen>
  );
}
