import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Loader2, RefreshCw, ShieldAlert, Users, Activity, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAdmin } from '@/hooks/useAdmin';
import { fetchAllBridgeEvents, fetchAllBridgeStates, type RemoteEventRow } from '@/lib/readingBridge/sync';
import { CHAPTERS } from '@/lib/readingBridge/config';
import type { ChapterProgressEntry } from '@/lib/readingBridge/useReadingBridge';

interface StateRow {
  user_id: string;
  chapter: string | null;
  opted_out: boolean;
  prompt_dismissed: boolean;
  progress: ChapterProgressEntry[];
  updated_at: string;
}

const EVENT_LABELS: Record<string, string> = {
  bridge_opened: 'Opened bridge',
  bridge_chapter_selected: 'Chapter selected',
  bridge_opted_out: 'Opted out',
  bridge_prompt_shown: 'Prompt shown',
  bridge_prompt_dismissed: 'Prompt dismissed',
  bridge_note_shown: 'Note shown',
  bridge_note_dismissed: 'Note dismissed',
};

const CHAPTER_LABEL: Record<string, string> = Object.fromEntries(CHAPTERS.map((c) => [c.id, c.shortLabel]));

export default function AdminReadingBridge() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [events, setEvents] = useState<RemoteEventRow[]>([]);
  const [states, setStates] = useState<StateRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [evts, sts] = await Promise.all([fetchAllBridgeEvents(2000), fetchAllBridgeStates()]);
      setEvents(evts);
      setStates(sts as StateRow[]);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAdmin) void load(); }, [isAdmin]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) counts[e.event] = (counts[e.event] ?? 0) + 1;
    const uniqueUsers = new Set(events.map((e) => e.user_id)).size;

    // Drop-off: users who saw a prompt but never selected a chapter.
    const promptedUsers = new Set(
      events.filter((e) => e.event === 'bridge_prompt_shown').map((e) => e.user_id),
    );
    const selectedUsers = new Set(
      events.filter((e) => e.event === 'bridge_chapter_selected').map((e) => e.user_id),
    );
    const droppedAfterPrompt = [...promptedUsers].filter((u) => !selectedUsers.has(u)).length;
    const conversionRate = promptedUsers.size
      ? Math.round((selectedUsers.size / promptedUsers.size) * 100)
      : 0;

    // Chapter distribution from current state rows.
    const byChapter: Record<string, number> = {};
    for (const s of states) {
      if (!s.chapter) continue;
      byChapter[s.chapter] = (byChapter[s.chapter] ?? 0) + 1;
    }

    // Dormant readers: active chapter, lastAt > 7d ago, not "finished".
    const now = Date.now();
    const dormant = states.filter((s) => {
      if (!s.chapter || s.chapter === 'finished' || s.opted_out) return false;
      const entry = s.progress?.find?.((p) => p.chapter === s.chapter);
      if (!entry) return false;
      return now - entry.lastAt > 7 * 24 * 60 * 60 * 1000;
    }).length;

    return { counts, uniqueUsers, promptedUsers: promptedUsers.size, selectedUsers: selectedUsers.size, droppedAfterPrompt, conversionRate, byChapter, dormant };
  }, [events, states]);

  if (adminLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background gap-4 px-6">
        <ShieldAlert size={48} className="text-destructive/60" />
        <h1 className="font-heading text-xl text-foreground">Access Denied</h1>
        <button onClick={() => navigate('/')} className="text-sm text-primary underline mt-2">Go home</button>
      </div>
    );
  }

  const sortedByChapter = CHAPTERS
    .map((c) => ({ id: c.id, label: c.shortLabel, count: stats.byChapter[c.id] ?? 0 }))
    .sort((a, b) => b.count - a.count);
  const maxCount = Math.max(1, ...sortedByChapter.map((r) => r.count));

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border/20">
        <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
          <button onClick={() => navigate('/admin')} className="p-2 -ml-2 rounded-xl hover:bg-card/60 transition-colors">
            <ArrowLeft size={20} className="text-foreground/70" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            <h1 className="font-heading text-lg font-semibold text-foreground">Reading Bridge Analytics</h1>
          </div>
          <button onClick={load} disabled={loading} className="ml-auto p-2 rounded-xl hover:bg-card/60 transition-colors">
            <RefreshCw size={16} className={`text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-28">
        {/* Top-level stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Users, label: 'Unique users', value: stats.uniqueUsers },
            { icon: Activity, label: 'Events logged', value: events.length },
            { icon: BookOpen, label: 'Chapter set', value: stats.selectedUsers },
            { icon: TrendingDown, label: 'Dormant > 7d', value: stats.dormant },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="soul-glass rounded-2xl p-4 text-center"
            >
              <s.icon size={16} className="text-primary/60 mx-auto mb-2" />
              <p className="text-2xl font-heading font-semibold text-foreground">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Conversion */}
        <section className="soul-glass rounded-2xl p-4 space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60">Prompt → selection</h2>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-heading font-semibold text-foreground">{stats.conversionRate}%</span>
            <span className="text-xs text-muted-foreground">
              {stats.selectedUsers} of {stats.promptedUsers} prompted users picked a chapter · {stats.droppedAfterPrompt} dropped off
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted/20 overflow-hidden">
            <div className="h-full bg-primary/70 transition-all" style={{ width: `${stats.conversionRate}%` }} />
          </div>
        </section>

        {/* Chapter distribution */}
        <section className="soul-glass rounded-2xl p-4 space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60">Where readers are sitting</h2>
          <div className="space-y-2">
            {sortedByChapter.map((row) => (
              <div key={row.id} className="grid grid-cols-[120px_1fr_32px] items-center gap-3">
                <span className="text-xs text-muted-foreground truncate">{row.label}</span>
                <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
                  <div
                    className="h-full bg-primary/60"
                    style={{ width: `${(row.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-foreground/70 tabular-nums text-right">{row.count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Event totals */}
        <section className="soul-glass rounded-2xl p-4 space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60">Event totals</h2>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(EVENT_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-xl border border-border/20 bg-card/30 px-3 py-2">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-foreground tabular-nums">{stats.counts[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent events */}
        <section className="soul-glass rounded-2xl p-4 space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60">Recent activity</h2>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary/40" /></div>
          ) : events.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No events yet.</p>
          ) : (
            <ul className="divide-y divide-border/20">
              {events.slice(0, 40).map((e) => {
                const chapter = (e.meta?.chapter as string | undefined) ?? null;
                return (
                  <li key={e.id} className="flex items-center justify-between py-2 gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-foreground/85 truncate">
                        {EVENT_LABELS[e.event] ?? e.event}
                        {chapter && <span className="text-muted-foreground"> · {CHAPTER_LABEL[chapter] ?? chapter}</span>}
                      </p>
                      <p className="text-[10px] text-muted-foreground/55 truncate">user {e.user_id.slice(0, 8)}…</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground/60 tabular-nums">
                      {new Date(e.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
