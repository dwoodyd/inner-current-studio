/**
 * The Field — the whole screen takes its color from whatever current you are tending.
 *
 * Each current owns a hue. We push it onto <html> as CSS custom properties so
 * every surface (wash, cards, glows) can drink from the same source. The app
 * literally looks different depending on what you are feeling.
 */
import { useEffect } from 'react';
import type { DomainKey } from '@/lib/domains';

export interface FieldHue {
  /** hue angle */
  h: number;
  /** saturation percentage */
  s: number;
}

/**
 * House default — no current in hand. Barely tinted: the ground is neutral
 * near-black (#07070A) and the currents own every hue.
 */
export const HOUSE_FIELD: FieldHue = { h: 38, s: 46 };

/** The five currents, straight from the palette: gold is just one of five. */
export const FIELD_HUES: Record<DomainKey, FieldHue> = {
  money: { h: 38, s: 61 },          // #D4A24C
  self: { h: 141, s: 38 },          // #6FBF8B
  energy: { h: 25, s: 71 },         // #E08A4B
  relationships: { h: 355, s: 56 }, // #D97A82
  health: { h: 178, s: 37 },        // #5FB6B3
};

export function fieldFor(key?: DomainKey | null): FieldHue {
  return key ? FIELD_HUES[key] ?? HOUSE_FIELD : HOUSE_FIELD;
}

export function applyField(key?: DomainKey | null) {
  if (typeof document === 'undefined') return;
  const { h, s } = fieldFor(key);
  const root = document.documentElement;
  root.style.setProperty('--field-h', String(h));
  root.style.setProperty('--field-s', `${s}%`);
}

/**
 * Tint the whole app for the lifetime of a screen, then release it back to the
 * house hue on unmount.
 */
export function useFieldTint(key?: DomainKey | null) {
  useEffect(() => {
    applyField(key);
    return () => applyField(null);
  }, [key]);
}
