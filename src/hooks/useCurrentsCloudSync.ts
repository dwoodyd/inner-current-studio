// useCurrentsCloudSync — when a user is signed in, mirrors the local
// per-current progress to `public.current_progress` so it follows them
// across devices. Strategy: pull on auth, merge with local (max of each
// numeric/array field), push back, then push debounced updates whenever
// local progress changes.
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ALL_DOMAIN_KEYS, type DomainKey } from '@/lib/domains';
import { readAllProgress, type CurrentProgress } from '@/lib/currents/progress';

type Row = {
  user_id: string;
  slug: string;
  practices_completed: number;
  beliefs_landed_true: string[];
  beliefs_landed_alive: string[];
  sequences_completed: string[];
  current_streak: number;
  longest_streak: number;
  last_practice_date: string | null;
  first_visited_at: string | null;
  last_visited_at: string | null;
};

const KEY = (slug: DomainKey) => `iw.currentProgress.${slug}`;

function uniq(arr: string[]) { return Array.from(new Set(arr)); }
function laterIso(a: string | null, b: string | null) {
  if (!a) return b; if (!b) return a;
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}
function earlierIso(a: string | null, b: string | null) {
  if (!a) return b; if (!b) return a;
  return new Date(a).getTime() <= new Date(b).getTime() ? a : b;
}
function laterDate(a: string | null, b: string | null) {
  if (!a) return b; if (!b) return a;
  return a >= b ? a : b;
}

function merge(local: CurrentProgress, remote: Partial<Row> | null): CurrentProgress {
  if (!remote) return local;
  return {
    practicesCompleted: Math.max(local.practicesCompleted, remote.practices_completed ?? 0),
    beliefsLandedAsTrue: uniq([...(local.beliefsLandedAsTrue || []), ...(remote.beliefs_landed_true || [])]),
    beliefsLandedAsAlive: uniq([...(local.beliefsLandedAsAlive || []), ...(remote.beliefs_landed_alive || [])]),
    sequencesCompleted: uniq([...(local.sequencesCompleted || []), ...(remote.sequences_completed || [])]),
    currentStreak: Math.max(local.currentStreak, remote.current_streak ?? 0),
    longestStreak: Math.max(local.longestStreak, remote.longest_streak ?? 0),
    lastPracticeDate: laterDate(local.lastPracticeDate, remote.last_practice_date ?? null),
    firstVisitedAt: earlierIso(local.firstVisitedAt, remote.first_visited_at ?? null),
    lastVisitedAt: laterIso(local.lastVisitedAt, remote.last_visited_at ?? null),
  };
}

function toRow(userId: string, slug: DomainKey, p: CurrentProgress): Row {
  return {
    user_id: userId,
    slug,
    practices_completed: p.practicesCompleted,
    beliefs_landed_true: p.beliefsLandedAsTrue,
    beliefs_landed_alive: p.beliefsLandedAsAlive,
    sequences_completed: p.sequencesCompleted,
    current_streak: p.currentStreak,
    longest_streak: p.longestStreak,
    last_practice_date: p.lastPracticeDate,
    first_visited_at: p.firstVisitedAt,
    last_visited_at: p.lastVisitedAt,
  };
}

export function useCurrentsCloudSync() {
  const { user } = useAuth();
  const hydratedRef = useRef(false);
  const pushTimer = useRef<number | null>(null);

  // pull + merge on auth
  useEffect(() => {
    if (!user) { hydratedRef.current = false; return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('current_progress')
        .select('user_id, slug, practices_completed, beliefs_landed_true, beliefs_landed_alive, sequences_completed, current_streak, longest_streak, last_practice_date, first_visited_at, last_visited_at')
        .eq('user_id', user.id);
      if (cancelled || error) return;
      const remoteBySlug = new Map<string, Row>();
      for (const r of (data || []) as Row[]) remoteBySlug.set(r.slug, r);
      const local = readAllProgress();
      const upserts: Row[] = [];
      for (const slug of ALL_DOMAIN_KEYS) {
        const merged = merge(local[slug], remoteBySlug.get(slug) ?? null);
        try { localStorage.setItem(KEY(slug), JSON.stringify(merged)); } catch {}
        upserts.push(toRow(user.id, slug, merged));
      }
      try { window.dispatchEvent(new CustomEvent('iw:current-progress', { detail: null })); } catch {}
      await supabase.from('current_progress').upsert(upserts, { onConflict: 'user_id,slug' });
      hydratedRef.current = true;
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // debounced push on any local change
  useEffect(() => {
    if (!user) return;
    function schedule() {
      if (!hydratedRef.current) return;
      if (pushTimer.current) window.clearTimeout(pushTimer.current);
      pushTimer.current = window.setTimeout(async () => {
        if (!user) return;
        const all = readAllProgress();
        const rows = ALL_DOMAIN_KEYS.map((s) => toRow(user.id, s, all[s]));
        await supabase.from('current_progress').upsert(rows, { onConflict: 'user_id,slug' });
      }, 1200);
    }
    window.addEventListener('iw:current-progress', schedule);
    return () => {
      window.removeEventListener('iw:current-progress', schedule);
      if (pushTimer.current) window.clearTimeout(pushTimer.current);
    };
  }, [user?.id]);
}
