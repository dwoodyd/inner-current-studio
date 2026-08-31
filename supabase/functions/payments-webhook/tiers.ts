// Pure mapping helpers for the payments webhook. Kept in their own module so
// they can be unit tested without booting the Deno.serve handler.

export type CoarseTier = 'premium' | 'lifetime' | 'free';

/**
 * Map a canonical external_id (e.g. "iw_pro_monthly_founding") to the coarse
 * tier stored on profiles.
 */
export function priceIdToTier(priceId: string | undefined | null): CoarseTier {
  if (!priceId) return 'free';
  if (
    priceId.includes('lifetime') ||
    priceId === 'premium_lifetime' ||
    priceId === 'premium_lifetime_149'
  ) {
    return 'lifetime';
  }
  if (priceId.includes('monthly') || priceId.includes('annual') || priceId.includes('yearly')) {
    return 'premium';
  }
  return 'free';
}

/** Extract the human-readable external_id set when the price/product was created. */
export function externalIdFrom(meta: any): string | null {
  const ext = meta?.importMeta?.externalId ?? meta?.import_meta?.external_id;
  return typeof ext === 'string' && ext.length > 0 ? ext : null;
}

/** The Founding Member badge is only granted by this exact lifetime price. */
export const FOUNDING_LIFETIME_PRICE_ID = 'iw_pro_lifetime_founding';

/**
 * Does a subscription in this state still grant premium access?
 * past_due keeps access while Paddle dunning retries; canceled keeps access
 * until the paid-through date.
 */
export function subscriptionGrantsAccess(
  status: string | null | undefined,
  currentPeriodEnd: string | null | undefined,
  now: Date = new Date(),
): boolean {
  const periodStillOpen = !currentPeriodEnd || new Date(currentPeriodEnd) > now;
  if (!status) return false;
  if (['active', 'trialing', 'past_due'].includes(status)) return true;
  return status === 'canceled' && periodStillOpen;
}
