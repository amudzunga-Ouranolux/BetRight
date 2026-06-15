import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Lock, User } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { login, register } from '@/core/api/auth';
import { useResponsive } from '@/core/theme/responsive';
import { useKitVariant } from '@/core/theme/variants';
import { kitAssets } from '@/core/theme/assets';
import { useThemeStore } from '@/core/theme/themeStore';
import { Screen } from '@/components/layout/Screen';
import { KitBackground } from '@/components/media/KitBackground';
import { BRText } from '@/components/primitives/BRText';
import { BRButton } from '@/components/primitives/BRButton';
import { BRInput } from '@/components/primitives/BRInput';
import {
  AUTH_SOCIAL_SLOT,
  type AuthSocialButtonsProps,
} from '@/components/variants/auth-social';

export type AuthMode = 'login' | 'register';

/**
 * Shared auth layout for Login and Register. One layout across all kits — only the
 * background image, colours, and social-button variant change. Laid out with flex
 * (no scroll) so it always fits the viewport.
 */
export function AuthScreen({ mode }: { mode: AuthMode }) {
  const isLogin = mode === 'login';
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const r = useResponsive();
  const padX = r.ms(24);
  const kitId = useThemeStore((s) => s.kitId);
  // Logo spans the full content width (capped on wide screens).
  const logoWidth = Math.min(r.width - padX * 2, r.s(300));
  const logoHeight = logoWidth / kitAssets[kitId].logoAR;
  // Single shared control height so inputs and all buttons are exactly equal.
  const controlHeight = r.s(44);
  const SocialButtons = useKitVariant<AuthSocialButtonsProps>(AUTH_SOCIAL_SLOT);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await login(email, password);
        router.replace('/(tabs)/home');
      } else {
        await register(email, password, name);
        router.replace('/onboarding/age' as never);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edges={[]}>
      <KitBackground variant={isLogin ? 'login' : 'register'} scrim={0.72}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flex: 1,
              paddingHorizontal: padX,
              paddingTop: insets.top + r.ms(12),
              paddingBottom: Math.max(insets.bottom, r.ms(16)) + r.ms(4),
              justifyContent: 'space-between',
            }}
          >
            {/* Brand + heading */}
            <Box alignItems="flex-start" gap="md">
              <Image source={kitAssets[kitId].logoFull} style={{ width: logoWidth, height: logoHeight }} contentFit="contain" />
              <Box>
                <BRText variant="h2" style={{ fontWeight: '600' }}>
                  {isLogin ? 'Welcome back' : 'Create account'}
                </BRText>
                <BRText variant="bodySmall" marginTop="xxs">
                  {isLogin ? 'Sign in to continue to BetRight.' : 'Join BetRight and predict smart.'}
                </BRText>
              </Box>
            </Box>

            {/* Form */}
            <Box gap="md" marginTop="xl">
              {!isLogin && (
                <BRInput placeholder="Full name" icon={User} autoCapitalize="words" value={name} onChangeText={setName} height={controlHeight} />
              )}
              <BRInput
                placeholder="Email address"
                icon={Mail}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                height={controlHeight}
              />
              <BRInput
                placeholder="Password"
                icon={Lock}
                secureToggle
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                height={controlHeight}
              />
              {isLogin && (
                <BRText variant="caption" textAlign="right" style={{ fontWeight: '700' }} onPress={() => {}}>
                  Forgot Password?
                </BRText>
              )}
              {error && (
                <BRText variant="caption" style={{ color: theme.colors.danger }}>
                  {error}
                </BRText>
              )}
              <BRButton
                label={isLogin ? 'Log In' : 'Create Account'}
                radius="sm"
                height={controlHeight}
                onPress={submit}
                loading={loading}
                fullWidth
              />

              {/* Divider sits one `md` gap below Log In, and the social buttons sit one
                  `md` gap below the divider — so both spaces are equal. */}
              <Box flexDirection="row" alignItems="center" gap="md">
                <Box flex={1} height={1} backgroundColor="border" />
                <BRText variant="label">or continue with</BRText>
                <Box flex={1} height={1} backgroundColor="border" />
              </Box>

              <SocialButtons height={controlHeight} />
            </Box>

            {/* Footer pinned to the bottom */}
            <Box flexDirection="row" justifyContent="center" gap="xs">
              <BRText variant="bodySmall">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </BRText>
              <BRText
                variant="bodySmall"
                style={{ fontWeight: '700' }}
                onPress={() => router.replace(isLogin ? '/auth/register' : '/auth/login')}
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </BRText>
            </Box>
          </View>
        </KeyboardAvoidingView>
      </KitBackground>
    </Screen>
  );
}
