# Currents Hub — Full Build (All 4 Tracks at Once)

Replace the "Money" bottom-nav tab with a unified **"Currents"** hub housing five domains: Money (existing) + Self, Energy, Relationships, Health (new).

## 1. Database (single migration)

**New shared tables** (RLS: `auth.uid() = user_id`):
- `domain_states` — domain, state, note
- `domain_resistance` — domain, resistance_type, body_sensation, charge_before, charge_after, softened_thought
- `domain_openings` — domain, position, desire, why_it_matters, desired_feeling, current_resistance, next_aligned_step
- `domain_evidence` — domain, category, entry_text

**Alter** `gathered_sequences`: add `domain TEXT DEFAULT 'general'`.

Domain values: `self | energy | relationships | health` (money keeps its existing dedicated tables).

## 2. Navigation
- `BottomNav.tsx`: replace Money tab → **Currents** (`/currents`, Waves icon)
- All `/money/*` routes preserved
- New routes: `/currents`, `/self/*`, `/energy/*`, `/relationships/*`, `/health/*`

## 3. Currents Hub page (`/currents`)
Grid of 5 domain cards (Money, Self, Energy, Relationships, Health) — distinct gradients, glyph, tagline.

## 4. Per-domain modules (×4 new domains, 6 pages each)
1. **Hub** — module list (mirrors MoneyCurrent)
2. **State Check-in** → `domain_states`
3. **Affirmations Saturation** — timer + voice
4. **Gather Flow** — build/play/library filtered by domain
5. **Resistance Release** — multi-phase → `domain_resistance`
6. **Openings** — 7 desires → `domain_openings`
7. **Evidence** — daily proof → `domain_evidence`

## 5. Curated affirmation libraries
- **Self**: worthiness, confidence, identity, body acceptance, voice
- **Energy**: vitality, presence, recovery, aliveness
- **Relationships**: belonging, boundaries, love-receiving, connection
- **Health**: trust in body, healing, vibrant cells, ease

~50 starter affirmations + 4 tier categories per domain.

## 6. Affirmation Coach upgrade
- Domain selector chip row
- Edge function system prompt accepts `domain` parameter
- Domain-specific starter suggestions

## 7. Push notifications
Extend `affirmation_interval` to rotate across user's enabled domains.

## 8. Shared utilities
- `src/lib/domains.ts` — domain config (label, emoji, gradient, color, route, affirmations)
- Reusable parameterized components: `DomainStateCheckIn`, `DomainAffirmations`, `DomainGatherFlow`, `DomainResistanceRelease`, `DomainOpenings`, `DomainEvidence`

## Deliverables (~30 files)
- 1 migration
- BottomNav + App.tsx route additions
- 1 Currents hub page
- 4 domain hub pages
- 6 reusable domain components
- 1 domains config + 4 affirmation libraries
- 1 coach edge function update

## Out of scope
- Per-domain wealth-rhythm gamification
- Cross-domain analytics dashboard
