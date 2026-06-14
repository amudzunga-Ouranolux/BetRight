import { registerKitVariant } from '@/core/theme/variants';

import { StackedSocial } from './StackedSocial';
import { IconSocial } from './IconSocial';
import { AUTH_SOCIAL_SLOT, type AuthSocialButtonsProps } from './types';

/**
 * Register social-login button variants. Home/Away stack full-width labelled
 * buttons; Third uses a circular icon row — matching the auth mocks.
 */
registerKitVariant<AuthSocialButtonsProps>(AUTH_SOCIAL_SLOT, {
  'home-kit': StackedSocial,
  'away-kit': StackedSocial,
  'third-kit': IconSocial,
});

export { AUTH_SOCIAL_SLOT };
export type { AuthSocialButtonsProps };
