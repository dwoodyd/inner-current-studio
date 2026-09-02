/**
 * Room configs — what lives inside each Current's dark room.
 *
 * Money has a deep, purpose-built toolset. The other four currents share the
 * same seven practices, grouped by how long they take, so every room has the
 * same shape and only the hue and the language change.
 */
import {
  Heart, Receipt, Target, Sparkles, BookOpen, Timer, Bot, Library, Feather,
  Leaf, ShieldCheck, Wind,
} from 'lucide-react';
import type { DomainConfig, DomainKey } from '@/lib/domains';
import type { RoomConfig, RoomRecommendation, RoomSection } from '@/components/currents/CurrentRoom';
import type { EmotionalState } from '@/lib/types';

/* ------------------------------------------------------------------ money */

const moneySections: RoomSection[] = [
  {
    title: 'Quick returns',
    time: '1–3 min',
    tools: [
      { icon: Heart, title: 'Money State', description: 'Notice the current texture.', to: '/money/state' },
      { icon: Timer, title: 'Affirmations', description: 'One believable line.', to: '/money/affirmations' },
      { icon: Receipt, title: 'Payment Shift', description: 'Let one payment soften.', to: '/money/payment-shift' },
      { icon: Sparkles, title: 'Evidence', description: 'Track support already here.', to: '/money/evidence' },
    ],
  },
  {
    title: 'Ritual work',
    time: '4–7 min',
    tools: [
      { icon: ShieldCheck, title: 'Resistance Release', description: 'Name, feel, and soften tension.', to: '/money/resistance' },
      { icon: BookOpen, title: 'Gather Flow', description: 'Build a sequence to return to.', to: '/money/gather' },
      { icon: Feather, title: 'Reality Scripting', description: 'Write what your body can believe.', to: '/money/script' },
      { icon: Receipt, title: 'Current Deposit', description: 'Welcome without gripping.', to: '/money/deposit' },
    ],
  },
  {
    title: 'Deeper support',
    time: 'when you have room',
    deep: true,
    tools: [
      { icon: Bot, title: 'Affirmation Coach', description: 'Ask for quieter language that meets your state.', to: '/money/coach' },
      { icon: Target, title: 'Money Openings', description: 'Clarify the desire that still feels alive.', to: '/money/openings' },
      { icon: Library, title: 'Library', description: 'Revisit the words that stayed.', to: '/money/library' },
      { icon: Leaf, title: 'Wealth Rhythm', description: 'Tend return without streak pressure.', to: '/money/wealth-rhythm' },
      { icon: Sparkles, title: 'Overflow Practice', description: 'Spend from circulation, not fear.', to: '/money/overflow' },
      { icon: Target, title: 'Aligned Action', description: 'One next step your body agrees with.', to: '/money/aligned-action' },
      { icon: Timer, title: 'Affirmation Tracker', description: 'See which lines actually landed.', to: '/money/tracker' },
    ],
  },
];

