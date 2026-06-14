/** Shared contract for the social-login button variants. */
export interface AuthSocialButtonsProps {
  onGoogle?: () => void;
  onApple?: () => void;
  /** Control height (responsive px) so social buttons match inputs/primary button. */
  height?: number;
}

export const AUTH_SOCIAL_SLOT = 'authSocialButtons';

export interface SocialProvider {
  key: 'google' | 'apple';
  label: string;
  /** Single-letter monogram used in place of brand glyphs (none in Lucide). */
  monogram: string;
}

export const PROVIDERS: SocialProvider[] = [
  { key: 'google', label: 'Continue with Google', monogram: 'G' },
  { key: 'apple', label: 'Continue with Apple', monogram: 'A' },
];
