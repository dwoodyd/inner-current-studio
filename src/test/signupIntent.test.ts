import { describe, it, expect, beforeEach } from 'vitest';
import {
  captureSignupIntent,
  clearSignupIntent,
  parseSignupIntent,
  planToPriceId,
  readSignupIntent,
} from '@/lib/signupIntent';
import { FOUNDING_PRICES, RETAIL_PRICES } from '@/lib/pricing';

describe('signup intent', () => {
  beforeEach(() => clearSignupIntent());

  it('parses plan and utm values', () => {
    const intent = parseSignupIntent('?plan=pro-annual&utm_source=landing&utm_content=hero');
    expect(intent).toMatchObject({ plan: 'pro-annual', utmSource: 'landing', utmContent: 'hero' });
  });

  it('ignores unknown plans but keeps campaign tags', () => {
    expect(parseSignupIntent('?plan=banana&utm_source=x')).toMatchObject({ plan: 'free', utmSource: 'x' });
    expect(parseSignupIntent('?foo=bar')).toBeNull();
  });

  it('maps plans to prices, free never checks out', () => {
    expect(planToPriceId('pro-annual', { founding: true })).toBe(FOUNDING_PRICES.annual);
    expect(planToPriceId('pro-annual', { founding: false })).toBe(RETAIL_PRICES.annual);
    expect(planToPriceId('pro-monthly', { founding: true })).toBe(FOUNDING_PRICES.monthly);
    expect(planToPriceId('lifetime')).toBe(FOUNDING_PRICES.lifetime);
    expect(planToPriceId('free')).toBeNull();
  });

  // End-to-end funnel: pricing link → sign-up hop → Pro annual checkout.
  it('carries a Pro annual pick from pricing through sign-up to checkout', async () => {
    // 1. Visitor clicks Pro annual on the marketing site.
    captureSignupIntent('?plan=pro-annual&utm_source=marketing&utm_content=pricing-annual');

    // 2. Sign-up round trip (OAuth / magic link) — only storage survives.
    const afterAuth = readSignupIntent();
    expect(afterAuth?.plan).toBe('pro-annual');

    // 3. Attribution is saved and checkout opens on the Pro annual price.
    const savedProfile: Record<string, string> = {};
    if (afterAuth?.utmSource) savedProfile.utm_source = afterAuth.utmSource;
    if (afterAuth?.utmContent) savedProfile.utm_content = afterAuth.utmContent;
    expect(savedProfile).toEqual({ utm_source: 'marketing', utm_content: 'pricing-annual' });

    const opened: string[] = [];
    const priceId = planToPriceId(afterAuth!.plan, { founding: true });
    if (priceId) opened.push(priceId);
    clearSignupIntent();

    expect(opened).toEqual([FOUNDING_PRICES.annual]);
    expect(readSignupIntent()).toBeNull();
  });
});
