// Per-Current progress: practice count drives Sigil evolution stage,
// landed beliefs feed the Resonance/Pattern Mirror surfaces, and
// daily streaks feed the Currents hub digest + nudges.
// Local-first; can be promoted to Cloud later without changing call sites.

import { useCallback, useEffect, useState } from 'react';
import { ALL_DOMAIN_KEYS, type DomainKey } from '@/lib/domains';

export type SigilStage = 1 | 2 | 3 | 4;

export type CurrentProgress = {
  practicesCompleted: number;
  beliefsLandedAsTrue: string[];
  beliefsLandedAsAlive: string[];
  sequencesCompleted: string[];
  firstVisitedAt: string | null;
  lastVisitedAt: string | null;
  lastPracticeDate: string | null; // YYYY-MM-DD (local)
  currentStreak: number;
  longestStreak: number;
};

const EMPTY: CurrentProgress = {
  practicesCompleted: 0,
  beliefsLandedAsTrue: [],
  beliefsLandedAsAlive: [],
  sequencesCompleted: [],
  firstVisitedAt: null,
  lastVisitedAt: null,
  lastPracticeDate: null,
  currentStreak: 0,
  longestStreak: 0,
};

const KEY = (slug: DomainKey) => `iw.currentProgress.${slug}`;

function todayStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function daysBetween(a: string, b: string) {
  const da = new Date(a + 'T00:00:00').getTime();
  const db = new Date(b + 'T00:00:00').getTime();
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

function read(slug: DomainKey): CurrentProgress {
  try {
    const raw = localStorage.getItem(KEY(slug));
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch { return { ...EMPTY }; }
}

function write(slug: DomainKey, prev: CurrentProgress, next: CurrentProgress) {
  try { localStorage.setItem(KEY(slug), JSON.stringify(next)); } catch {}
  try { window.dispatchEvent(new CustomEvent('iw:current-progress', { detail: { slug } })); } catch {}
  const prevStage = stageForCount(prev.practicesCompleted);
  const nextStage = stageForCount(next.practicesCompleted);
  if (nextStage > prevStage) {
    try {
      window.dispatchEvent(new CustomEvent('iw:current-stageup', {
        detail: { slug, fromStage: prevStage, toStage: nextStage },
      }));
    } catch {}
  }
}

export function stageForCount(count: number): SigilStage {
  if (count >= 40) return 4;
  if (count >= 16) return 3;
  if (count >= 4) return 2;
  return 1;
}

// Bump practice count + update daily streak in one step.
function bumpPractice(cur: CurrentProgress): CurrentProgress {
  const today = todayStr();
  let currentStreak = cur.currentStreak;
  if (!cur.lastPracticeDate) {
    currentStreak = 1;
  } else if (cur.lastPracticeDate === today) {
    currentStreak = Math.max(1, cur.currentStreak);
  } else {
    const delta = daysBetween(cur.lastPracticeDate, today);
    currentStreak = delta === 1 ? cur.currentStreak + 1 : 1;
  }
  const longestStreak = Math.max(cur.longestStreak, currentStreak);
  const now = new Date().toISOString();
  return {
    ...cur,
    practicesCompleted: cur.practicesCompleted + 1,
    lastVisitedAt: now,
    firstVisitedAt: cur.firstVisitedAt ?? now,
    lastPracticeDate: today,
    currentStreak,
    longestStreak,
  };
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
    const next = { ...cur, firstVisitedAt: cur.firstVisitedAt ?? now, lastVisitedAt: now };
    write(slug, cur, next);
  }, [slug]);

  const recordPractice = useCallback(() => {
    const cur = read(slug);
    write(slug, cur, bumpPractice(cur));
  }, [slug]);

  const recordSequence = useCallback((sequenceId: string) => {
    const cur = read(slug);
    const bumped = bumpPractice(cur);
    write(slug, cur, {
      ...bumped,
      sequencesCompleted: cur.sequencesCompleted.includes(sequenceId)
        ? cur.sequencesCompleted
        : [...cur.sequencesCompleted, sequenceId],
    });
  }, [slug]);

  const landBelief = useCallback((beliefId: string, level: 'true' | 'alive') => {
    const cur = read(slug);
    const key = level === 'alive' ? 'beliefsLandedAsAlive' : 'beliefsLandedAsTrue';
    if (cur[key].includes(beliefId)) return;
    const bumped = bumpPractice(cur);
    write(slug, cur, { ...bumped, [key]: [...cur[key], beliefId] });
  }, [slug]);

  return { progress, stage: stageForCount(progress.practicesCompleted), touch, recordPractice, recordSequence, landBelief };
}

