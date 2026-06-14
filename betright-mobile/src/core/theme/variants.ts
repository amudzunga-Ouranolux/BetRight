import type { ComponentType } from 'react';

import type { KitId } from '@/models/theme.model';

import { useThemeStore } from './themeStore';

/**
 * Kit-variant registry.
 *
 * Most components render correctly in all three kits from theme tokens alone.
 * A few genuinely diverge in layout or interaction (per the brand designs):
 * those register one implementation per kit under a named slot, all sharing one
 * props contract, and screens resolve them with `useKitVariant(slot)` without
 * ever branching on the active kit.
 */
export type KitVariantMap<P> = Record<KitId, ComponentType<P>>;

const registry = new Map<string, KitVariantMap<unknown>>();

export function registerKitVariant<P>(slot: string, map: KitVariantMap<P>): void {
  registry.set(slot, map as KitVariantMap<unknown>);
}

/** Resolve the active kit's implementation for a registered slot. */
export function useKitVariant<P>(slot: string): ComponentType<P> {
  const kitId = useThemeStore((s) => s.kitId);
  const map = registry.get(slot);
  if (!map) {
    throw new Error(
      `useKitVariant: no variant registered for slot "${slot}". ` +
        'Register it with registerKitVariant() before use.',
    );
  }
  return map[kitId] as ComponentType<P>;
}

/** Non-hook resolver for use outside React (rare). */
export function resolveKitVariant<P>(slot: string, kitId: KitId): ComponentType<P> {
  const map = registry.get(slot);
  if (!map) throw new Error(`resolveKitVariant: unknown slot "${slot}"`);
  return map[kitId] as ComponentType<P>;
}
