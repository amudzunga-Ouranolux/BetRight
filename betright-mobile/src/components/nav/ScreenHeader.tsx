import { Box } from '@/core/theme/restyle';
import { BRText } from '@/components/primitives/BRText';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  right?: React.ReactNode;
  testID?: string;
}

/** Standard screen header: optional eyebrow, title, subtitle, and right actions. */
export function ScreenHeader({ title, subtitle, eyebrow, right, testID }: ScreenHeaderProps) {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal="lg"
      paddingVertical="md"
      testID={testID}
    >
      <Box flex={1}>
        {eyebrow && <BRText variant="label">{eyebrow}</BRText>}
        <BRText variant="h2" numberOfLines={1}>
          {title}
        </BRText>
        {subtitle && <BRText variant="bodySmall">{subtitle}</BRText>}
      </Box>
      {right && (
        <Box flexDirection="row" alignItems="center" gap="sm">
          {right}
        </Box>
      )}
    </Box>
  );
}
