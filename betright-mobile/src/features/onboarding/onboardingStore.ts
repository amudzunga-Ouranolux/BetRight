import { create } from 'zustand';

import type { FavouritesSelection } from '@/components/variants/favourites-selector';

interface OnboardingState {
  sports: string[];
  favourites: FavouritesSelection;
  interests: string[];
  notifications: string[];
  toggleSport: (code: string) => void;
  setFavourites: (next: FavouritesSelection) => void;
  toggleInterest: (id: string) => void;
  toggleNotification: (id: string) => void;
}

const toggle = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

/** Holds onboarding selections in memory; persisted to preferences on completion. */
export const useOnboardingStore = create<OnboardingState>((set) => ({
  sports: ['football'],
  favourites: { leagues: [], competitions: [], teams: [] },
  interests: [],
  notifications: [],
  toggleSport: (code) => set((s) => ({ sports: toggle(s.sports, code) })),
  setFavourites: (next) => set({ favourites: next }),
  toggleInterest: (id) => set((s) => ({ interests: toggle(s.interests, id) })),
  toggleNotification: (id) => set((s) => ({ notifications: toggle(s.notifications, id) })),
}));
