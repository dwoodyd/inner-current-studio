// Hook for the Reading Bridge — the optional companion-book layer.
// All preferences are local-first. They can be migrated to a profile field
// later without changing the API consumers use here.

import { useCallback, useEffect, useState } from 'react';
import type { ChapterId } from './config';
import { trackBridgeEvent } from './analytics';
import { pushBridgeState } from './sync';

const CHAPTER_KEY = 'iw_rb_chapter_v1';        // selected chapter id, or 'none' if user opted out
const PROMPT_DISMISSED_KEY = 'iw_rb_prompt_v1'; // '1' = the Home prompt has been handled
const PROGRESS_KEY = 'iw_rb_progress_v1';       // JSON timeline of chapters the user has sat with

type StoredChapter = ChapterId | 'none' | null;

export interface ChapterProgressEntry {
  chapter: ChapterId;
  firstAt: number;
  lastAt: number;
  visits: number;
}

function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch { /* ignore */ }
}

function readProgress(): ChapterProgressEntry[] {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeProgress(list: ChapterProgressEntry[]) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

function bumpProgress(id: ChapterId): ChapterProgressEntry[] {
  const list = readProgress();
  const now = Date.now();
  const existing = list.find(e => e.chapter === id);
  if (existing) {
    existing.lastAt = now;
    existing.visits += 1;
  } else {
    list.push({ chapter: id, firstAt: now, lastAt: now, visits: 1 });
  }
  writeProgress(list);
  return list;
}

export function useReadingBridge() {
  const [stored, setStored] = useState<StoredChapter>(() => read(CHAPTER_KEY) as StoredChapter);
  const [promptDismissed, setPromptDismissed] = useState<boolean>(() => read(PROMPT_DISMISSED_KEY) === '1');
  const [progress, setProgress] = useState<ChapterProgressEntry[]>(() => readProgress());

  // Stay in sync with other tabs / surfaces that mutate the same keys.
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === CHAPTER_KEY) setStored((e.newValue ?? null) as StoredChapter);
      if (e.key === PROMPT_DISMISSED_KEY) setPromptDismissed(e.newValue === '1');
      if (e.key === PROGRESS_KEY) setProgress(readProgress());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const chapter: ChapterId | null = stored && stored !== 'none' ? (stored as ChapterId) : null;
  const isActive = chapter !== null;
  const optedOut = stored === 'none';

  const setChapter = useCallback((id: ChapterId) => {
    write(CHAPTER_KEY, id);
    setStored(id);
    // Selecting a chapter implicitly resolves the prompt.
    write(PROMPT_DISMISSED_KEY, '1');
    setPromptDismissed(true);
    // Persist progress timeline + emit completion event.
    const next = bumpProgress(id);
    setProgress(next);
    trackBridgeEvent('bridge_chapter_selected', { chapter: id, visits: next.find(e => e.chapter === id)?.visits ?? 1 });
  }, []);

  const optOut = useCallback(() => {
    write(CHAPTER_KEY, 'none');
    setStored('none');
    write(PROMPT_DISMISSED_KEY, '1');
    setPromptDismissed(true);
    trackBridgeEvent('bridge_opted_out');
  }, []);

  const dismissPrompt = useCallback(() => {
    write(PROMPT_DISMISSED_KEY, '1');
    setPromptDismissed(true);
    trackBridgeEvent('bridge_prompt_dismissed');
  }, []);

  const reset = useCallback(() => {
    write(CHAPTER_KEY, null);
    setStored(null);
    write(PROMPT_DISMISSED_KEY, null);
    setPromptDismissed(false);
    writeProgress([]);
    setProgress([]);
  }, []);

  return {
    chapter,
    isActive,
    optedOut,
    promptDismissed,
    progress,
    setChapter,
    optOut,
    dismissPrompt,
    reset,
  };
}
