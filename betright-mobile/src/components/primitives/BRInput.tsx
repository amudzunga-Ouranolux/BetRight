import { forwardRef, useState } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { scale, fontScale } from '@/core/theme/responsive';

import { BRText } from './BRText';
import { BRIconButton } from './BRIconButton';

export interface BRInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  secureToggle?: boolean;
  /** Control height (responsive px). Lets inputs line up exactly with buttons. */
  height?: number;
  testID?: string;
}

/** Themed text field with optional leading icon, label, error, and secure toggle. */
export const BRInput = forwardRef<TextInput, BRInputProps>(function BRInput(
  { label, icon: Icon, error, secureToggle, secureTextEntry, height, testID, ...rest },
  ref,
) {
  const theme = useTheme();
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const controlHeight = height ?? scale(48);

  return (
    <View>
      {label && (
        <BRText variant="caption" marginBottom="xs" style={{ color: theme.colors.textSecondary }}>
          {label}
        </BRText>
      )}
      <Box
        flexDirection="row"
        alignItems="center"
        gap="sm"
        paddingHorizontal="lg"
        borderRadius="sm"
        borderWidth={1}
        backgroundColor="surfaceAlt"
        style={{ borderColor: error ? theme.colors.danger : theme.colors.border, height: controlHeight }}
      >
        {Icon && <Icon size={scale(18)} color={theme.colors.textSecondary} strokeWidth={2} />}
        <TextInput
          ref={ref}
          style={{ flex: 1, color: theme.colors.textPrimary, fontSize: fontScale(15) }}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          testID={testID}
          {...rest}
        />
        {secureToggle && (
          <BRIconButton
            icon={hidden ? Eye : EyeOff}
            tone="ghost"
            size={scale(28)}
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            onPress={() => setHidden((h) => !h)}
          />
        )}
      </Box>
      {error && (
        <BRText variant="caption" marginTop="xs" style={{ color: theme.colors.danger }}>
          {error}
        </BRText>
      )}
    </View>
  );
});
