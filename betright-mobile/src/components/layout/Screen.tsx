import { ImageBackground } from 'expo-image';
import { StyleSheet } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Box, useTheme } from '@/core/theme/restyle';
import { kitAssets } from '@/core/theme/assets';
import { useThemeStore } from '@/core/theme/themeStore';

export interface ScreenProps {
  children: React.ReactNode;
  /** Which safe-area edges to inset. Defaults to top + bottom. */
  edges?: Edge[];
  /** Override the screen background colour token. */
  backgroundColor?: keyof ReturnType<typeof useTheme>['colors'];
  /** Hide the kit background image (solid colour only). */
  plain?: boolean;
  /** Scrim opacity over the kit background (0 = full image, 1 = solid colour). */
  scrim?: number;
  testID?: string;
}

/**
 * Root container for every screen: paints the active kit's background image behind
 * a colour scrim (so the backdrop changes with the kit), applies safe-area insets,
 * and a kit-correct status-bar style. Pass `plain` for a solid background.
 */
export function Screen({
  children,
  edges = ['top', 'bottom'],
  backgroundColor = 'background',
  plain = false,
  scrim = 0.62,
  testID,
}: ScreenProps) {
  const theme = useTheme();
  const kitId = useThemeStore((s) => s.kitId);

  return (
    <Box flex={1} backgroundColor={backgroundColor} testID={testID}>
      <StatusBar style={theme.meta.mode === 'dark' ? 'light' : 'dark'} />
      {!plain && (
        <ImageBackground source={kitAssets[kitId].bgApp} style={StyleSheet.absoluteFill} contentFit="cover">
          {/* Colour scrim keeps content legible while letting the kit texture show through. */}
          <Box style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background, opacity: scrim }]} />
        </ImageBackground>
      )}
      <SafeAreaView style={{ flex: 1 }} edges={edges}>
        {children}
      </SafeAreaView>
    </Box>
  );
}
