import type { ImageSourcePropType } from 'react-native';

import type { KitId } from '@/models/theme.model';

/**
 * Per-kit brand + background assets. The active theme's `logoVariant` keys into
 * this map so the logo and backgrounds "change shirt" with the UI when the kit
 * switches. Each kit has its own colourway logo (transparent) plus app/login/
 * register backgrounds sliced from `brand/`.
 */
export interface KitAssets {
  logoFull: ImageSourcePropType;
  /** Aspect ratio (width / height) of `logoFull`, for responsive sizing. */
  logoAR: number;
  bgApp: ImageSourcePropType;
  bgLogin: ImageSourcePropType;
  bgRegister: ImageSourcePropType;
}

export const kitAssets: Record<KitId, KitAssets> = {
  'home-kit': {
    logoFull: require('@/assets/images/home/logo-app.png'),
    logoAR: 2.74,
    bgApp: require('@/assets/images/home/bg-app.png'),
    bgLogin: require('@/assets/images/home/bg-login.png'),
    bgRegister: require('@/assets/images/home/bg-register.png'),
  },
  'away-kit': {
    logoFull: require('@/assets/images/away/logo-app.png'),
    logoAR: 2.84,
    bgApp: require('@/assets/images/away/bg-app.png'),
    bgLogin: require('@/assets/images/away/bg-login.png'),
    bgRegister: require('@/assets/images/away/bg-register.png'),
  },
  'third-kit': {
    logoFull: require('@/assets/images/third/logo-app.png'),
    logoAR: 3.51,
    bgApp: require('@/assets/images/third/bg-app.png'),
    bgLogin: require('@/assets/images/third/bg-login.png'),
    bgRegister: require('@/assets/images/third/bg-register.png'),
  },
};
