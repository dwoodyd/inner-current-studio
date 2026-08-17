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

/** House default — warm gold, the Inner Wake ground. */
export const HOUSE_FIELD: FieldHue = { h: 42, s: 54 };

export const FIELD_HUES: Record<DomainKey, FieldHue> = {
  money: { h: 42, s: 62 },
  self: { h: 282, s: 40 },
  energy: { h: 24, s: 72 },
  relationships: { h: 342, s: 52 },
  health: { h: 164, s: 42 },
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
