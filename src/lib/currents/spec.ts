// Five-Currents spec layer — additive metadata on top of DomainConfig.
// Sources hero copy, empty state, sigil base shape, belief library,
// guided sequences, pattern-mirror angle, and Current Guide voice rails
// from the Inner Wake Five Currents Build Spec.

import type { DomainKey } from '@/lib/domains';

export type SigilBase =
  | 'spiral'      // money — circle + inward spiral
  | 'concentric'  // self — circle inside circle
  | 'wave'        // energy — EKG line
  | 'venn'        // relationship — two intersecting circles
  | 'leaf';       // health — sprouting leaf

export type Belief = {
  id: string;
  startingThought: string;
  bridgeThoughts: string[];
  endingThought: string;
  difficulty: 1 | 2 | 3;
  themes: string[];
};

export type SequenceStep =
  | { type: 'breath'; pattern: 'box' | 'sigh' | 'long-exhale' | 'ignite'; cycles: number; label?: string }
  | { type: 'state-check'; prompt?: string }
  | { type: 'reflection'; prompt: string; minChars?: number }
  | { type: 'current-guide-message'; message: string }
  | { type: 'belief-shift'; beliefId: string }
  | { type: 'stillness'; seconds: number; label?: string }
  | { type: 'sigil-touch'; label?: string }
  | { type: 'declarative-read'; lines: string[] };

export type GuidedSequence = {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  steps: SequenceStep[];
};

export type CurrentSpec = {
  slug: DomainKey;
  shortName: string;          // "Money", "Self", "Energy", "Relationship", "Health"
  tagline: string;
  symbol: string;             // emoji
  sigilBase: SigilBase;
  heroFraming: string;        // longform paragraph
  emptyState: string;         // shown before any practice
  voiceVocabulary: string[];  // words the Guide leans into
  voiceAvoid: string[];       // words/phrases to never use
  patternMirrorAngle: string; // weekly reflection template
  beliefs: Belief[];
  sequences: GuidedSequence[];
  medicalSafety?: boolean;    // health only
};

// ────────────────────────── MONEY ──────────────────────────
const moneyBeliefs: Belief[] = [
  { id: 'm-1', startingThought: 'There\u2019s never enough money.', bridgeThoughts: ['I have what I need today.', 'Money flows when I\u2019m not gripping.'], endingThought: 'I trust what\u2019s coming.', difficulty: 2, themes: ['scarcity'] },
  { id: 'm-2', startingThought: 'I have to earn it before I can have it.', bridgeThoughts: ['I\u2019m allowed to receive.', 'Receiving is its own work.'], endingThought: 'I let in what\u2019s mine.', difficulty: 2, themes: ['receiving', 'worth'] },
  { id: 'm-3', startingThought: 'People with money are different.', bridgeThoughts: ['Money is just energy.', 'I\u2019m allowed to be one of them.'], endingThought: 'I belong in abundance.', difficulty: 2, themes: ['belonging'] },
  { id: 'm-4', startingThought: 'If I make more, I\u2019ll lose myself.', bridgeThoughts: ['Money amplifies who I already am.', 'I can stay myself with more.'], endingThought: 'I keep my soul as I rise.', difficulty: 3, themes: ['identity'] },
  { id: 'm-5', startingThought: 'I\u2019m bad with money.', bridgeThoughts: ['I\u2019m learning my own rhythm.', 'Each choice is just one choice.'], endingThought: 'I trust my next decision.', difficulty: 1, themes: ['self-trust'] },
  { id: 'm-6', startingThought: 'Wanting more is greedy.', bridgeThoughts: ['Wanting is honest.', 'My desires have meaning.'], endingThought: 'What I want is information.', difficulty: 2, themes: ['desire'] },
  { id: 'm-7', startingThought: 'I\u2019ll never get out of this hole.', bridgeThoughts: ['Today\u2019s hole is not tomorrow\u2019s.', 'Small movements compound.'], endingThought: 'I\u2019m already moving.', difficulty: 3, themes: ['scarcity', 'hope'] },
  { id: 'm-8', startingThought: 'Money is hard for me.', bridgeThoughts: ['It\u2019s just been hard so far.', 'Hard now doesn\u2019t mean always.'], endingThought: 'Ease is reachable.', difficulty: 1, themes: ['ease'] },
  { id: 'm-9', startingThought: 'I don\u2019t deserve to be paid for that.', bridgeThoughts: ['My work has value.', 'Receiving honors the work.'], endingThought: 'I\u2019m worth what I earn.', difficulty: 2, themes: ['worth', 'receiving'] },
  { id: 'm-10', startingThought: 'There\u2019s no way out of this.', bridgeThoughts: ['I don\u2019t see the way yet.', 'The way often appears late.'], endingThought: 'I trust what unfolds.', difficulty: 3, themes: ['hope'] },
  { id: 'm-11', startingThought: 'Money will change me.', bridgeThoughts: ['I can choose what changes.', 'I direct my own growth.'], endingThought: 'Money meets me as I am.', difficulty: 2, themes: ['identity'] },
  { id: 'm-12', startingThought: 'Other people are doing better than me.', bridgeThoughts: ['I\u2019m running my own race.', 'Comparison is its own pain.'], endingThought: 'My pace is my pace.', difficulty: 1, themes: ['comparison'] },
];

