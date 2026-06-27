// Hook for the Reading Bridge — the optional companion-book layer.
// All preferences are local-first. They can be migrated to a profile field
// later without changing the API consumers use here.

import { useCallback, useEffect, useState } from 'react';
import type { ChapterId } from './config';

const CHAPTER_KEY = 'iw_rb_chapter_v1';        // selected chapter id, or 'none' if user opted out
const PROMPT_DISMISSED_KEY = 'iw_rb_prompt_v1'; // '1' = the Home prompt has been handled

type StoredChapter = ChapterId | 'none' | null;

function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch { /* ignore */ }
}

export function useReadingBridge() {
  const [stored, setStored] = useState<StoredChapter>(() => read(CHAPTER_KEY) as StoredChapter);
  const [promptDismissed, setPromptDismissed] = useState<boolean>(() => read(PROMPT_DISMISSED_KEY) === '1');

  // Stay in sync with other tabs / surfaces that mutate the same keys.
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === CHAPTER_KEY) setStored((e.newValue ?? null) as StoredChapter);
      if (e.key === PROMPT_DISMISSED_KEY) setPromptDismissed(e.newValue === '1');
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
  }, []);

  const optOut = useCallback(() => {
    write(CHAPTER_KEY, 'none');
    setStored('none');
    write(PROMPT_DISMISSED_KEY, '1');
    setPromptDismissed(true);
  }, []);

  const dismissPrompt = useCallback(() => {
    write(PROMPT_DISMISSED_KEY, '1');
    setPromptDismissed(true);
  }, []);

  const reset = useCallback(() => {
    write(CHAPTER_KEY, null);
    setStored(null);
    write(PROMPT_DISMISSED_KEY, null);
    setPromptDismissed(false);
  }, []);

  return { chapter, isActive, optedOut, promptDismissed, setChapter, optOut, dismissPrompt, reset };
}
