// Sync-ready backend layer for the Reading Bridge.
// Local-first: every mutation already persists to localStorage. When a user is
// signed in we *opportunistically* mirror state to `reading_bridge_state` and
// append events to `reading_bridge_events`. Failures are swallowed — the local
// copy stays the source of truth.

import { supabase } from '@/integrations/supabase/client';
import type { ChapterId } from './config';
import type { ChapterProgressEntry } from './useReadingBridge';
import type { ReadingBridgeEvent, ReadingBridgeEventRecord } from './analytics';

export interface ReadingBridgeRemoteState {
  chapter: ChapterId | null;
  opted_out: boolean;
  prompt_dismissed: boolean;
  progress: ChapterProgressEntry[];
}

async function getUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function pushBridgeState(state: ReadingBridgeRemoteState): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  try {
    await supabase.from('reading_bridge_state').upsert(
      {
        user_id: userId,
        chapter: state.chapter,
        opted_out: state.opted_out,
        prompt_dismissed: state.prompt_dismissed,
        progress: state.progress as unknown as object,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
  } catch {
    /* swallow — local copy is canonical */
  }
}

export async function pushBridgeEvent(record: ReadingBridgeEventRecord): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  try {
    await supabase.from('reading_bridge_events').insert({
      user_id: userId,
      event: record.event,
      meta: (record.meta ?? null) as unknown as object | null,
      created_at: new Date(record.ts).toISOString(),
    });
  } catch {
    /* swallow */
  }
}

export interface RemoteEventRow {
  id: string;
  user_id: string;
  event: ReadingBridgeEvent;
  meta: Record<string, unknown> | null;
  created_at: string;
}

/** Admin-only: aggregate events for the dashboard. RLS gates non-admins. */
export async function fetchAllBridgeEvents(limit = 1000): Promise<RemoteEventRow[]> {
  const { data, error } = await supabase
    .from('reading_bridge_events')
    .select('id, user_id, event, meta, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as RemoteEventRow[];
}

export async function fetchAllBridgeStates(): Promise<Array<{
  user_id: string;
  chapter: ChapterId | null;
  opted_out: boolean;
  prompt_dismissed: boolean;
  progress: ChapterProgressEntry[];
  updated_at: string;
}>> {
  const { data, error } = await supabase
    .from('reading_bridge_state')
    .select('user_id, chapter, opted_out, prompt_dismissed, progress, updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Array<{
    user_id: string;
    chapter: ChapterId | null;
    opted_out: boolean;
    prompt_dismissed: boolean;
    progress: ChapterProgressEntry[];
    updated_at: string;
  }>;
}