const moneySequences: GuidedSequence[] = [
  {
    id: 'money-morning-allowance', title: 'Morning Allowance', description: 'Open the day to receive — without forcing.', estimatedMinutes: 6,
    steps: [
      { type: 'breath', pattern: 'long-exhale', cycles: 4, label: 'Settle in' },
      { type: 'state-check', prompt: 'How is Money sitting in you this morning?' },
      { type: 'belief-shift', beliefId: 'm-2' },
      { type: 'current-guide-message', message: 'Today, you don\u2019t have to chase. You\u2019re allowed to be available to what comes.' },
      { type: 'sigil-touch', label: 'A breath with your Money sigil.' },
    ],
  },
  {
    id: 'money-receiving-practice', title: 'The Receiving Practice', description: 'Sit with what it costs you to let it in.', estimatedMinutes: 9,
    steps: [
      { type: 'breath', pattern: 'box', cycles: 6, label: 'Square breath' },
      { type: 'reflection', prompt: 'What are you afraid will happen if you let it in?', minChars: 30 },
      { type: 'belief-shift', beliefId: 'm-9' },
      { type: 'stillness', seconds: 60, label: 'Sit with what surfaced.' },
      { type: 'sigil-touch' },
    ],
  },
  {
    id: 'money-storm-reset', title: 'Money Storm Reset', description: 'Quick reset when the panic spikes.', estimatedMinutes: 3,
    steps: [
      { type: 'state-check', prompt: 'Name the wave you\u2019re in.' },
      { type: 'breath', pattern: 'sigh', cycles: 5, label: 'Two-step exhale' },
      { type: 'current-guide-message', message: 'The storm is real. So is the ground under it. Both can be true.' },
    ],
  },
];

