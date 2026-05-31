# Launch-Readiness Audit — Execution Plan

I read the full audit (9 blockers, 16 launch-impacting, 5 polish). Rather than touch all 28 items at once, I'll sequence them in dependency order so we ship a working app fast, then layer in gating, pricing correctness, and polish.

## Phase 1 — Unbreak the app (blockers #1, #2, #5, #9)

**Goal:** every route loads. Without this, nothing else matters.

1. **Realtime crash (#1)** — grep every `supabase.channel(...)` site, audit that all `.on('postgres_changes', …)` calls happen *before* `.subscribe()`. Likely suspects: `useCurrentsCloudSync`, `useSubscription`, `useFounderSlots`, daily-limit hook. Refactor so any conditional listener creates a *new* channel inside its own effect.
2. **Service worker (#9)** — confirm `public/sw.js` isn't self-unregistering and stomping fresh assets. If it is, replace with a safe shell (network-first for HTML, cache-first for hashed assets) or unregister cleanly on first load post-fix.
3. **Verify #2 routes** (`/profile/guide`, `/money` → `/currents/money`, `/profile/subscription`) load after the Realtime fix; only investigate further if they still break.
4. **Onboarding handoff (#5)** — confirm the final step routes into the now-working home and that the ecosystem card renders.

## Phase 2 — Close the pricing leaks (blockers #6, #7, #8, #20, #23)

**Goal:** Pro tier is actually a paywall, founder flag isn't free for everyone, Paddle webhook is trustworthy.

1. **Gate Pro routes (#6)** — wrap `/profile/resonance`, `/profile/patterns`, `/profile/rituals`, `/studios`, `/studios/:id` in `PremiumGate`.
2. **Founder flag (#7)** — `payments-webhook/index.ts:94` stops hard-coding `is_founding_member: true`; derive it from `founder_slots_remaining()` + the user's existing slot record.
3. **Tier mapping (#20)** — switch webhook to a server-side Price-ID → tier lookup; keep `customData.externalId` only as a fallback; verify Paddle signature on every event.
4. **Webhook URL path (#23)** — confirm Paddle dashboard (sandbox + live) points at the deployed `payments-webhook` function URL, not the legacy `paddle-webhook/` path referenced in old plan docs.
5. **Advertised-but-missing Pro features (#8)** — for Sigil generation, Practice Constellation, state-matched soundscapes, Wisdom Streams: deliver minimal v1 for the first two (they tie into existing Currents work), label the latter two "Coming soon" on `/profile/subscription` and marketing copy.

## Phase 3 — Pricing structure rollout (blockers #4, #3, item #13)

1. **Paddle sweep (#3)** — `rg -i 'stripe|paypal'` across the repo; remove any stale references; ensure all CTAs route through `usePaddleCheckout`; set footer copy to "Secure checkout · Cancel anytime · No hidden fees" (default; ask before switching to the Paddle-branded variant).
2. **Pattern C banner + page (#4, #13)** — Founder Trial banner text becomes state-aware (beta / post-beta Free / post-upgrade); banner click routes to `/profile/subscription`, not `/onboarding`; verify the three-tier page renders per spec; add the Day-91 downgrade path (edge function cron or on-load check that flips tier to Free and rewrites banner copy).
3. **Free-tier limits (#4)** — confirm `useDailyLimit` enforces the documented caps (Alignment Wheel 1/day, Breathwork 1/day, Reset tools 1/day, Current Guide 3/day, 1 active Current, Pattern Mirror current-week only).

## Phase 4 — Launch-impacting cleanup (items #14, #15, #16, #18, #22, #24, #25, #26, #27)

- Pattern Mirror history gate (#24) — current-week only on Free, full history on Pro.
- ResonanceLibrary / Pattern Mirror / My Rituals lock badges in Profile menu (#25).
- My Rituals Free cap = 1, paywall on 2nd create (#26).
- Service worker push (#18) — either revive it or hide the Notifications opt-in (#27). Default: hide for V1 with a "coming soon" caption; revive later.
- Currents "Coming Soon" pills (#16) on Self/Energy/Relationships/Health cards while only Money is fully built.
- Drop the word "premium" from Stillness Timer copy (#15).
- Regenerate Supabase types (#22) so `founder_slots_remaining` / `daily_usage` are typed.
- PWA splash + safe-area verification (#14) — quick CSS audit + manifest review.

## Phase 5 — Polish (items #19–22 in polish section, plus #10–12, #17)

- Voice pass on Currents tagline.
- Today dashboard "Recommended Now" prominence.
- 1am–5am vibe shift (post-launch).
- Founding-member intake form / admin queue / Resend transactional emails (#17) — surfaces only if launch needs an in-app application path; otherwise marketing-site form is acceptable for V1.
- Google OAuth / email confirmation smoke test (#21).
- Sidebar audit for stray Continuary-only features (#12).

## How I'll work

- I will ship each phase as its own message so you can verify before I move on.
- I will *not* run any DB migrations without showing you the SQL first.
- Polish items only land after Phases 1–3 are green.
- I'll keep `inner-wake-logo.svg` as the single brand asset — no PNG regressions.

## Technical notes

- Realtime fix uses `.on(...).on(...).subscribe()` chaining; never call `.on` post-subscribe. Hooks that need dynamic listeners create a fresh channel keyed on the dependency.
- Webhook lookup table lives in `supabase/functions/_shared/paddle.ts` so the price→tier map has one source of truth used by both checkout and webhook.
- Free-tier gates use the existing `useDailyLimit` + `PremiumGate` / `DailyLimitGate` primitives — no new gating pattern.
- Day-91 transition runs on `useSubscription` mount (cheap, deterministic) plus an edge function nightly sweep for users who never open the app.

## Ready to start?

Confirm and I'll begin with **Phase 1 (Realtime crash + SW)** in the next message. If you want a different starting point (e.g., webhook first, or shipping Phase 4 polish alongside Phase 1), say so and I'll resequence.