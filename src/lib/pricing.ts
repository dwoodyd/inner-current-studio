// Canonical price IDs for Inner Wake's three-tier pricing.
// These match the Paddle external_ids created in the catalog.

export const FOUNDING_PRICES = {
  monthly: 'iw_pro_monthly_founding',
  annual: 'iw_pro_annual_founding',
  lifetime: 'iw_pro_lifetime_founding',
} as const;

// Phase 4 — created when 100 founding slots fill.
export const RETAIL_PRICES = {
  monthly: 'iw_pro_monthly_retail',
  annual: 'iw_pro_annual_retail',
} as const;

export const PRICE_DISPLAY = {
  iw_pro_monthly_founding: { amount: '$4.99', period: '/mo', label: 'Founding Rate', retail: '$7.99/mo retail' },
  iw_pro_annual_founding: { amount: '$39', period: '/yr', label: 'Founding Rate', retail: '$59/yr retail · ≈ $3.25/mo' },
  iw_pro_lifetime_founding: { amount: '$99', period: ' one-time', label: 'Founder-only', retail: 'Retiring with the founding member program' },
} as const;

// Map a price_id (stored on profiles/subscriptions) to a logical tier.
export function priceIdToTier(priceId: string | null | undefined):
  'free' | 'pro_monthly' | 'pro_annual' | 'lifetime' {
  if (!priceId) return 'free';
  if (priceId.includes('lifetime')) return 'lifetime';
  if (priceId.includes('annual')) return 'pro_annual';
  if (priceId.includes('monthly')) return 'pro_monthly';
  // Legacy single-tier IDs
  if (priceId === 'premium_lifetime' || priceId === 'premium_lifetime_149') return 'lifetime';
  return 'free';
}
