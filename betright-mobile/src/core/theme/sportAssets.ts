import type { ImageSourcePropType } from 'react-native';

/** Photoreal sport icons used by the onboarding sports grid (Home/Lime kit assets). */
export const sportIcons: Record<string, ImageSourcePropType> = {
  football: require('@/assets/images/sports/football.png'),
  basketball: require('@/assets/images/sports/basketball.png'),
  tennis: require('@/assets/images/sports/tennis.png'),
  rugby: require('@/assets/images/sports/rugby.png'),
  cricket: require('@/assets/images/sports/cricket.png'),
  esports: require('@/assets/images/sports/esports.png'),
};

/** Lime stadium onboarding background (1290x2796). */
export const onboardingStadiumBg: ImageSourcePropType = require('@/assets/images/onboarding/stadium-lime.png');
