import { useState } from 'react';
import { Modal, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { GlassCard } from '@/components/primitives/GlassCard';
import { BRText } from '@/components/primitives/BRText';

export interface CalendarProps {
  visible: boolean;
  /** ISO yyyy-mm-dd or null. */
  value: string | null;
  onSelect: (iso: string) => void;
  onClose: () => void;
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function iso(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Lightweight month-grid date picker shown in a modal. Cross-platform, no native deps. */
export function Calendar({ visible, value, onSelect, onClose }: CalendarProps) {
  const theme = useTheme();
  const r = useResponsive();
  const initial = value ? new Date(value) : new Date();
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());

  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Mon-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const shift = (delta: number) => {
    const m = month + delta;
    if (m < 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else if (m > 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth(m);
    }
  };

  const cell = r.s(34);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: theme.colors.overlay, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg }}
      >
        <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: r.s(320) }}>
          <GlassCard opacityHex="F2" padding="md">
            <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="sm">
              <Pressable onPress={() => shift(-1)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Previous month">
                <ChevronLeft size={r.s(18)} color={theme.colors.textPrimary} strokeWidth={2.25} />
              </Pressable>
              <BRText style={{ fontSize: r.s(12), fontFamily: theme.fonts.bold, color: theme.colors.textPrimary }}>
                {MONTHS[month]} {year}
              </BRText>
              <Box flexDirection="row" alignItems="center" gap="md">
                <Pressable onPress={() => shift(1)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Next month">
                  <ChevronRight size={r.s(18)} color={theme.colors.textPrimary} strokeWidth={2.25} />
                </Pressable>
                <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
                  <X size={r.s(16)} color={theme.colors.textSecondary} strokeWidth={2.25} />
                </Pressable>
              </Box>
            </Box>

            <Box flexDirection="row">
              {WEEKDAYS.map((w, i) => (
                <Box key={i} style={{ width: cell }} alignItems="center">
                  <BRText style={{ fontSize: r.s(9), fontFamily: theme.fonts.medium, color: theme.colors.textSecondary }}>{w}</BRText>
                </Box>
              ))}
            </Box>

            <Box flexDirection="row" flexWrap="wrap" marginTop="xs">
              {cells.map((d, i) => {
                const cellIso = d ? iso(year, month, d) : '';
                const selected = d != null && cellIso === value;
                return (
                  <Box key={i} style={{ width: cell, height: cell }} alignItems="center" justifyContent="center">
                    {d != null && (
                      <Pressable
                        onPress={() => onSelect(cellIso)}
                        accessibilityRole="button"
                        accessibilityLabel={cellIso}
                        style={{ width: cell - 4, height: cell - 4, alignItems: 'center', justifyContent: 'center', borderRadius: r.s(8), backgroundColor: selected ? theme.colors.primary : 'transparent' }}
                      >
                        <BRText
                          style={{
                            fontSize: r.s(11),
                            fontFamily: selected ? theme.fonts.bold : theme.fonts.regular,
                            color: selected ? theme.colors.onPrimary : theme.colors.textPrimary,
                          }}
                        >
                          {d}
                        </BRText>
                      </Pressable>
                    )}
                  </Box>
                );
              })}
            </Box>
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