const moneyRecommendations: Partial<Record<EmotionalState, RoomRecommendation>> = {
  raw: { label: 'raw', line: 'You named something tender recently. The softest next step is letting the body stop bracing.', cta: 'Soften this', meta: 'Money Resistance Release · 5 min', to: '/money/resistance' },
  tense: { label: 'tight', line: 'You feel tight around money right now. No new belief is needed before one breath of room.', cta: 'Start with the body', meta: 'Money State · 2 min', to: '/money/state' },
  discouraged: { label: 'burdened', line: 'You named heaviness recently. Begin where the weight is, not where you think you should be.', cta: 'Let one layer loosen', meta: 'Resistance Release · 5 min', to: '/money/resistance' },
  scattered: { label: 'scattered', line: 'Your attention is moving in several directions. One small sequence can gather it back.', cta: 'Gather one current', meta: 'Money Gather Flow · 4 min', to: '/money/gather' },
  flat: { label: 'flat', line: 'Nothing has to feel inspiring yet. A believable sentence is enough contact for today.', cta: 'Find one true line', meta: 'Money Affirmations · 3 min', to: '/money/affirmations' },
  neutral: { label: 'neutral', line: 'Neutral is workable. Let this be a place to notice what wants a little more room.', cta: 'Name the opening', meta: 'Money Openings · 4 min', to: '/money/openings' },
  open: { label: 'open', line: 'There is a little room here. Practice receiving without turning it into pressure.', cta: 'Write the scene', meta: 'Reality Scripting · 7 min', to: '/money/script' },
  hopeful: { label: 'hopeful', line: 'Hope is present. Keep it grounded enough that your body can stay with it.', cta: 'Build evidence', meta: 'Evidence of Support · 3 min', to: '/money/evidence' },
  steady: { label: 'steady', line: 'Steadiness is already a form of support. Let one payment become part of circulation.', cta: 'Shift a payment', meta: 'Payment Shift · 3 min', to: '/money/payment-shift' },
  flowing: { label: 'flowing', line: 'Flowing does not need escalation. Let this rhythm become normal and quietly repeatable.', cta: 'Tend the rhythm', meta: 'Wealth Rhythm · 5 min', to: '/money/wealth-rhythm' },
};

export const MONEY_ROOM: RoomConfig = {
  sections: moneySections,
  recommendations: moneyRecommendations,
  fallback: {
    label: 'steady',
    line: 'Start with the smallest honest place. Money can be tended without forcing a better mood.',
    cta: 'Begin softly',
    meta: 'Money State · 2 min',
    to: '/money/state',
  },
};

/* --------------------------------------------------------- shared rooms */

function sharedSections(domain: DomainConfig): RoomSection[] {
  const r = domain.route;
  const first = domain.label.split(' ')[0];
  return [
    {
      title: 'Quick returns',
      time: '1–3 min',
      tools: [
        { icon: Heart, title: `${first} State`, description: 'Notice the current texture.', to: `${r}/state` },
        { icon: Timer, title: 'Affirmations', description: 'Soak in one believable line.', to: `${r}/affirmations` },
        { icon: Sparkles, title: 'Evidence', description: 'Track what is already true.', to: `${r}/evidence` },
        { icon: Target, title: '7 Openings', description: 'Name what still feels alive.', to: `${r}/openings` },
      ],
    },
    {
      title: 'Ritual work',
      time: '4–7 min',
      tools: [
        { icon: Wind, title: 'Resistance Release', description: 'Name, feel, and soften what is in the way.', to: `${r}/resistance` },
        { icon: BookOpen, title: 'Gather Flow', description: 'Build a sequence to return to.', to: `${r}/gather` },
      ],
    },
    {
      title: 'Deeper support',
      time: 'when you have room',
      deep: true,
      tools: [
        { icon: Feather, title: 'Reality Scripting', description: 'Write what your body can believe, then watch for the match.', to: `${r}/script` },
      ],
    },
  ];
}

const HEALTH_RECOMMENDATIONS: Partial<Record<EmotionalState, RoomRecommendation>> = {
  raw: { label: 'raw', line: 'Something tender is close to the surface. Let the body be met before it is asked to heal.', cta: 'Soften one layer', meta: 'Resistance Release · 5 min', to: '/health/resistance' },
  tense: { label: 'braced', line: 'The body is holding. Nothing needs to change before one honest breath of room.', cta: 'Start with the body', meta: 'Health State · 2 min', to: '/health/state' },
  discouraged: { label: 'heavy', line: 'Healing is not linear and you are not behind. Begin where the weight actually is.', cta: 'Let the weight be named', meta: 'Resistance Release · 5 min', to: '/health/resistance' },
  scattered: { label: 'scattered', line: 'Attention is in several places at once. One short sequence can gather it back into the body.', cta: 'Gather one current', meta: 'Gather Flow · 4 min', to: '/health/gather' },
  flat: { label: 'flat', line: 'Nothing has to feel vital yet. One believable sentence is enough contact for today.', cta: 'Find one true line', meta: 'Health Affirmations · 3 min', to: '/health/affirmations' },
  neutral: { label: 'neutral', line: 'Neutral is workable ground. Notice what in the body wants a little more ease.', cta: 'Name the opening', meta: '7 Openings · 4 min', to: '/health/openings' },
  open: { label: 'easing', line: 'There is a little ease here. Practice receiving it without turning it into a project.', cta: 'Log what eased', meta: 'Evidence · 3 min', to: '/health/evidence' },
  hopeful: { label: 'mending', line: 'Hope is present. Keep it grounded enough that the body can stay with it.', cta: 'Build evidence', meta: 'Evidence · 3 min', to: '/health/evidence' },
  steady: { label: 'steady', line: 'Steadiness is already a form of health. Let the sequence you trust become ordinary.', cta: 'Return to your sequence', meta: 'Gather Flow · 4 min', to: '/health/gather' },
  flowing: { label: 'vital', line: 'Vitality does not need escalation. Let this rhythm become normal and repeatable.', cta: 'Write the scene', meta: 'Reality Scripting · 7 min', to: '/health/script' },
};

