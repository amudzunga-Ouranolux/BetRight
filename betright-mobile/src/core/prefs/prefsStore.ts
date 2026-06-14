import { create } from 'zustand';

import { storage } from '@/core/storage/mmkv';

const TEXT_SCALE_KEY = 'betright.textScale';

export type TextSizeMode = 'small' | 'default' | 'large';

export const TEXT_SCALE: Record<TextSizeMode, number> = {
  small: 0.9,
  default: 1,
  large: 1.15,
};

function readScale(): number {
  const stored = storage.getString(TEXT_SCALE_KEY);
  const n = stored ? parseFloat(stored) : 1;
  return Number.isFinite(n) ? n : 1;
}

interface PrefsState {
  /** User-chosen text-size multiplier applied on top of responsive scaling. */
  textScale: number;
  setTextScale: (scale: number) => void;
}

/** App preferences (text size, etc.) persisted to MMKV. */
export const usePrefsStore = create<PrefsState>((set) => ({
  textScale: readScale(),
  setTextScale: (scale) => {
    storage.set(TEXT_SCALE_KEY, String(scale));
    set({ textScale: scale });
  },
}));
