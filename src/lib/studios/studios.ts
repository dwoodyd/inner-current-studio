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
    subtitle: 'For when you\u2019ve been gone from yourself.',
    longDescription:
      'A 25-minute arc through Self, Energy, and Health currents \u2014 a soft re-entry into your own life when nothing has been catastrophic, only quiet.',
    estimatedMinutes: 25,
    steps: [
      { slug: 'self', sequenceId: 'self-morning-return', framing: 'First: come back into the room of you.' },
      { slug: 'energy', sequenceId: 'energy-morning-ignite', framing: 'Then: a thread of vitality, gently.' },
      { slug: 'health', sequenceId: 'health-morning-arrival', framing: 'Finally: settle back into your body.' },
    ],
    closingReflection: 'Notice: what part of you came home first?',
  },
  {
    id: 'open-hands',
    title: 'Open Hands',
    subtitle: 'Less gripping. More receiving.',
    longDescription:
      'A 22-minute arc through Money and Relationships currents \u2014 dissolving the quiet grip you\u2019ve been carrying without noticing.',
    estimatedMinutes: 22,
    steps: [
      { slug: 'money', sequenceId: 'money-morning-allowance', framing: 'Money first: open the channel to receive.' },
      { slug: 'relationships', sequenceId: 'rel-morning-bridge', framing: 'Then: soften the relational reach.' },
    ],
    closingReflection: 'Where in your body did the grip soften? Stay with that place a moment longer.',
  },
  {
    id: 'evening-current',
    title: 'Evening Current',
    subtitle: 'End the day with all five.',
    longDescription:
      'A long 45-minute arc \u2014 the deepest studio. One ending-thought sequence from each of the five currents, woven together as a single resonant closing.',
    estimatedMinutes: 45,
    steps: [
      { slug: 'health', sequenceId: 'health-evening-restore', framing: 'Health first: drop into the body that carried you today.' },
      { slug: 'energy', sequenceId: 'energy-evening-discharge', framing: 'Discharge the day\u2019s static.' },
      { slug: 'relationships', sequenceId: 'rel-evening-release', framing: 'Release what wasn\u2019t yours from the people you met.' },
      { slug: 'money', sequenceId: 'money-evening-trust', framing: 'Trust what was provided.' },
      { slug: 'self', sequenceId: 'self-evening-return', framing: 'Return to the self underneath everything.' },
    ],
    closingReflection: 'All five currents have been touched. Notice the shape of you right now \u2014 nothing to fix.',
  },
];

export function findStudio(id: string): Studio | undefined {
  return STUDIOS.find((s) => s.id === id);
}
