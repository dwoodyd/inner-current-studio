# Inner Wake — Three-Tier Pricing Build Plan

This consolidates the audit fixes with the new Free / Pro Monthly / Pro Annual / Pro Lifetime structure. Shipping in 4 phases per Section 11 of the spec.

## Before I start — three blockers I need you to confirm

1. **Payment provider.** The spec says "PayPal Plans." This project is already wired end-to-end on **Paddle** (Paddle SDK, webhooks, `subscriptions.paddle_subscription_id`, `useSubscription` reading Paddle status, sandbox + live keys configured). Switching to PayPal would mean disconnecting Paddle, recreating all webhooks, and rebuilding `useSubscription`. **I'll implement the three-tier structure on Paddle** (creating Paddle Prices instead of PayPal Plans) unless you explicitly want a provider switch. The customer-facing experience is identical; only the back-end provider differs.
2. **Existing-trial-user migration.** Reset every existing trial user to a fresh 90-day founder window (your recommendation, my recommendation, simpler). **Defaulting to fresh 90** unless you say otherwise.
3. **The four Section-12 sign-offs** — Calendly link for the 1-on-1 call, quarterly cadence for "direct line to DeWayne", *Before the Words* confirmed as the companion-book pairing, and confirmation the 1-on-1 call is real. **Defaults:** Calendly link is a `calendlyUrl` env var the Lifetime user can edit later; quarterly cadence; *Before the Words* confirmed (already in About + Onboarding); 1-on-1 call shown as a Lifetime perk with "schedule via the link in your Subscription page" copy.

## Phase 1 — Foundational (ships first, unblocks everything)

This phase combines audit fixes with new pricing surfaces.

1. **Create Paddle products & prices** (founding tier):
   - `inner_wake_pro` product with three prices:
     - `iw_pro_monthly_founding` — $4.99/mo recurring
     - `iw_pro_annual_founding` — $39/yr recurring
     - `iw_pro_lifetime_founding` — $99 one-time
2. **Extend `useSubscription`** to expose `tier` as `free | pro_monthly | pro_annual | lifetime | founder_trial`, plus `isFoundingMember`, `founderDaysRemaining`, `slotsRemaining` (founding slot count).
3. **Build the new `/profile/subscription` page** per spec §8.2 — replaces the existing single-CTA Subscription page. Includes tier cards, Monthly/Annual toggle, "Reserve at this rate" CTAs (during founder window) vs "Upgrade to" (post-window), full feature comparison expander, and a "Founding Member · slot N/100" indicator.
4. **Update Founder Trial banner** per §8.1 — copy varies by state (founder window / Free post-window / paid member confirmation pill). All variants route to `/profile/subscription`.
5. **Wire Paddle checkout** to the three founding prices using the existing `usePaddleCheckout` hook.
6. **Webhook handler** for the three new price IDs in the existing Paddle webhook function — sets `tier` correctly on `profiles` based on which price was purchased; flags lifetime customers as founding members.
7. **Profile → Subscription menu item** — already routes to `/profile/subscription`; just confirm wiring after page rebuild.
8. **DB migration** — add columns to `profiles`: `is_founding_member boolean`, `founder_window_ends_at timestamptz`. Add `founder_lifetime_slots` table or counter for slot tracking.

After Phase 1, the live app shows the new pricing structure and the broken routes are fixed. Audit-spec critical bugs #1, #2, #3 closed.

## Phase 2 — Feature gating & paywall modals

9. **Daily-usage tracker** — new `daily_usage` table keyed by `(user_id, tool, date)`. Increment on completion of: Alignment Wheel, Breathwork session, Reset tool (any of State Ladder / Contrast / Resistance / Quiet Mind), Current Guide message.
10. **`useDailyLimit(tool)` hook** — returns `{ used, limit, canUse, isFree }`. Free tier limits per §3: Alignment Wheel 1, Breathwork 1, Reset tools 1 combined, Current Guide 3.
11. **`<PaywallModal />` component** per §3 — gentle copy, "See Pro options →" routes to `/profile/subscription`, secondary "Continue with what's free" closes.
12. **Gate the tools** — wrap entry points to AlignmentWheel, Breathwork, the four Reset tools, and CurrentGuide messaging with the daily-limit check + modal.
13. **Currents hub badge update** — Free non-money currents show "Pro" badge (already exists), Money shows "Free" pill, Pro users see no badges.
14. **Pro-only features** marked but not built here — Resonance Library, Practice Constellation, Sigil generation, soundscapes, Pattern Mirror history, Wisdom Streams full library, unlimited Custom Rituals. Gate these with `useSubscription().isPremium`. The features themselves already exist; this just wraps their entry points.
15. **Sign-up flow** per §8.4 — strip any forced pricing decision; new users land in the 90-day founder window automatically.
16. **"Reserve" vs "Upgrade" copy** — single helper that swaps CTA labels based on whether the user is inside their founder window.

## Phase 3 — Migration

17. **Existing $99 lifetime customers** — already in `subscriptions` with `tier='lifetime'`. Add the founding-member flag, surface "Founding Member · Lifetime" badge in Profile.
18. **Existing trial users** — migration sets `trial_ends_at = now() + 90 days`, `trial_type='beta'`, `is_founding_member=true`.
19. **Migration notice** — one-time toast/modal shown on next login per §10 copy.
20. **Free tier** — default `tier='free'`, `free_current='money'`, slot count untouched.

## Phase 4 — Post-beta (manual trigger when 100 slots fill)

21. Create Paddle retail prices: `iw_pro_monthly_retail` ($7.99/mo), `iw_pro_annual_retail` ($59/yr).
22. Pricing-page logic switches non-founding new users to retail prices.
23. Hide the Lifetime card from non-founding users.
24. Existing founders keep the founding-rate prices in their checkout flow forever.

## Out of scope (explicitly not in this build)

- Marketing site Section 8 updates (§9 of spec) — different repo / surface.
- Studios feature (Phase 2 of spec, not Phase 2 of this plan).
- Wind-Down Sleep Mode and Pop-out window (marked "when shipped" in the spec).
- The Manus OAuth provider mentioned in §8.4 — current project uses Supabase Auth. New users land in the founder window after standard email/Google sign-up.

## Technical notes

- **Provider**: Paddle, not PayPal — see blocker #1.
- **Routing**: `/profile/subscription` route already exists; this rebuild replaces the page contents.
- **`useSubscription`**: rather than rewrite, extend with derived `tier` enum and founding-member flags.
- **Banner**: `TrialCountdownBanner.tsx` is the right surface — rewrite copy switch.
- **Webhook**: `supabase/functions/paddle-webhook/` (existing) handles price-id → tier mapping. Need to add the three new IDs to the switch.
- **DB migrations**: profiles columns + `daily_usage` table + founding-slot tracking. All GRANTed properly, RLS on every table.
- **Founding slot count**: server-side counter to avoid TOCTOU on slot allocation. Reserved on checkout success in the webhook, not on click.

## Open questions in the body (re-listing for visibility)

- Paddle vs PayPal (blocker #1)
- Reset trial users to fresh 90 days (default yes)
- Calendly URL — env var, you provide value later
- Quarterly cadence for direct-line — confirmed unless you say otherwise
- *Before the Words* pairing — confirmed

Approve, and I'll ship Phase 1 first (Paddle prices + new Subscription page + banner + webhook + DB migration). Phases 2–4 after that.