// ────────────────────────── SELF ──────────────────────────
const selfBeliefs: Belief[] = [
  { id: 's-1', startingThought: 'I don\u2019t know who I am anymore.', bridgeThoughts: ['I\u2019m in between selves.', 'Becoming has no map.'], endingThought: 'I\u2019m becoming who I\u2019m becoming.', difficulty: 2, themes: ['identity'] },
  { id: 's-2', startingThought: 'I\u2019m not enough.', bridgeThoughts: ['I\u2019m enough for today.', 'Enough is not a finish line.'], endingThought: 'I\u2019m enough as I am, becoming more.', difficulty: 1, themes: ['worth'] },
  { id: 's-3', startingThought: 'I have to be more before I can be loved.', bridgeThoughts: ['Love doesn\u2019t wait for finished.', 'I\u2019m already worth meeting.'], endingThought: 'I\u2019m already worth meeting.', difficulty: 2, themes: ['worth'] },
  { id: 's-4', startingThought: 'I\u2019m too much.', bridgeThoughts: ['I\u2019m a full person.', 'Fullness isn\u2019t a flaw.'], endingThought: 'I\u2019m exactly the right amount for me.', difficulty: 1, themes: ['worth'] },
  { id: 's-5', startingThought: 'I should be further along by now.', bridgeThoughts: ['There is no timeline.', 'I can only start from here.'], endingThought: 'I\u2019m where I am. That\u2019s the only place I can start from.', difficulty: 2, themes: ['pace'] },
  { id: 's-6', startingThought: 'Other people see me more clearly than I see myself.', bridgeThoughts: ['Their view is partial too.', 'I\u2019m allowed to know myself first.'], endingThought: 'I get to know myself first.', difficulty: 2, themes: ['self-trust'] },
  { id: 's-7', startingThought: 'If they really knew me they\u2019d leave.', bridgeThoughts: ['Some would. Some would stay.', 'The stayers are who I\u2019m for.'], endingThought: 'The ones who stay get to know me.', difficulty: 3, themes: ['belonging'] },
  { id: 's-8', startingThought: 'I\u2019m too sensitive.', bridgeThoughts: ['Sensitivity is signal.', 'I feel things because I\u2019m alive.'], endingThought: 'My sensitivity is information.', difficulty: 1, themes: ['sensitivity'] },
  { id: 's-9', startingThought: 'I have to perform to be loved.', bridgeThoughts: ['Performing exhausts me.', 'I can let love land without earning it.'], endingThought: 'I\u2019m allowed to be loved as I am.', difficulty: 2, themes: ['worth'] },
  { id: 's-10', startingThought: 'I don\u2019t know what I want.', bridgeThoughts: ['Not knowing is honest.', 'Clarity comes by listening, not forcing.'], endingThought: 'Not knowing is its own clarity.', difficulty: 1, themes: ['clarity'] },
  { id: 's-11', startingThought: 'I\u2019m wasting my potential.', bridgeThoughts: ['Pace is also a choice.', 'My slow is honoring something.'], endingThought: 'My pace honors something.', difficulty: 2, themes: ['pace'] },
  { id: 's-12', startingThought: 'I have to figure it all out alone.', bridgeThoughts: ['Being witnessed is allowed.', 'Help is part of becoming.'], endingThought: 'I\u2019m allowed to be witnessed.', difficulty: 2, themes: ['belonging'] },
  { id: 's-13', startingThought: 'I\u2019m broken.', bridgeThoughts: ['I\u2019m hurt, not broken.', 'Being human comes with this.'], endingThought: 'I\u2019m a human being, being human.', difficulty: 3, themes: ['worth'] },
  { id: 's-14', startingThought: 'I keep failing at being myself.', bridgeThoughts: ['I\u2019m still arriving.', 'Becoming isn\u2019t a finish line.'], endingThought: 'I\u2019m still arriving.', difficulty: 2, themes: ['identity'] },
  { id: 's-15', startingThought: 'I don\u2019t trust my own decisions.', bridgeThoughts: ['Each choice teaches me.', 'Trust is built, not given.'], endingThought: 'I\u2019m building that trust now.', difficulty: 2, themes: ['self-trust'] },
];

const selfSequences: GuidedSequence[] = [
  {
    id: 'self-first-light', title: 'First-Light Self Check', description: 'A short meeting with who you are today.', estimatedMinutes: 5,
    steps: [
      { type: 'breath', pattern: 'long-exhale', cycles: 3 },
      { type: 'state-check', prompt: 'Where is Self showing up in you right now?' },
      { type: 'reflection', prompt: 'Who are you today? Just today.', minChars: 20 },
      { type: 'current-guide-message', message: 'That\u2019s who you are today. Tomorrow gets its own answer.' },
    ],
  },
  {
    id: 'self-becoming', title: 'The Becoming Practice', description: 'Land one belief and honor it with one small move.', estimatedMinutes: 11,
    steps: [
      { type: 'breath', pattern: 'box', cycles: 6 },
      { type: 'belief-shift', beliefId: 's-5' },
      { type: 'current-guide-message', message: 'You don\u2019t need a new identity. You need to honor this one.' },
      { type: 'sigil-touch' },
      { type: 'reflection', prompt: 'What\u2019s one small way you\u2019ll honor that today?', minChars: 15 },
    ],
  },
  {
    id: 'self-trust', title: 'Self-Trust Restoration', description: 'A second-guessed decision, met gently.', estimatedMinutes: 7,
    steps: [
      { type: 'breath', pattern: 'long-exhale', cycles: 4 },
      { type: 'reflection', prompt: 'What\u2019s a decision you\u2019ve been second-guessing?', minChars: 25 },
      { type: 'belief-shift', beliefId: 's-15' },
      { type: 'current-guide-message', message: 'You are allowed to be the one who decides.' },
    ],
  },
];

