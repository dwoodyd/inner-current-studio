// Carries the plan the visitor picked on the marketing site (plus campaign tags)
// across the sign-up hop, so checkout can open for the right plan afterwards.

import { FOUNDING_PRICES, RETAIL_PRICES } from '@/lib/pricing';

export type SignupPlan = 'free' | 'pro-monthly' | 'pro-annual' | 'lifetime';

export interface SignupIntent {
  plan: SignupPlan;
  utmSource?: string;
  utmContent?: string;
  capturedAt: string;
}

const KEY = 'iw_signup_intent_v1';
const PLANS: SignupPlan[] = ['free', 'pro-monthly', 'pro-annual', 'lifetime'];

const clean = (v: string | null): string | undefined => {
  const t = v?.trim();
  return t ? t.slice(0, 120) : undefined;
};

/** Parse ?plan=…&utm_source=…&utm_content= from a query string. */
export function parseSignupIntent(search: string): SignupIntent | null {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const rawPlan = clean(params.get('plan'))?.toLowerCase().replace(/_/g, '-');
  const utmSource = clean(params.get('utm_source'));
  const utmContent = clean(params.get('utm_content'));
  const plan = PLANS.includes(rawPlan as SignupPlan) ? (rawPlan as SignupPlan) : undefined;
  if (!plan && !utmSource && !utmContent) return null;
  return {
    plan: plan ?? 'free',
    utmSource,
    utmContent,
    capturedAt: new Date().toISOString(),
  };
}

/** Store the intent before we hand off to the auth provider. */
export function captureSignupIntent(search?: string): SignupIntent | null {
  const intent = parseSignupIntent(search ?? (typeof window !== 'undefined' ? window.location.search : ''));
  if (!intent) return null;
  try {
    localStorage.setItem(KEY, JSON.stringify(intent));
  } catch {
    /* storage unavailable — intent simply doesn't survive the hop */
  }
  return intent;
}

export function readSignupIntent(): SignupIntent | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SignupIntent;
    if (!parsed || !PLANS.includes(parsed.plan)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSignupIntent() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

/** Which price a chosen plan should check out with. `free` never checks out. */
export function planToPriceId(plan: SignupPlan, opts: { founding: boolean } = { founding: true }): string | null {
  switch (plan) {
    case 'lifetime':
      return FOUNDING_PRICES.lifetime;
    case 'pro-annual':
      return opts.founding ? FOUNDING_PRICES.annual : RETAIL_PRICES.annual;
    case 'pro-monthly':
      return opts.founding ? FOUNDING_PRICES.monthly : RETAIL_PRICES.monthly;
    default:
      return null;
  }
}
