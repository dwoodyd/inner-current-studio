
## What Already Exists
- ✅ App shell, routing, onboarding, navigation
- ✅ Home tab (CurrentPulse, QuickCheckIn, TodayFlowCard, QuickLaunchCards, DailyInsight)
- ✅ Align tab (Alignment Wheel, Relief Wheel, Gather Flow, Momentum Ring)
- ✅ Reset tab (State Ladder, Contrast Reset, Stillness Timer)
- ✅ Reflect tab (Future Pages, Imagine If, Overflow Practice, My Current)
- ✅ Profile tab (Current Insights, My Rituals, Current Guide AI, Pattern Mirror, Notifications)
- ✅ Local persistence, edge function for AI guide, design system

## What Needs to Be Built

### Batch 1: Resistance Release (core Reset feature)
- New page `/reset/resistance` with full 4-path clearing flow
- Trigger selection (fear, urgency, doubt, shame, etc.)
- Body location selector
- 4 clearing paths: Breathe Through It, Soften the Thought, Let It Be Here, Move the Energy
- Before/after charge check
- Add to Reset tab navigation
- Update data model with resistance entries

### Batch 2: Quiet the Mind Module (9 sub-features)
- New hub page `/reset/quiet` with sub-feature navigation
- **Present Moment Interrupt** `/reset/quiet/present` — 30-90s mindful interrupt
- **Resistance Scan** `/reset/quiet/scan` — diagnostic resistance identifier
- **Analytical Mind Off-Ramp** `/reset/quiet/offramp` — overthinking support
- **Thought Shift Ladder** `/reset/quiet/shift` — 5-step thought shifting tool
- **Mental Chatter to Inner Clarity** `/reset/quiet/clarity` — 2-min mental noise flow
- **Pattern Softener** `/reset/quiet/patterns` — recurring loop softener
- **Higher View** `/reset/quiet/higher` — perspective shift prompts
- **Situation Packs** `/reset/quiet/situations` — guided packs for common themes
- **No Progress Support** `/reset/quiet/support` — troubleshooting for stuck users

### Batch 3: Data Model & Types Expansion
- Add `ResistanceEntry`, `ThoughtShift`, `TriggerPattern` types
- Add store functions and context methods
- Update QuickLaunchCards and Home recommendations

### Batch 4: Design & Animation Polish
- Refine all new pages with premium glassmorphism, animations
- Ensure consistent typography hierarchy
- Add completion states and empty states with warm microcopy
- Verify mobile-first layout on all new pages

## Approach
Build in 4 sequential batches. Each batch will be implemented with parallel file writes where possible. All features use local-first persistence consistent with existing architecture.