// ────────────────────────── ENERGY ──────────────────────────
const energyBeliefs: Belief[] = [
  { id: 'e-1', startingThought: 'I\u2019m always tired.', bridgeThoughts: ['My body has been carrying.', 'Tired is information.'], endingThought: 'My body is asking for something.', difficulty: 1, themes: ['rest'] },
  { id: 'e-2', startingThought: 'I should be able to do more.', bridgeThoughts: ['My capacity is honest.', 'Today has its own ceiling.'], endingThought: 'I can do what I can do today.', difficulty: 1, themes: ['capacity'] },
  { id: 'e-3', startingThought: 'Rest is lazy.', bridgeThoughts: ['Rest is recovery.', 'I do better when I refill.'], endingThought: 'Rest is the foundation of everything else.', difficulty: 2, themes: ['rest'] },
  { id: 'e-4', startingThought: 'I have to push through.', bridgeThoughts: ['Pushing isn\u2019t the only gear.', 'Pause is also movement.'], endingThought: 'Pushing through is not the only option.', difficulty: 2, themes: ['pace'] },
  { id: 'e-5', startingThought: 'My body is letting me down.', bridgeThoughts: ['My body is loyal.', 'It\u2019s telling me what it needs.'], endingThought: 'My body is telling me something.', difficulty: 2, themes: ['body'] },
  { id: 'e-6', startingThought: 'I don\u2019t have time to rest.', bridgeThoughts: ['Skipping rest costs more.', 'Rest gives time back.'], endingThought: 'I don\u2019t have time not to rest.', difficulty: 2, themes: ['rest'] },
  { id: 'e-7', startingThought: 'I\u2019ll rest when I\u2019m done.', bridgeThoughts: ['Done doesn\u2019t arrive that way.', 'Rest is what makes done possible.'], endingThought: 'Done doesn\u2019t come if I never rest.', difficulty: 2, themes: ['rest'] },
  { id: 'e-8', startingThought: 'I\u2019m not doing enough.', bridgeThoughts: ['Being is also work.', 'My presence counts.'], endingThought: 'Doing isn\u2019t the only kind of work.', difficulty: 1, themes: ['presence'] },
  { id: 'e-9', startingThought: 'I have to earn my rest.', bridgeThoughts: ['Rest is not a reward.', 'It\u2019s a need.'], endingThought: 'Rest is mine to claim.', difficulty: 2, themes: ['rest'] },
  { id: 'e-10', startingThought: 'I\u2019m wasting my life.', bridgeThoughts: ['Slow is still living.', 'Life isn\u2019t the highlight reel.'], endingThought: 'Living slowly is also living.', difficulty: 3, themes: ['pace'] },
  { id: 'e-11', startingThought: 'My energy is unpredictable.', bridgeThoughts: ['Energy has rhythm.', 'I can learn it.'], endingThought: 'My energy has its own intelligence.', difficulty: 1, themes: ['body'] },
  { id: 'e-12', startingThought: 'I\u2019m broken because I get tired.', bridgeThoughts: ['Tired is human.', 'Being tired isn\u2019t a verdict.'], endingThought: 'Getting tired is being human.', difficulty: 1, themes: ['rest', 'worth'] },
];

