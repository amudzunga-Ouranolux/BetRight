import { Pressable } from 'react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { BRText } from '@/components/primitives/BRText';

export interface SectionHeaderProps {
  title: string;
  /** Trailing action label (white). Hidden when omitted. */
  actionLabel?: string;
  onAction?: () => void;
  /** Title font size (responsive px). Defaults to the standard section size. */
  size?: number;
  testID?: string;
}

/**
 * Standard list-section header: a compact title with an optional white action link
 * ("See all"). Sits close to its content (small bottom margin). See DESIGN_SYSTEM.md.
 */
export function SectionHeader({ title, actionLabel = 'See all', onAction, size, testID }: SectionHeaderProps) {
  const theme = useTheme();
  const r = useResponsive();
  const titleSize = size ?? r.s(9.5);

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      marginTop="sm"
      marginBottom="xxs"
      testID={testID}
    >
      <BRText style={{ fontSize: titleSize, fontFamily: theme.fonts.semibold, color: theme.colors.textPrimary }}>
        {title}
      </BRText>
      {actionLabel ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`${actionLabel} ${title}`} onPress={onAction}>
          <BRText style={{ fontSize: titleSize * 0.9, fontFamily: theme.fonts.semibold, color: theme.colors.textPrimary }}>
            {actionLabel}
          </BRText>
        </Pressable>
      ) : null}
    </Box>
  );
}
