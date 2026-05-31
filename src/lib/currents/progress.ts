// Per-Current progress: practice count drives Sigil evolution stage,
// landed beliefs feed the Resonance/Pattern Mirror surfaces.
// Local-first; can be promoted to Cloud later without changing call sites.

import { useCallback, useEffect, useState } from 'react';
import type { DomainKey } from '@/lib/domains';

export type SigilStage = 1 | 2 | 3 | 4;

export type CurrentProgress = {
  practicesCompleted: number;
  beliefsLandedAsTrue: string[];
  beliefsLandedAsAlive: string[];
  sequencesCompleted: string[];
  firstVisitedAt: string | null;
  lastVisitedAt: string | null;
};

const EMPTY: CurrentProgress = {
  practicesCompleted: 0,
  beliefsLandedAsTrue: [],
  beliefsLandedAsAlive: [],
  sequencesCompleted: [],
  firstVisitedAt: null,
  lastVisitedAt: null,
};

const KEY = (slug: DomainKey) => `iw.currentProgress.${slug}`;

function read(slug: DomainKey): CurrentProgress {
  try {
    const raw = localStorage.getItem(KEY(slug));
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch { return { ...EMPTY }; }
}

function write(slug: DomainKey, p: CurrentProgress) {
  try { localStorage.setItem(KEY(slug), JSON.stringify(p)); } catch {}
  try { window.dispatchEvent(new CustomEvent('iw:current-progress', { detail: { slug } })); } catch {}
}

export function stageForCount(count: number): SigilStage {
  if (count >= 40) return 4;
  if (count >= 16) return 3;
  if (count >= 4) return 2;
  return 1;
}

export function useCurrentProgress(slug: DomainKey) {
  const [progress, setProgress] = useState<CurrentProgress>(() => read(slug));

  useEffect(() => {
    setProgress(read(slug));
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail.slug === slug) setProgress(read(slug));
    };
    window.addEventListener('iw:current-progress', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('iw:current-progress', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, [slug]);

  const touch = useCallback(() => {
    const cur = read(slug);
    const now = new Date().toISOString();
    write(slug, { ...cur, firstVisitedAt: cur.firstVisitedAt ?? now, lastVisitedAt: now });
  }, [slug]);

  const recordPractice = useCallback(() => {
    const cur = read(slug);
    write(slug, { ...cur, practicesCompleted: cur.practicesCompleted + 1, lastVisitedAt: new Date().toISOString() });
  }, [slug]);

  const recordSequence = useCallback((sequenceId: string) => {
    const cur = read(slug);
    write(slug, {
      ...cur,
      practicesCompleted: cur.practicesCompleted + 1,
      sequencesCompleted: cur.sequencesCompleted.includes(sequenceId)
        ? cur.sequencesCompleted
        : [...cur.sequencesCompleted, sequenceId],
      lastVisitedAt: new Date().toISOString(),
    });
  }, [slug]);

  const landBelief = useCallback((beliefId: string, level: 'true' | 'alive') => {
    const cur = read(slug);
    const key = level === 'alive' ? 'beliefsLandedAsAlive' : 'beliefsLandedAsTrue';
    if (cur[key].includes(beliefId)) return;
    write(slug, {
      ...cur,
      [key]: [...cur[key], beliefId],
      practicesCompleted: cur.practicesCompleted + 1,
      lastVisitedAt: new Date().toISOString(),
    });
  }, [slug]);

  return { progress, stage: stageForCount(progress.practicesCompleted), touch, recordPractice, recordSequence, landBelief };
}

// Non-hook helper for shared domain components that just need to bump
// the practice counter from inside an async handler.
export function recordPracticeFor(slug: DomainKey) {
  try {
    const raw = localStorage.getItem(KEY(slug));
    const cur: CurrentProgress = raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
    const next: CurrentProgress = {
      ...cur,
      practicesCompleted: cur.practicesCompleted + 1,
      lastVisitedAt: new Date().toISOString(),
      firstVisitedAt: cur.firstVisitedAt ?? new Date().toISOString(),
    };
    localStorage.setItem(KEY(slug), JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('iw:current-progress', { detail: { slug } }));
  } catch {}
}

export function readAllProgress(): Record<DomainKey, CurrentProgress> {
  const keys: DomainKey[] = ['money', 'self', 'energy', 'relationships', 'health'];
  const out = {} as Record<DomainKey, CurrentProgress>;
  for (const k of keys) out[k] = read(k);
  return out;
}