const energySequences: GuidedSequence[] = [
  {
    id: 'energy-restorative-pause', title: 'The Restorative Pause', description: 'Three breaths, one scan, ninety seconds of stillness.', estimatedMinutes: 4,
    steps: [
      { type: 'breath', pattern: 'long-exhale', cycles: 3 },
      { type: 'reflection', prompt: 'Where in your body is tension? Where is ease?', minChars: 10 },
      { type: 'stillness', seconds: 90, label: 'Stay with the breath.' },
    ],
  },
  {
    id: 'energy-inventory', title: 'Energy Inventory', description: 'What drained you, what restored you, what your body is asking.', estimatedMinutes: 9,
    steps: [
      { type: 'state-check', prompt: 'How is Energy moving in you?' },
      { type: 'reflection', prompt: 'What drained you this week? What restored you?', minChars: 40 },
      { type: 'belief-shift', beliefId: 'e-3' },
      { type: 'current-guide-message', message: 'Listening is the first form of restoration.' },
    ],
  },
  {
    id: 'energy-ignite', title: 'The Ignite Practice', description: 'A short jolt of presence into the body.', estimatedMinutes: 6,
    steps: [
      { type: 'breath', pattern: 'ignite', cycles: 6, label: 'Quick in, brief hold, long out' },
      { type: 'current-guide-message', message: 'Presence is the spark. Not pressure.' },
      { type: 'reflection', prompt: 'One small movement your body would like right now.', minChars: 10 },
    ],
  },
];

// ────────────────────────── RELATIONSHIP ──────────────────────────
const relBeliefs: Belief[] = [
  { id: 'r-1', startingThought: 'If I set a boundary they\u2019ll leave.', bridgeThoughts: ['The right people honor limits.', 'A boundary is a gift to both of us.'], endingThought: 'The ones who stay honor my limits.', difficulty: 2, themes: ['boundaries'] },
  { id: 'r-2', startingThought: 'I have to manage their feelings.', bridgeThoughts: ['I can care without carrying.', 'Their feelings are theirs.'], endingThought: 'Their feelings are theirs to hold.', difficulty: 2, themes: ['boundaries'] },
  { id: 'r-3', startingThought: 'I\u2019m too much for them.', bridgeThoughts: ['My size isn\u2019t the problem.', 'I take up space honestly.'], endingThought: 'I\u2019m allowed to take up space.', difficulty: 2, themes: ['worth'] },
  { id: 'r-4', startingThought: 'It\u2019s safer alone.', bridgeThoughts: ['Alone has a cost too.', 'Connection is worth the risk.'], endingThought: 'Connection is worth the risk.', difficulty: 3, themes: ['belonging'] },
  { id: 'r-5', startingThought: 'If they really knew me\u2026', bridgeThoughts: ['Some will stay through knowing.', 'I want the ones who stay.'], endingThought: 'The right people stay through knowing.', difficulty: 2, themes: ['belonging'] },
  { id: 'r-6', startingThought: 'I\u2019m bad at relationships.', bridgeThoughts: ['I\u2019m learning my own way.', 'Each one teaches me.'], endingThought: 'I\u2019m learning my own way of loving.', difficulty: 1, themes: ['self-trust'] },
  { id: 'r-7', startingThought: 'Conflict means we\u2019re broken.', bridgeThoughts: ['Conflict is information.', 'Repair is where love deepens.'], endingThought: 'Conflict is where repair happens.', difficulty: 2, themes: ['repair'] },
  { id: 'r-8', startingThought: 'I always pick the wrong people.', bridgeThoughts: ['I\u2019m allowed to choose again.', 'I\u2019m learning my own signals.'], endingThought: 'I\u2019m learning to pick again.', difficulty: 2, themes: ['self-trust'] },
  { id: 'r-9', startingThought: 'I have to give to be loved.', bridgeThoughts: ['Giving isn\u2019t the price.', 'I\u2019m allowed to receive.'], endingThought: 'I\u2019m allowed to receive love.', difficulty: 2, themes: ['receiving'] },
  { id: 'r-10', startingThought: 'I don\u2019t deserve to be chosen.', bridgeThoughts: ['I am chooseable.', 'Worth isn\u2019t conditional.'], endingThought: 'I\u2019m choosable as I am.', difficulty: 3, themes: ['worth'] },
  { id: 'r-11', startingThought: 'Asking is selfish.', bridgeThoughts: ['Asking is honest.', 'Honesty makes love possible.'], endingThought: 'Asking is honest.', difficulty: 1, themes: ['boundaries'] },
  { id: 'r-12', startingThought: 'I should just get over it.', bridgeThoughts: ['Time is allowed.', 'Feeling is the way through.'], endingThought: 'What I feel is allowed to take time.', difficulty: 1, themes: ['repair'] },
  { id: 'r-13', startingThought: 'They wouldn\u2019t understand.', bridgeThoughts: ['I can try anyway.', 'Understanding starts with telling.'], endingThought: 'I\u2019m allowed to try anyway.', difficulty: 2, themes: ['belonging'] },
  { id: 'r-14', startingThought: 'I\u2019m not lovable when I\u2019m like this.', bridgeThoughts: ['I am lovable in hard seasons.', 'Love doesn\u2019t wait for polished.'], endingThought: 'I\u2019m lovable as I am, even like this.', difficulty: 3, themes: ['worth'] },
  { id: 'r-15', startingThought: 'Loneliness is my fault.', bridgeThoughts: ['Loneliness is a signal.', 'It\u2019s information, not a verdict.'], endingThought: 'Loneliness is a signal, not a verdict.', difficulty: 2, themes: ['belonging'] },
];

