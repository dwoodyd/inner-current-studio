/**
 * Canonical state descriptions — locked voice doctrine.
 *
 * Use these strings verbatim across every surface. Never soften "negative"
 * states (Tight / Restless are felt-states to be honored, not problems).
 *
 *  - label       → state pill (title case)
 *  - tagline     → short subtitle below the Orb (lowercase after the comma, no period)
 *  - description → three-phrase version for tooltips, retrospectives, Guide reflections,
 *                  and the Resonance Library archive (sentence case, period per phrase)
 */
import type { QuickState } from '@/lib/types';
import orbTightImg from '@/assets/orb-tight.png';
import orbRestlessImg from '@/assets/orb-restless.png';
import orbFlatImg from '@/assets/orb-flat.png';
import orbOpenImg from '@/assets/orb-open.png';
import orbFlowingImg from '@/assets/orb-flowing.png';
import orbTightVid from '@/assets/orbs/orb-tight.mp4';
import orbRestlessVid from '@/assets/orbs/orb-restless.mp4';
import orbFlatVid from '@/assets/orbs/orb-flat.mp4';
import orbOpenVid from '@/assets/orbs/orb-open.mp4';
import orbFlowingVid from '@/assets/orbs/orb-flowing.mp4';

export interface StateDef {
  id: QuickState;
  label: string;
  tagline: string;
  description: string;
  orb: string;
  /** Soundscape id from src/lib/sounds.ts SOUND_OPTIONS — state-matched ambient. */
  soundscape: string;
}

export const STATE_DEFS: Record<QuickState, StateDef> = {
  tight: {
    id: 'tight',
    label: 'Tight',
    tagline: 'Contracted, holding on',
    description: 'Contracted. Focused. Holding energy close.',
    orb: orbTight,
    soundscape: 'bowl',
  },
  restless: {
    id: 'restless',
    label: 'Restless',
    tagline: 'Agitated, in motion',
    description: 'Agitated. Unsettled. Energy in motion.',
    orb: orbRestless,
    soundscape: 'stream',
  },
  flat: {
    id: 'flat',
    label: 'Flat',
    tagline: 'Steady, present',
    description: 'Steady. Even. Balanced and calm.',
    orb: orbFlat,
    soundscape: 'drone',
  },
  open: {
    id: 'open',
    label: 'Open',
    tagline: 'Expansive, available',
    description: 'Expansive. Receptive. Open and available.',
    orb: orbOpen,
    soundscape: 'wind',
  },
  flowing: {
    id: 'flowing',
    label: 'Flowing',
    tagline: 'In flow, at ease',
    description: 'In flow. Effortless. Aligned and at ease.',
    orb: orbFlowing,
    soundscape: 'ocean',
  },
};

export const STATE_ORDER: QuickState[] = ['tight', 'restless', 'flat', 'open', 'flowing'];