// Non-hook helper for shared domain components.
export function recordPracticeFor(slug: DomainKey) {
  try {
    const raw = localStorage.getItem(KEY(slug));
    const cur: CurrentProgress = raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
    const next = bumpPractice(cur);
    localStorage.setItem(KEY(slug), JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('iw:current-progress', { detail: { slug } }));
    const prevStage = stageForCount(cur.practicesCompleted);
    const nextStage = stageForCount(next.practicesCompleted);
    if (nextStage > prevStage) {
      window.dispatchEvent(new CustomEvent('iw:current-stageup', {
        detail: { slug, fromStage: prevStage, toStage: nextStage },
      }));
    }
  } catch {}
}

export function readAllProgress(): Record<DomainKey, CurrentProgress> {
  const out = {} as Record<DomainKey, CurrentProgress>;
  for (const k of ALL_DOMAIN_KEYS) out[k] = read(k);
  return out;
}

// ─────────────── Weekly digest helpers (for the hub) ───────────────
export type WeeklyDigest = {
  totalPracticesThisWeek: number;
  activeCurrents: DomainKey[];
  topCurrent: DomainKey | null;
  leastTouched: DomainKey | null;
  topStreak: { slug: DomainKey; streak: number } | null;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function computeWeeklyDigest(
  available: DomainKey[] = [...ALL_DOMAIN_KEYS],
): WeeklyDigest {
  const all = readAllProgress();
  const now = Date.now();
  let total = 0;
  const active: DomainKey[] = [];
  let top: { slug: DomainKey; n: number } | null = null;
  let least: { slug: DomainKey; last: number } | null = null;
  let topStreak: { slug: DomainKey; streak: number } | null = null;

  for (const k of available) {
    const p = all[k];
    const last = p.lastVisitedAt ? new Date(p.lastVisitedAt).getTime() : 0;
    const recent = last && now - last < WEEK_MS;
    // approximate: count practices that happened this week using lastPracticeDate
    const recentPracticed = p.lastPracticeDate && now - new Date(p.lastPracticeDate + 'T00:00:00').getTime() < WEEK_MS;
    const weekPractices = recentPracticed ? Math.min(p.practicesCompleted, p.currentStreak || 1) : 0;
    total += weekPractices;
    if (recent) active.push(k);
    if (weekPractices > 0 && (!top || weekPractices > top.n)) top = { slug: k, n: weekPractices };
    if (!least || last < least.last) least = { slug: k, last };
    if (p.currentStreak > 0 && (!topStreak || p.currentStreak > topStreak.streak)) {
      topStreak = { slug: k, streak: p.currentStreak };
    }
  }

  return {
    totalPracticesThisWeek: total,
    activeCurrents: active,
    topCurrent: top?.slug ?? null,
    leastTouched: least?.slug ?? null,
    topStreak,
  };
}

export function useWeeklyDigest(available?: DomainKey[]) {
  const [digest, setDigest] = useState<WeeklyDigest>(() => computeWeeklyDigest(available));
  useEffect(() => {
    const refresh = () => setDigest(computeWeeklyDigest(available));
    refresh();
    window.addEventListener('iw:current-progress', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('iw:current-progress', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [available?.join(',')]);
  return digest;
}
