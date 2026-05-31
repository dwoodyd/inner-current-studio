// Studios — longer cross-current journeys composed of sequences from
// individual Currents. The journey runner walks the user through each
// chosen sequence, then closes with a single integration reflection.

import type { DomainKey } from '@/lib/domains';

export type StudioStep = {
  slug: DomainKey;
  sequenceId: string;
  framing: string; // why this step in the studio's arc
};

export type Studio = {
  id: string;
  title: string;
  subtitle: string;
  longDescription: string;
  estimatedMinutes: number;
  steps: StudioStep[];
  closingReflection: string; // shown after the final step
};

export const STUDIOS: Studio[] = [
  {
    id: 'returning',
    title: 'Returning',
    subtitle: 'For when you\'ve been gone from yourself.',
    longDescription:
      'A soft re-entry into your own life when nothing has been catastrophic, only quiet. Self → Energy → Health.',
    estimatedMinutes: 15,
    steps: [
      { slug: 'self', sequenceId: 'self-first-light', framing: 'First: come back into the room of you.' },
      { slug: 'energy', sequenceId: 'energy-restorative-pause', framing: 'Then: a thread of vitality, gently.' },
      { slug: 'health', sequenceId: 'health-body-listening', framing: 'Finally: settle back into your body.' },
    ],
    closingReflection: 'Notice: what part of you came home first?',
  },
  {
    id: 'open-hands',
    title: 'Open Hands',
    subtitle: 'Less gripping. More receiving.',
    longDescription:
      'Dissolving the quiet grip you\'ve been carrying without noticing. Money → Relationship.',
    estimatedMinutes: 15,
    steps: [
      { slug: 'money', sequenceId: 'money-morning-allowance', framing: 'Money first: open the channel to receive.' },
      { slug: 'relationships', sequenceId: 'rel-belonging', framing: 'Then: soften where you let yourself belong.' },
    ],
    closingReflection: 'Where in your body did the grip soften? Stay with that place a moment longer.',
  },
  {
    id: 'evening-current',
    title: 'Evening Current',
    subtitle: 'End the day with all five.',
    longDescription:
      'The deepest studio. One practice from each of the five currents, woven into a single resonant closing.',
    estimatedMinutes: 35,
    steps: [
      { slug: 'health', sequenceId: 'health-body-listening', framing: 'Health first: drop into the body that carried you today.' },
      { slug: 'energy', sequenceId: 'energy-inventory', framing: 'Take inventory of what drained and what restored.' },
      { slug: 'relationships', sequenceId: 'rel-repair-prep', framing: 'Tend to anything unfinished between you and someone.' },
      { slug: 'money', sequenceId: 'money-receiving-practice', framing: 'Sit with what it cost you to receive today.' },
      { slug: 'self', sequenceId: 'self-becoming', framing: 'Return to the self underneath everything.' },
    ],
    closingReflection: 'All five currents have been touched. Notice the shape of you right now — nothing to fix.',
  },
];

export function findStudio(id: string): Studio | undefined {
  return STUDIOS.find((s) => s.id === id);
}