const relSequences: GuidedSequence[] = [
  {
    id: 'rel-repair-prep', title: 'The Repair Prep', description: 'Find the words before the conversation.', estimatedMinutes: 9,
    steps: [
      { type: 'breath', pattern: 'long-exhale', cycles: 5 },
      { type: 'reflection', prompt: 'What needs to be said to whom?', minChars: 30 },
      { type: 'belief-shift', beliefId: 'r-7' },
      { type: 'reflection', prompt: 'Draft the words you\u2019d want to say. No need to send them.', minChars: 40 },
      { type: 'current-guide-message', message: 'Repair starts when you can hear yourself clearly.' },
    ],
  },
  {
    id: 'rel-boundary', title: 'The Boundary Practice', description: 'A yes that wants to become a no.', estimatedMinutes: 7,
    steps: [
      { type: 'state-check', prompt: 'How is Relationship sitting in you?' },
      { type: 'reflection', prompt: 'What\u2019s a \u201Cyes\u201D you\u2019ve been saying that wants to become a \u201Cno\u201D?', minChars: 30 },
      { type: 'belief-shift', beliefId: 'r-1' },
      { type: 'sigil-touch' },
    ],
  },
  {
    id: 'rel-belonging', title: 'The Belonging Sit', description: 'Where you feel most yourself, and who lets you.', estimatedMinutes: 6,
    steps: [
      { type: 'breath', pattern: 'box', cycles: 5 },
      { type: 'reflection', prompt: 'Where do you feel most yourself? Who lets you be that?', minChars: 30 },
      { type: 'stillness', seconds: 60 },
      { type: 'current-guide-message', message: 'That\u2019s your belonging. Notice where it already lives.' },
    ],
  },
];

