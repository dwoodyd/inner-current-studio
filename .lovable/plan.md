## Inner Wake Audit — Fix Plan

The audit identifies 3 "critical bugs" plus several UX/voice issues. Important context: the "This Current needs a refresh" screen the auditor hit on `/profile/guide` and `/money` is actually the `RouteErrorBoundary` fallback in `src/App.tsx` — it fires when the underlying page throws. The likely culprit was `useSubscription` failing for the owner account, which I already fixed last turn (admin → lifetime tier, `PremiumGate` now lets the owner pass). So those two routes should already load. I'll verify, then tackle the remaining items.

### 1. Verify the "broken" routes
- Load `/profile/guide` and `/money` in the preview after the subscription hook fix.
- If they still throw, surgically fix the actual error (likely a `freeCurrent` null edge case in `PremiumGate`).
- Improve `RouteErrorBoundary` copy so the placeholder doesn't masquerade as a real page: add a "Go home" link and log the underlying error to console.

### 2. Build `/profile/subscription`
- New `src/pages/Subscription.tsx`: shows plan (Founder Trial / Lifetime / Free), trial days remaining, "lifetime $99 locked in" confirmation, and a support email link.
- Wire route in `App.tsx`. Profile's existing Subscription link already points here.
- Founder Trial banner (`TrialCountdownBanner`) re-routes to `/profile/subscription` instead of `/onboarding`.

### 3. Soften gamification
- **Resets-today counter** (Home → TodayFlowCard): only increment on actual ritual completion, not navigation. Audit `today_flow.return_count` write sites and gate them.
- **Sigil "73% awakened"**: replace numeric percentage with qualitative phrasing ("Your Money Sigil is awakening — N returns this cycle"). Keep the visual.

### 4. Currents tab clarity
- Add a "COMING SOON" pill on Self / Energy / Relationship / Health cards in `CurrentsHub`.
- Add "ACTIVE FOCUS" tag on Money.
- Clicking a coming-soon current routes to a small "This current is forming" placeholder instead of the (gated) hub.

### 5. Soul Engineer ecosystem integration
- **Profile footer**: add "An app from Soul Engineer →" link to `https://soulengineer.online`.
- **About page**: append two sections — "The Companion Book" (Before the Words by DeWayne Woods) and "Part of the Soul Engineer Ecosystem".
- **Onboarding final step**: add a single-line acknowledgment of the ecosystem + companion book.

### 6. Copy polish
- Strip "premium" from Stillness Timer description in `Reset.tsx`.
- Persist last check-in state instead of defaulting widget to "Tight" on each load.
- Hide or relabel the "Future Pages" Quick Launch tile (label as "Reflect → Future Pages" so its purpose is clear).
- Soften Breathwork "voice guidance" copy if not implemented.

### 7. Out of scope (flagged but needs your decision)
- Pricing model alignment across the ecosystem (section 9 of audit) — requires a product decision, not a code change.
- Pattern Mirror / Current Insights deeper QA — will spot-check; full QA is its own pass.

### Files touched (approx)
- `src/App.tsx` (route + error boundary)
- `src/pages/Subscription.tsx` (new)
- `src/components/TrialCountdownBanner.tsx`
- `src/components/TodayFlowCard.tsx` + any `return_count` writers
- `src/pages/Profile.tsx` (sigil copy + footer link)
- `src/pages/CurrentsHub.tsx`
- `src/pages/About.tsx`
- `src/components/onboarding/InnerWakeOnboarding.tsx` (final line)
- `src/pages/Reset.tsx` (copy)
- `src/components/QuickCheckIn.tsx` or related (persist last state)

Want me to proceed with all of this in one pass, or prioritize a subset (e.g., critical bugs + ecosystem links first, gamification softening later)?