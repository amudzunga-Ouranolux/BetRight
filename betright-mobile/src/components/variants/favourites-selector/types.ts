/** Shared contract every favourites-selector variant honours. */
export interface FavouritesSelection {
  leagues: string[];
  competitions: string[];
  teams: string[];
}

export interface FavouritesSelectorProps {
  value: FavouritesSelection;
  onChange: (next: FavouritesSelection) => void;
}

export const FAVOURITES_SELECTOR_SLOT = 'favouritesSelector';

export function toggleId(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}