function genericRecommendations(domain: DomainConfig): Partial<Record<EmotionalState, RoomRecommendation>> {
  const r = domain.route;
  const first = domain.label.split(' ')[0].toLowerCase();
  return {
    raw: { label: 'raw', line: `Something tender is close. Let it be met before anything about ${first} is asked to change.`, cta: 'Soften one layer', meta: 'Resistance Release · 5 min', to: `${r}/resistance` },
    tense: { label: 'braced', line: 'You are holding. No new belief is needed before one breath of room.', cta: 'Start with the body', meta: 'State check-in · 2 min', to: `${r}/state` },
    discouraged: { label: 'heavy', line: 'Begin where the weight is, not where you think you should be.', cta: 'Let one layer loosen', meta: 'Resistance Release · 5 min', to: `${r}/resistance` },
    scattered: { label: 'scattered', line: 'Attention is moving in several directions. One small sequence can gather it back.', cta: 'Gather one current', meta: 'Gather Flow · 4 min', to: `${r}/gather` },
    flat: { label: 'flat', line: 'Nothing has to feel inspiring yet. A believable sentence is enough contact for today.', cta: 'Find one true line', meta: 'Affirmations · 3 min', to: `${r}/affirmations` },
    neutral: { label: 'neutral', line: 'Neutral is workable. Notice what wants a little more room here.', cta: 'Name the opening', meta: '7 Openings · 4 min', to: `${r}/openings` },
    open: { label: 'open', line: 'There is a little room. Practice receiving without turning it into pressure.', cta: 'Write the scene', meta: 'Reality Scripting · 7 min', to: `${r}/script` },
    hopeful: { label: 'hopeful', line: 'Hope is present. Keep it grounded enough that your body can stay with it.', cta: 'Build evidence', meta: 'Evidence · 3 min', to: `${r}/evidence` },
    steady: { label: 'steady', line: 'Steadiness is already support. Let the practice you trust become ordinary.', cta: 'Return to your sequence', meta: 'Gather Flow · 4 min', to: `${r}/gather` },
    flowing: { label: 'flowing', line: 'Flowing does not need escalation. Let this rhythm become quietly repeatable.', cta: 'Tend the rhythm', meta: 'Reality Scripting · 7 min', to: `${r}/script` },
  };
}

export function roomFor(domain: DomainConfig): RoomConfig {
  if (domain.key === 'money') return MONEY_ROOM;
  const recommendations: Partial<Record<EmotionalState, RoomRecommendation>> =
    domain.key === 'health' ? HEALTH_RECOMMENDATIONS : genericRecommendations(domain);
  return {
    sections: sharedSections(domain),
    recommendations,
    fallback: {
      label: 'steady',
      line: 'Start with the smallest honest place. Nothing here needs a better mood first.',
      cta: 'Begin softly',
      meta: 'State check-in · 2 min',
      to: `${domain.route}/state`,
    },
  };
}

export type { DomainKey };
