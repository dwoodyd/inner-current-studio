import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock } from 'lucide-react';
import { useReadingBridge } from '@/lib/readingBridge/useReadingBridge';
import { trackBridgeEvent } from '@/lib/readingBridge/analytics';
import { CHAPTERS } from '@/lib/readingBridge/config';

// Tunables. Deliberately gentle: a dormant chapter must sit for a full week
// before we mention it, and a "not yet" tap quiets us for another five days.
const DORMANCY_DAYS = 7;
const SNOOZE_DAYS = 5;
const SNOOZE_KEY = 'iw_rb_reminder_snoozed_until_v1';

function readSnooze(): number {
  try { return parseInt(localStorage.getItem(SNOOZE_KEY) ?? '0', 10) || 0; } catch { return 0; }
}
function writeSnooze(ts: number) {
  try { localStorage.setItem(SNOOZE_KEY, String(ts)); } catch { /* ignore */ }
}

/**
 * A calming, non-intrusive nudge surfaced on Home when a reader picked a
 * chapter but hasn't moved forward in DORMANCY_DAYS. Used to study re-engagement
 * without being pushy: every action — open, snooze, dismiss — is a one-tap.
 */
export default function ReadingBridgeReminder() {
  const navigate = useNavigate();
  const { chapter, isActive, progress } = useReadingBridge();
  const [snoozedUntil, setSnoozedUntil] = useState<number>(() => readSnooze());

  const dormantEntry = useMemo(() => {
    if (!isActive || !chapter || chapter === 'finished') return null;
    const entry = progress.find((p) => p.chapter === chapter);
    if (!entry) return null;
    const ageMs = Date.now() - entry.lastAt;
    if (ageMs < DORMANCY_DAYS * 24 * 60 * 60 * 1000) return null;
    return entry;
  }, [isActive, chapter, progress]);

  const visible = !!dormantEntry && Date.now() > snoozedUntil;

  useEffect(() => {
    if (visible && dormantEntry) {
      trackBridgeEvent('bridge_prompt_shown', {
        surface: 'reminder',
        chapter: dormantEntry.chapter,
        days_dormant: Math.floor((Date.now() - dormantEntry.lastAt) / 86_400_000),
      });
    }
  }, [visible, dormantEntry]);

  if (!visible || !dormantEntry) return null;

  const label = CHAPTERS.find((c) => c.id === dormantEntry.chapter)?.shortLabel ?? 'your chapter';
  const days = Math.floor((Date.now() - dormantEntry.lastAt) / 86_400_000);

  const open = () => {
    trackBridgeEvent('bridge_opened', { surface: 'reminder', chapter: dormantEntry.chapter });
    navigate('/reading-bridge');
  };

  const snooze = () => {
    const until = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000;
    writeSnooze(until);
    setSnoozedUntil(until);
    trackBridgeEvent('bridge_prompt_dismissed', {
      surface: 'reminder',
      action: 'snooze',
      chapter: dormantEntry.chapter,
    });
  };

  return (
    <motion.aside
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="soul-glass rounded-2xl border border-primary/15 p-4"
      role="region"
      aria-labelledby="rb-reminder-title"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
          aria-hidden="true"
        >
          <BookOpen size={15} className="text-primary" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <p
            id="rb-reminder-title"
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60"
          >
            Still with you
          </p>
          <p className="text-sm text-foreground leading-snug">
            You're sitting in <span className="italic text-primary/85">{label}</span>. No rush — when you're ready, we'll meet you there.
          </p>
          <p className="text-[11px] text-muted-foreground/55 inline-flex items-center gap-1">
            <Clock size={10} aria-hidden="true" /> last opened {days} days ago
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={open}
          className="flex-1 min-h-[44px] rounded-xl bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Open my chapter
        </button>
        <button
          type="button"
          onClick={snooze}
          className="flex-1 min-h-[44px] rounded-xl border border-border/40 bg-card/40 px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Not yet
        </button>
      </div>
    </motion.aside>
  );
}
