import { registerKitVariant } from '@/core/theme/variants';

import { StackedFavSelector } from './StackedFavSelector';
import { TabbedFavSelector } from './TabbedFavSelector';
import { FAVOURITES_SELECTOR_SLOT, type FavouritesSelectorProps } from './types';

/**
 * Register favourites-selector variants. Home/Third stack leagues + teams as
 * checklists; Away uses segmented tabs over popular lists — a real layout/
 * interaction difference, not just a colour swap.
 */
registerKitVariant<FavouritesSelectorProps>(FAVOURITES_SELECTOR_SLOT, {
  'home-kit': StackedFavSelector,
  'third-kit': StackedFavSelector,
  'away-kit': TabbedFavSelector,
});

export { FAVOURITES_SELECTOR_SLOT };
export type { FavouritesSelectorProps, FavouritesSelection } from './types';