// ────────────────────────── HEALTH ──────────────────────────
const healthBeliefs: Belief[] = [
  { id: 'h-1', startingThought: 'My body is the enemy.', bridgeThoughts: ['My body is on my side.', 'It\u2019s been carrying me.'], endingThought: 'My body is my home.', difficulty: 3, themes: ['body'] },
  { id: 'h-2', startingThought: 'I\u2019m too broken to heal.', bridgeThoughts: ['Healing is incremental.', 'I\u2019ve healed before.'], endingThought: 'Healing is slow and possible.', difficulty: 3, themes: ['healing'] },
  { id: 'h-3', startingThought: 'I should be over this by now.', bridgeThoughts: ['Healing has its own clock.', 'I\u2019m not behind.'], endingThought: 'Healing has its own clock.', difficulty: 2, themes: ['pace'] },
  { id: 'h-4', startingThought: 'If I rest, things will get worse.', bridgeThoughts: ['Rest is repair.', 'My body needs it.'], endingThought: 'Rest is part of healing.', difficulty: 2, themes: ['rest'] },
  { id: 'h-5', startingThought: 'My symptoms mean I\u2019m failing.', bridgeThoughts: ['Symptoms are messages.', 'My body is talking.'], endingThought: 'My symptoms are information.', difficulty: 2, themes: ['body'] },
  { id: 'h-6', startingThought: 'I have to push through pain.', bridgeThoughts: ['Pain is asking for attention.', 'Listening is wiser than forcing.'], endingThought: 'Pain is asking me something.', difficulty: 2, themes: ['listening'] },
  { id: 'h-7', startingThought: 'I don\u2019t deserve to feel good.', bridgeThoughts: ['Ease is allowed.', 'It\u2019s the body\u2019s default.'], endingThought: 'Ease is my birthright.', difficulty: 2, themes: ['worth'] },
  { id: 'h-8', startingThought: 'I\u2019m only my body when it works.', bridgeThoughts: ['I am whole even now.', 'My body and I are still us.'], endingThought: 'I am whole even now.', difficulty: 3, themes: ['wholeness'] },
  { id: 'h-9', startingThought: 'Other people heal faster than me.', bridgeThoughts: ['My pace is mine.', 'Comparison is its own ache.'], endingThought: 'My pace is mine.', difficulty: 1, themes: ['pace'] },
  { id: 'h-10', startingThought: 'I\u2019m a burden because of my health.', bridgeThoughts: ['My needs are needs.', 'Care goes both ways.'], endingThought: 'My needs are allowed to be needs.', difficulty: 3, themes: ['worth'] },
  { id: 'h-11', startingThought: 'If I admit I\u2019m tired I\u2019ll fall apart.', bridgeThoughts: ['Admitting is the start of repair.', 'Honesty steadies me.'], endingThought: 'Admitting is the start of repair.', difficulty: 2, themes: ['honesty'] },
  { id: 'h-12', startingThought: 'My body has betrayed me.', bridgeThoughts: ['My body is trying.', 'It\u2019s doing slow, brilliant work.'], endingThought: 'My body is trying.', difficulty: 3, themes: ['body'] },
];

const healthSequences: GuidedSequence[] = [
  {
    id: 'health-body-listening', title: 'The Body Listening', description: 'Crown to feet, slowly. What is the body saying?', estimatedMinutes: 6,
    steps: [
      { type: 'breath', pattern: 'long-exhale', cycles: 3 },
      { type: 'reflection', prompt: 'Start at the crown. Move slowly down. What\u2019s tight? What\u2019s ease? What\u2019s asking to be felt?', minChars: 30 },
      { type: 'current-guide-message', message: 'You don\u2019t have to fix what you find. You just have to hear it.' },
      { type: 'sigil-touch' },
    ],
  },
  {
    id: 'health-symptom-sit', title: 'The Symptom Sit', description: 'Meet the loudest sensation without arguing with it.', estimatedMinutes: 9,
    steps: [
      { type: 'breath', pattern: 'box', cycles: 5 },
      { type: 'reflection', prompt: 'What symptom or sensation is loudest right now?', minChars: 20 },
      { type: 'belief-shift', beliefId: 'h-5' },
      { type: 'reflection', prompt: 'What might it be asking for?', minChars: 20 },
    ],
  },
  {
    id: 'health-wholeness', title: 'The Wholeness Practice', description: 'Read it aloud, or quietly to yourself.', estimatedMinutes: 5,
    steps: [
      { type: 'breath', pattern: 'long-exhale', cycles: 4 },
      { type: 'declarative-read', lines: [
        'I am whole. Even now.',
        'My body is doing the slow work it knows how to do.',
        'I trust what\u2019s happening underneath.',
      ] },
      { type: 'sigil-touch' },
    ],
  },
];

