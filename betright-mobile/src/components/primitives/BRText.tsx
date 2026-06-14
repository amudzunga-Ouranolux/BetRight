import { Text, useTheme, type TextProps, type TextVariant } from '@/core/theme/restyle';
import { usePrefsStore } from '@/core/prefs/prefsStore';

export interface BRTextProps extends TextProps {
  variant?: TextVariant;
}

/**
 * Themed text primitive. Always use this instead of RN <Text> so typography and
 * colour come from the active kit. `variant` selects a step in the type scale,
 * and the user's chosen text-size multiplier is applied on top.
 */
export function BRText({ variant = 'body', style, ...rest }: BRTextProps) {
  const theme = useTheme();
  const textScale = usePrefsStore((s) => s.textScale);

  const v = theme.textVariants[variant] as { fontSize?: number; lineHeight?: number } | undefined;
  const scaledStyle =
    textScale !== 1 && v?.fontSize
      ? { fontSize: v.fontSize * textScale, lineHeight: (v.lineHeight ?? v.fontSize) * textScale }
      : undefined;

  return <Text variant={variant} style={[scaledStyle, style]} {...rest} />;
}
