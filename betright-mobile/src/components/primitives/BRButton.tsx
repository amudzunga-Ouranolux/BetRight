import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { LucideIcon } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { motion, opacity } from '@/core/theme/tokens';

import { BRText } from './BRText';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface BRButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  /** Corner radius token. Defaults to a full pill; use 'md'/'lg' for rounded rectangles. */
  radius?: 'sm' | 'md' | 'lg' | 'xl' | 'pill';
  /** Fixed control height (responsive px). When set, replaces vertical padding so
   * the button can line up exactly with inputs of the same height. */
  height?: number;
  testID?: string;
}

const SIZE_PADDING: Record<Size, { v: keyof ReturnType<typeof useTheme>['spacing']; h: keyof ReturnType<typeof useTheme>['spacing'] }> = {
  sm: { v: 'sm', h: 'lg' },
  md: { v: 'md', h: 'xl' },
  lg: { v: 'lg', h: 'xl' },
};

/** Primary action button. Solid (primary), outlined (secondary), or text-only (ghost). */
export function BRButton({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  radius = 'pill',
  height,
  disabled,
  testID,
  ...rest
}: BRButtonProps) {
  const theme = useTheme();
  const r = useResponsive();
  const iconSize = r.s(18);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const isDisabled = disabled || loading;

  const bg =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'secondary'
        ? theme.colors.surfaceAlt
        : 'transparent';
  const fg =
    variant === 'primary'
      ? theme.colors.onPrimary
      : variant === 'ghost'
        ? theme.colors.primary
        : theme.colors.textPrimary;
  const pad = SIZE_PADDING[size];

  const glow =
    variant === 'primary' && theme.effects.glowEnabled
      ? {
          shadowColor: theme.colors.primary,
          shadowOpacity: 0.5,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
        }
      : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: motion.fast });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: motion.fast });
      }}
      testID={testID}
      {...rest}
    >
      <Animated.View style={[animatedStyle, { opacity: isDisabled ? opacity.disabled : 1 }]}>
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          gap="sm"
          height={height}
          paddingVertical={height ? undefined : pad.v}
          paddingHorizontal={pad.h}
          borderRadius={radius}
          style={[
            { backgroundColor: bg },
            variant === 'secondary' && { borderWidth: 1, borderColor: theme.colors.border },
            fullWidth && { alignSelf: 'stretch' },
            glow,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={fg} />
          ) : (
            <>
              {Icon && iconPosition === 'left' && <Icon size={iconSize} color={fg} strokeWidth={2.25} />}
              <BRText variant="button" style={{ color: fg }}>
                {label}
              </BRText>
              {Icon && iconPosition === 'right' && <Icon size={iconSize} color={fg} strokeWidth={2.25} />}
            </>
          )}
        </Box>
      </Animated.View>
    </Pressable>
  );
}
