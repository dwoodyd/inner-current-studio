import { describe, it, expect } from 'vitest';
import {
  getStateLine,
  getCurrentLine,
  CHAPTERS,
  CHAPTER_STATE_LINES,
  CHAPTER_CURRENT_LINES,
  type ChapterId,
} from '@/lib/readingBridge/config';

describe('Reading Bridge — chapter mapper', () => {
  it('returns null when chapter is missing', () => {
    expect(getStateLine(null, 'tight')).toBeNull();
    expect(getCurrentLine(null, 'money')).toBeNull();
  });

  it('returns null when the cue is missing', () => {
    expect(getStateLine('ch1', null)).toBeNull();
    expect(getStateLine('ch1', undefined)).toBeNull();
  });

  it('returns the exact state line when defined', () => {
    expect(getStateLine('ch1', 'tight')).toBe(CHAPTER_STATE_LINES.ch1.tight);
    expect(getStateLine('ch4', 'open')).toBe(CHAPTER_STATE_LINES.ch4.open);
  });

  it("falls back to the chapter's 'any' line when a state-specific entry is absent", () => {
    // ch2 only defines `any`, so any state should fall through to it.
    expect(getStateLine('ch2', 'flat')).toBe(CHAPTER_STATE_LINES.ch2.any);
    expect(getStateLine('ch2', 'open')).toBe(CHAPTER_STATE_LINES.ch2.any);
  });

  it('returns the current-specific line when defined', () => {
    expect(getCurrentLine('ch3', 'money')).toBe(CHAPTER_CURRENT_LINES.ch3.money);
    expect(getCurrentLine('ch7', 'self')).toBe(CHAPTER_CURRENT_LINES.ch7.self);
  });

  it("falls back to the chapter's 'any' current line when a current is unmapped", () => {
    // ch9 defines only `any` for currents.
    expect(getCurrentLine('ch9', 'health')).toBe(CHAPTER_CURRENT_LINES.ch9.any);
  });

  it('returns null when neither a specific nor an any line exists', () => {
    // ch1 has no current entries defined except `self`.
    expect(getCurrentLine('ch1', 'money')).toBeNull();
  });

  it('covers every declared chapter id', () => {
    const ids = CHAPTERS.map((c) => c.id as ChapterId);
    for (const id of ids) {
      expect(CHAPTER_STATE_LINES[id]).toBeDefined();
      expect(CHAPTER_CURRENT_LINES[id]).toBeDefined();
    }
  });

  it("'finished' chapter always returns a line for any state or current", () => {
    expect(getStateLine('finished', 'restless')).toBeTruthy();
    expect(getCurrentLine('finished', 'energy')).toBeTruthy();
  });
});
