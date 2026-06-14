import { TriangleAlert } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { BRText } from '@/components/primitives/BRText';
import { BRButton } from '@/components/primitives/BRButton';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  testID?: string;
}

/** Standard error placeholder with a retry affordance. */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this right now. Please try again.',
  onRetry,
  testID,
}: ErrorStateProps) {
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
        style={{ backgroundColor: theme.colors.danger + '22' }}
      >
        <TriangleAlert size={r.s(28)} color={theme.colors.danger} strokeWidth={1.75} />
      </Box>
      <BRText variant="title" textAlign="center">
        {title}
      </BRText>
      <BRText variant="bodySmall" textAlign="center" style={{ maxWidth: r.s(280) }}>
        {message}
      </BRText>
      {onRetry && (
        <Box marginTop="sm">
          <BRButton label="Try again" variant="secondary" size="sm" onPress={onRetry} />
        </Box>
      )}
    </Box>
  );
}
