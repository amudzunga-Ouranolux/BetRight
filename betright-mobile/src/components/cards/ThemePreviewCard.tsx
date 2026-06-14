import { Pressable } from 'react-native';
import { Check } from 'lucide-react-native';

import { Box } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { kits } from '@/core/theme/kits';
import type { KitId } from '@/models/theme.model';
import { BRText } from '@/components/primitives/BRText';

export interface ThemePreviewCardProps {
  kitId: KitId;
  selected: boolean;
  onSelect: () => void;
  testID?: string;
}

/**
 * Miniature live preview of a kit, rendered with that kit's own tokens (not the
 * active one) so the chooser shows each option true to itself.
 */
export function ThemePreviewCard({ kitId, selected, onSelect, testID }: ThemePreviewCardProps) {
  const t = kits[kitId];
  const c = t.colors;
  const r = useResponsive();
  const dot = r.s(16);
  const bar = r.s(8);
  const cta = r.s(20);
  const tick = r.s(20);

  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={t.meta.name}
      style={{ flex: 1 }}
      testID={testID}
    >
      <Box
        borderRadius="lg"
        borderWidth={2}
        overflow="hidden"
        style={{ backgroundColor: c.background, borderColor: selected ? c.primary : c.border }}
      >
        <Box padding="md" gap="sm">
          {/* mini hero */}
          <Box borderRadius="md" padding="sm" style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
            <Box flexDirection="row" gap="xs" marginBottom="sm">
              <Box width={dot} height={dot} borderRadius="round" style={{ backgroundColor: c.surfaceAlt }} />
              <Box flex={1} height={dot} borderRadius="sm" style={{ backgroundColor: c.surfaceAlt }} />
              <Box width={dot} height={dot} borderRadius="round" style={{ backgroundColor: c.surfaceAlt }} />
            </Box>
            <Box flexDirection="row" height={bar} borderRadius="pill" overflow="hidden">
              <Box style={{ flex: 6, backgroundColor: c.outcomeHome }} />
              <Box style={{ flex: 2, backgroundColor: c.outcomeDraw }} />
              <Box style={{ flex: 2, backgroundColor: c.outcomeAway }} />
            </Box>
          </Box>
          {/* mini cta */}
          <Box height={cta} borderRadius="pill" style={{ backgroundColor: c.primary }} />
        </Box>

        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="md"
          paddingVertical="sm"
          style={{ backgroundColor: c.surface, borderTopWidth: 1, borderColor: c.border }}
        >
          <BRText variant="caption" style={{ color: c.textPrimary, fontWeight: '700' }}>
            {t.meta.name}
          </BRText>
          {selected && (
            <Box
              width={tick}
              height={tick}
              borderRadius="pill"
              alignItems="center"
              justifyContent="center"
              style={{ backgroundColor: c.primary }}
            >
              <Check size={tick * 0.65} color={c.onPrimary} strokeWidth={3} />
            </Box>
          )}
        </Box>
      </Box>
    </Pressable>
  );
}
