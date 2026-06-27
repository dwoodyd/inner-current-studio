// Reading Bridge — static config for the optional book companion feature.
// Maps chapters of *Before the Words* to felt-states and Currents, plus the
// quiet contextual copy surfaced when a connection is real.
//
// Empty cells in the matrices mean: produce no line for that combination.

import type { QuickState } from '@/lib/types';
import type { DomainKey } from '@/lib/domains';

export type ChapterId =
  | 'intro'
  | 'ch1'
  | 'ch2'
  | 'ch3'
  | 'ch4'
  | 'ch5'
  | 'ch6'
  | 'ch7'
  | 'ch8'
  | 'ch9'
  | 'bonus'
  | 'finished';

export interface Chapter {
  id: ChapterId;
  label: string;
  shortLabel: string;
}

export const CHAPTERS: Chapter[] = [
  { id: 'intro',    label: 'Introduction: The Layer Before',    shortLabel: 'Introduction' },
  { id: 'ch1',      label: 'Chapter 1: Before the Words',       shortLabel: 'Chapter 1' },
  { id: 'ch2',      label: 'Chapter 2: The State You Enter',    shortLabel: 'Chapter 2' },
  { id: 'ch3',      label: 'Chapter 3: When Prayer Starts in Lack', shortLabel: 'Chapter 3' },
  { id: 'ch4',      label: 'Chapter 4: Thanking God From There', shortLabel: 'Chapter 4' },
  { id: 'ch5',      label: 'Chapter 5: Words With Weight',      shortLabel: 'Chapter 5' },
  { id: 'ch6',      label: 'Chapter 6: The Formation Line',     shortLabel: 'Chapter 6' },
  { id: 'ch7',      label: 'Chapter 7: Living as Heard',        shortLabel: 'Chapter 7' },
  { id: 'ch8',      label: 'Chapter 8: Returning to the Ground', shortLabel: 'Chapter 8' },
  { id: 'ch9',      label: 'Chapter 9: Closing the Gap',        shortLabel: 'Chapter 9' },
  { id: 'bonus',    label: 'Bonus: A Daily Practice for Entering the Ground', shortLabel: 'Daily Practice' },
  { id: 'finished', label: 'Finished the book ✓',                shortLabel: 'Finished' },
];

// Felt-state lines per chapter. Missing keys = no line.
type StateLines = Partial<Record<QuickState | 'any', string>>;
type CurrentLines = Partial<Record<DomainKey | 'any', string>>;

export const CHAPTER_STATE_LINES: Record<ChapterId, StateLines> = {
  intro: {
    flat: "The Introduction names what you're in right now. The layer before the words is where the work actually lives.",
    restless: "The book you're reading starts here — in the exhaustion of doing everything right and still not landing. You're in the right place.",
  },
  ch1: {
    tight: "Chapter 1 is about what you're carrying before you speak. Tight is that posture. The practice today works at that level.",
    restless: "You're reading about the orientation underneath the words. Restless is what it feels like when that orientation hasn't settled yet.",
  },
  ch2: {
    any: "Chapter 2 is about the state you just named. You're practicing what the book is teaching in real time.",
  },
  ch3: {
    tight: "You're reading the chapter about praying from lack. Tight is that posture. Today's practice is about what it feels like to approach from somewhere else.",
    restless: "Chapter 3 names the restlessness of striving without ground. The practice today gives you ground.",
  },
  ch4: {
    flat: "Chapter 4 is about what gratitude feels like when it comes from flat. The book doesn't skip past that — it starts there.",
    open: "You're reading about the gratitude posture. Open is what it produces when it's real. Stay here.",
  },
  ch5: {
    tight: "Chapter 5 is about the words that come out of tight. The practice today is about the ground those words come from.",
    flowing: "You're reading about words from settled ground. Flowing is what that sounds like. Stay in it.",
  },
  ch6: {
    flat: "Chapter 6 is about what happens when flat is the pattern, not just today's feeling. The practice is one return in the right direction.",
    restless: "Chapter 6 names restless as a formation pattern — not a passing feeling. The return is the work.",
  },
  ch7: {
    tight: "Chapter 7 is about the move out of tight — living as someone who is already heard. The practice today is a step in that direction.",
    open: "You're reading about what Open becomes when it's fully inhabited. This is the chapter for where you are.",
    flowing: "Chapter 7 describes what you're in right now — living as heard. Stay in it and let the practice deepen it.",
  },
  ch8: {
    restless: "Chapter 8 is about exactly where you are — drifted, restless, not quite back yet. The return is the practice. This is it.",
    flat: "You're reading the return chapter. Flat after drift is the normal pattern. The practice today is one movement back toward the ground.",
  },
  ch9: {
    open: "You're in the chapter about closing the gap. Open is the orientation that makes it possible. Stay here.",
    flowing: "Chapter 9 describes what you're experiencing right now — the gap narrowing. Let the practice hold it.",
  },
  bonus: {
    any: "You're in the daily practice section of the book. What you're doing here is the same practice from a different angle. They belong together.",
  },
  finished: {
    any: "You finished the book. The practice continues here.",
  },
};