// ────────────────────────── REGISTRY ──────────────────────────
export const CURRENT_SPECS: Record<DomainKey, CurrentSpec> = {
  money: {
    slug: 'money', shortName: 'Money', tagline: 'Receive freely. Release the grip. Let it flow.', symbol: '💰', sigilBase: 'spiral',
    heroFraming: 'This is the territory of what flows in and what gets gripped tight. Sit with it. Notice what\u2019s true today. You don\u2019t have to fix anything.',
    emptyState: 'This is the territory of what flows in and what gets gripped tight. Sit with it. Notice what\u2019s true today. You don\u2019t have to fix anything.',
    voiceVocabulary: ['receive', 'allow', 'let in', 'soften', 'flow'],
    voiceAvoid: ['manifest', 'attract', 'wealth mindset'],
    patternMirrorAngle: 'You sat with Money {n} times this week. You started {lowState} more often than {highState}. The belief that landed was: {belief}.',
    beliefs: moneyBeliefs, sequences: moneySequences,
  },
  self: {
    slug: 'self', shortName: 'Self', tagline: 'Know yourself. Trust yourself. Become yourself.', symbol: '🌱', sigilBase: 'concentric',
    heroFraming: 'This is the current that runs beneath the others. When it\u2019s flowing, the rest follow. When it\u2019s blocked, everything else gets harder. Sit with it. It already knows you.',
    emptyState: 'You\u2019re here. That\u2019s the beginning. This current is about the slow work of meeting yourself, again and again. Start anywhere \u2014 there\u2019s no wrong door.',
    voiceVocabulary: ['becoming', 'worth', 'trust', 'integrity', 'voice'],
    voiceAvoid: ['authentic self', 'true self', 'self-love'],
    patternMirrorAngle: 'You returned to Self {n} times this week. You\u2019re working on {theme}. The current is softening \u2014 or it\u2019s still tight. Either is okay.',
    beliefs: selfBeliefs, sequences: selfSequences,
  },
  energy: {
    slug: 'energy', shortName: 'Energy', tagline: 'Restore. Sustain. Ignite.', symbol: '⚡', sigilBase: 'wave',
    heroFraming: 'Energy isn\u2019t a metric. It\u2019s a felt sense of aliveness. This current is where you listen to what depletes you, restore what\u2019s missing, and find the way back into your body.',
    emptyState: 'This is the current of what your body is asking for. Sit with it. Listen. You don\u2019t have to push anything yet \u2014 just notice.',
    voiceVocabulary: ['restore', 'soften', 'presence', 'body', 'listen'],
    voiceAvoid: ['productive', 'optimize', 'biohack'],
    patternMirrorAngle: 'You returned to Energy {n} times this week. You were {dominantState} most. Most returns came {timePattern}.',
    beliefs: energyBeliefs, sequences: energySequences,
  },
  relationships: {
    slug: 'relationships', shortName: 'Relationship', tagline: 'Connect. Repair. Deepen.', symbol: '🤝', sigilBase: 'venn',
    heroFraming: 'Every relationship has a current. This is where you feel into yours \u2014 what\u2019s flowing, what\u2019s blocked, what\u2019s asking for repair. You can\u2019t fix another person here. You can only soften your own water.',
    emptyState: 'This is the current of being with. Sit here. The work is rarely loud \u2014 it\u2019s mostly the quiet of choosing connection one moment at a time.',
    voiceVocabulary: ['feel into', 'notice', 'soften', 'return to yourself'],
    voiceAvoid: ['communication skills', 'relationship hacks'],
    patternMirrorAngle: 'You returned to Relationship {n} times this week. The thread that kept showing up was {theme}. You moved through it \u2014 or you sat with it. Both count.',
    beliefs: relBeliefs, sequences: relSequences,
  },
  health: {
    slug: 'health', shortName: 'Health', tagline: 'Listen. Restore. Honor.', symbol: '🌿', sigilBase: 'leaf',
    heroFraming: 'This current is where the body speaks and you learn to listen. Not to fix the body. Not to perfect it. To honor what it\u2019s asking for, one small moment at a time.',
    emptyState: 'This is the current of the body as a living thing \u2014 not a project, not a problem. Sit here. Listen. The body has been waiting for you.',
    voiceVocabulary: ['listen', 'honor', 'rest', 'the body', 'the slow work'],
    voiceAvoid: ['wellness', 'optimization', 'biohack', 'self-care'],
    patternMirrorAngle: 'You returned to Health {n} times this week. You started {lowState} more often than {highState}. The belief that kept coming up was {theme}.',
    beliefs: healthBeliefs, sequences: healthSequences,
    medicalSafety: true,
  },
};

export function findBelief(slug: DomainKey, beliefId: string): Belief | undefined {
  return CURRENT_SPECS[slug].beliefs.find((b) => b.id === beliefId);
}

export function findSequence(slug: DomainKey, sequenceId: string): GuidedSequence | undefined {
  return CURRENT_SPECS[slug].sequences.find((s) => s.id === sequenceId);
}
