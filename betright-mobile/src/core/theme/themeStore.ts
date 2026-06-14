import { create } from 'zustand';

import { storage } from '@/core/storage/mmkv';
import { DEFAULT_KIT_ID, KIT_IDS, type KitId } from '@/models/theme.model';

const KIT_STORAGE_KEY = 'betright.kitId';

function readPersistedKit(): KitId {
  const stored = storage.getString(KIT_STORAGE_KEY);
  if (stored && (KIT_IDS as string[]).includes(stored)) {
    return stored as KitId;
  }
  return DEFAULT_KIT_ID;
}

interface ThemeStoreState {
  kitId: KitId;
  /** Set on first selection during onboarding; lets us know to show the chooser. */
  kitChosen: boolean;
  setKit: (kitId: KitId) => void;
}

/**
 * Zustand store for the active kit. Hydrated synchronously from MMKV at module
 * load (before first paint) so there is no theme flash on cold start.
 */
export const useThemeStore = create<ThemeStoreState>((set) => ({
  kitId: readPersistedKit(),
  kitChosen: storage.getString(KIT_STORAGE_KEY) != null,
  setKit: (kitId) => {
    storage.set(KIT_STORAGE_KEY, kitId);
    set({ kitId, kitChosen: true });
  },
}));
