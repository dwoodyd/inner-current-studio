// Single source of truth for which Currents are not yet at content parity.
// Surfaced as "Coming soon" everywhere — hub card, route guard, weekly nudge,
// pricing copy. Remove a domain from this set the moment its full
// affirmation/script/practice depth ships.
import type { DomainKey } from '@/lib/domains';

export const SOON_DOMAINS = new Set<DomainKey>(['self', 'energy', 'relationships', 'health']);

export function isSoonDomain(slug: string | undefined | null): boolean {
  if (!slug) return false;
  return SOON_DOMAINS.has(slug as DomainKey);
}
