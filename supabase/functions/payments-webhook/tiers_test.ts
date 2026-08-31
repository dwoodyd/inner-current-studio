import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import {
  FOUNDING_LIFETIME_PRICE_ID,
  externalIdFrom,
  priceIdToTier,
  subscriptionGrantsAccess,
} from './tiers.ts';

Deno.test('priceIdToTier maps lifetime prices', () => {
  assertEquals(priceIdToTier('iw_pro_lifetime_founding'), 'lifetime');
  assertEquals(priceIdToTier('premium_lifetime'), 'lifetime');
  assertEquals(priceIdToTier('premium_lifetime_149'), 'lifetime');
});

Deno.test('priceIdToTier maps recurring prices to premium', () => {
  assertEquals(priceIdToTier('iw_pro_monthly'), 'premium');
  assertEquals(priceIdToTier('iw_pro_monthly_founding'), 'premium');
  assertEquals(priceIdToTier('iw_pro_annual'), 'premium');
  assertEquals(priceIdToTier('iw_pro_yearly'), 'premium');
});

Deno.test('priceIdToTier falls back to free for unknown or missing ids', () => {
  assertEquals(priceIdToTier(null), 'free');
  assertEquals(priceIdToTier(undefined), 'free');
  assertEquals(priceIdToTier(''), 'free');
  assertEquals(priceIdToTier('pri_01hxyz'), 'free');
});

Deno.test('externalIdFrom reads camelCase and snake_case shapes', () => {
  assertEquals(externalIdFrom({ importMeta: { externalId: 'iw_pro_monthly' } }), 'iw_pro_monthly');
  assertEquals(externalIdFrom({ import_meta: { external_id: 'iw_pro_annual' } }), 'iw_pro_annual');
});

Deno.test('externalIdFrom returns null when the id is absent — never a raw pri_ id', () => {
  assertEquals(externalIdFrom({ id: 'pri_01hxyz' }), null);
  assertEquals(externalIdFrom({ importMeta: { externalId: '' } }), null);
  assertEquals(externalIdFrom(undefined), null);
});

Deno.test('only the founding lifetime price grants the Founding Member badge', () => {
  assertEquals(FOUNDING_LIFETIME_PRICE_ID, 'iw_pro_lifetime_founding');
  assertEquals(priceIdToTier(FOUNDING_LIFETIME_PRICE_ID), 'lifetime');
  assertEquals('iw_pro_lifetime' === FOUNDING_LIFETIME_PRICE_ID, false);
});

Deno.test('subscriptionGrantsAccess keeps access through dunning and paid-through cancels', () => {
  const now = new Date('2026-01-10T00:00:00Z');
  const future = '2026-02-01T00:00:00Z';
  const past = '2026-01-01T00:00:00Z';

  assertEquals(subscriptionGrantsAccess('active', future, now), true);
  assertEquals(subscriptionGrantsAccess('trialing', future, now), true);
  assertEquals(subscriptionGrantsAccess('past_due', future, now), true);
  assertEquals(subscriptionGrantsAccess('canceled', future, now), true);
  assertEquals(subscriptionGrantsAccess('canceled', past, now), false);
  assertEquals(subscriptionGrantsAccess(null, future, now), false);
  // Lifetime rows have no period end.
  assertEquals(subscriptionGrantsAccess('active', null, now), true);
});
