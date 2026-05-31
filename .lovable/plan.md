# Inner Wake Audit — Fix Plan

Working from the audit spec. Grouped by severity. I'll ship in waves so you can review between.

## Wave 1 — Critical broken routes

1. **`/profile/guide` (Current Guide)** — investigate the router; remove the "needs refresh" banner; wire the real Current Guide component (`src/pages/CurrentGuide.tsx` exists). If it throws on mount, fix the throw and add a real error boundary with a working reload.
2. **`/money` (Money Current)** — same fix. Wire `MoneyCurrent.tsx` to `/money`. Also add `/currents/money` as the canonical path with `/money` redirecting, for symmetry with future currents.
3. **`/profile/subscription`** — route to the existing `Subscription.tsx` page (currently 404s). Confirm it shows plan, days remaining, lifetime status, and a support link.

## Wave 2 — Significant UX issues

4. **Founder Trial banner** — re-target click from `/onboarding` to `/profile/subscription`. Update banner copy to clarify post-day-0 behavior (need your call on which variant — I'll default to *"$99 to keep lifetime access"* unless you say otherwise).
5. **"Resets today" counter** — Option A: only increment on completed practice (Alignment Wheel, Breathwork, Stillness Timer, rituals). Strip navigation-based increments. (Happy to switch to Option B qualitative copy if you prefer.)
6. **Sigil "73% awakened"** — remove numeric percentage; keep visual evolution + qualitative phrasing (*"Your Money Sigil is awakening. You've returned N times this cycle."*).
7. **Currents tab faded cards** — add explicit "COMING SOON" pill on Self / Energy / Relationship / Health and route them to a soft placeholder ("This current is forming…"). Add "ACTIVE FOCUS" pill on Money.

## Wave 3 — Ecosystem integration

8. **Profile footer** — add `An app from Soul Engineer →` linking to `https://soulengineer.online`.
9. **About page** — add two new sections at the bottom (before the v1.0 line):
   - **The Companion Book** — *Before the Words* by DeWayne Woods, no release date promised.
   - **Part of the Soul Engineer Ecosystem** — Continuary / Lifewoven / Inner Wake framing + link to soulengineer.online.
10. **Onboarding** — add a single closing line acknowledging Soul Engineer + Before the Words before dropping into Home.

## Wave 4 — Polish

11. Strip the word "premium" from the Stillness Timer description.
12. Smoke-test Pattern Mirror and Current Insights routes; fix or remove if dead.
13. Label or hide the "Future Pages" Quick Launch tile on Home.
14. Persist the user's last energy state across sessions instead of defaulting to Tight on every load.
15. Confirm onboarding skip-ahead works for returning users (only re-runs if user explicitly enters via banner).

## Things I need from you (don't block — I'll default if you don't answer)

- Banner post-day-0 copy variant (3 options in §5 of the spec). **Default:** *"FOUNDER TRIAL · N DAYS LEFT · $99 to keep lifetime access"*.
- Resets counter: Option A (gated increments) or Option B (qualitative). **Default:** A.
- Companion Book release framing — *"releases alongside Inner Wake's full launch"* unless you have a firmer line.

## Out of scope (audit §9 pricing model)

Pricing-model alignment across the ecosystem is a product decision, not a build task. Flagged for you; not changing billing logic.

## Technical notes

- Routes live in `src/App.tsx`; add the `/currents/money` alias and `/profile/subscription` mapping there.
- "Refresh banner" appears to be a fallback component — locate by searching for the string, then delete or repurpose it.
- Reset counter logic lives in `src/lib/AppContext.tsx` / `store.ts`; gate increments to ritual-completion events only.
- Last-state persistence: write `lastQuickState` to localStorage in `QuickCheckIn` and rehydrate in `AppContext`.
- Sigil percentage is rendered in `Profile.tsx`; swap for qualitative copy + keep the visual.

Approve and I'll ship Wave 1 first, then proceed through the rest.
