import { ImageBackground } from 'expo-image';
import { StyleSheet } from 'react-native';

import { useTheme } from '@/core/theme/restyle';
import { kitAssets } from '@/core/theme/assets';
import { useThemeStore } from '@/core/theme/themeStore';

type Variant = 'app' | 'login' | 'register';

export interface KitBackgroundProps {
  variant?: Variant;
  /** 0–1 scrim opacity over the image for text legibility. */
  scrim?: number;
  children: React.ReactNode;
}

/**
 * Full-bleed kit background image with a theme-coloured scrim. Used by splash and
 * auth screens — the same layout, a different backdrop per kit.
 */
export function KitBackground({ variant = 'app', scrim = 0.55, children }: KitBackgroundProps) {
  const theme = useTheme();
  const kitId = useThemeStore((s) => s.kitId);
  const assets = kitAssets[kitId];
  const source =
    variant === 'login' ? assets.bgLogin : variant === 'register' ? assets.bgRegister : assets.bgApp;

  return (
    <ImageBackground source={source} style={{ flex: 1 }} contentFit="cover">
      <ImageBackground
        source={undefined}
        style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background, opacity: scrim }]}
      />
      {children}
    </ImageBackground>
  );
}
