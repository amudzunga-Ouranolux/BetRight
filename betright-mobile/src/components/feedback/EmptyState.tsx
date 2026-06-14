import type { LucideIcon } from 'lucide-react-native';
import { Inbox } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { BRText } from '@/components/primitives/BRText';
import { BRButton } from '@/components/primitives/BRButton';

export interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

/** Friendly empty placeholder. Every list/collection screen renders one when empty. */
export function EmptyState({
  title,
  message,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  testID,
}: EmptyStateProps) {
  const theme = useTheme();
  const r = useResponsive();
  const circle = r.s(64);
  return (
    <Box flex={1} alignItems="center" justifyContent="center" padding="xl" gap="md" testID={testID}>
      <Box
        width={circle}
        height={circle}
        borderRadius="pill"
        alignItems="center"
        justifyContent="center"
        backgroundColor="surfaceAlt"
      >
        <Icon size={r.s(28)} color={theme.colors.textSecondary} strokeWidth={1.75} />
      </Box>
      <BRText variant="title" textAlign="center">
        {title}
      </BRText>
      {message && (
        <BRText variant="bodySmall" textAlign="center" style={{ maxWidth: r.s(280) }}>
          {message}
        </BRText>
      )}
      {actionLabel && onAction && (
        <Box marginTop="sm">
          <BRButton label={actionLabel} variant="secondary" size="sm" onPress={onAction} />
        </Box>
      )}
    </Box>
  );
}