export const CHAPTER_CURRENT_LINES: Record<ChapterId, CurrentLines> = {
  intro: {
    self: "The Introduction speaks directly to what the Self current keeps surfacing. Worth sitting with.",
  },
  ch1: {
    self: "Chapter 1 is foundational to the Self current — the posture beneath who you are before you perform anything.",
  },
  ch2: {
    any: "Chapter 2 is about the state you enter — and every current is shaped by it. Worth re-reading alongside today's practice.",
  },
  ch3: {
    money: "Chapter 3 speaks directly to the scarcity that lives in the Money current. Worth sitting with alongside your practice today.",
    self: "Chapter 3 also names a Self current pattern — believing you're behind, not enough, overlooked.",
  },
  ch4: {
    money: "Chapter 4 — thanking from the ground before the provision arrives — touches the Money current directly.",
    self: "Chapter 4 reorients identity from scarcity to sufficiency. That's Self current work.",
    health: "Chapter 4's gratitude practice has a direct somatic effect. The Health current holds this.",
  },
  ch5: {
    relationships: "Chapter 5 speaks directly to what the Relationships current surfaces — what your words are actually carrying when they leave you.",
    self: "Chapter 5 is about self-declaration — how you speak about yourself shapes the Self current.",
  },
  ch6: {
    self: "Chapter 6 is about formation — what the Self current is really asking. Who you're becoming is shaped by what you keep occupying.",
    energy: "Chapter 6 names how habitual states either build or deplete you. That's the Energy current.",
    health: "Chapter 6 holds the somatic side of habitual states. The Health current lives here.",
  },
  ch7: {
    self: "Chapter 7 is a Self current reorientation: your identity shifts when you carry the posture of someone who is heard.",
    relationships: "Chapter 7 changes how you show up with people — less reactive, less performing, more present.",
  },
  ch8: {
    energy: "Chapter 8 is about returning to capacity — which is what the Energy current is always asking. This is the practice for it.",
    self: "Chapter 8 is the return to yourself — the Self current movement underneath everything.",
  },
  ch9: {
    any: "Chapter 9 is about the gap between what you confess and what you live from — in every area. The work you're doing today is exactly this.",
  },
  bonus: {
    any: "You're in the daily-practice section of the book. This current is one shape of that same practice.",
  },
  finished: {
    any: "You finished the book — every chapter mapping is open. Let what you read meet what you're practicing.",
  },
};

/** Returns the felt-state line for a given chapter + state, or null. */
export function getStateLine(chapter: ChapterId | null, state: QuickState | null | undefined): string | null {
  if (!chapter || !state) return null;
  const lines = CHAPTER_STATE_LINES[chapter];
  return lines[state] ?? lines.any ?? null;
}

/** Returns the post-practice current line for a given chapter + current, or null. */
export function getCurrentLine(chapter: ChapterId | null, current: DomainKey | null | undefined): string | null {
  if (!chapter || !current) return null;
  const lines = CHAPTER_CURRENT_LINES[chapter];
  return lines[current] ?? lines.any ?? null;
}
