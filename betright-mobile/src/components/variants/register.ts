/**
 * Central import that runs every kit-variant registration as a side effect.
 * Imported once at app start (in app/_layout.tsx) so all slots are available
 * before any screen calls useKitVariant().
 */
import './favourites-selector';
import './auth-social';
