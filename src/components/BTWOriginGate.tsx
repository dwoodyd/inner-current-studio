import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';

const ANSWER_KEY = 'iw_btw_answer_v1';
const ORIENT_SEEN_KEY = 'iw_btw_orient_seen_v1';

type Phase = 'ask' | 'orient' | 'done';

interface BTWOriginGateProps {
  onDone: () => void;
}

/**
 * Shown once after signup, before the user first lands on Home.
 * Asks whether they came in through the companion book "Before the Words."
 * "Yes" inserts the one-time Orientation Card. Both paths end at Home.
 *
 * Stores answers in localStorage only; book-reader flag can be migrated to
 * the user profile later without changing this UI.
 */
export default function BTWOriginGate({ onDone }: BTWOriginGateProps) {
  const [phase, setPhase] = useState<Phase>('ask');

  useEffect(() => {
    try {
      const prior = localStorage.getItem(ANSWER_KEY);
      if (prior === 'yes' || prior === 'no') {
        // Already answered — skip immediately.
        onDone();
      }
    } catch {
      // ignore — keep the gate visible
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (val: 'yes' | 'no') => {
    try { localStorage.setItem(ANSWER_KEY, val); } catch {}
  };

  const choose = (val: 'yes' | 'no') => {
    persist(val);
    if (val === 'yes') {
      try {
        const seen = localStorage.getItem(ORIENT_SEEN_KEY);
        if (seen) { onDone(); return; }
      } catch {}
      setPhase('orient');
    } else {
      onDone();
    }
  };

  const finishOrient = () => {
    try { localStorage.setItem(ORIENT_SEEN_KEY, '1'); } catch {}
    onDone();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background px-5 py-12 safe-top safe-x">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[460px] w-[460px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(42 65% 58% / 0.08), transparent 70%)' }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <AnimatePresence mode="wait">
        {phase === 'ask' && (
          <motion.div
            key="ask"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm text-center space-y-8"
          >
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/60">
                Before we begin
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl text-foreground leading-tight">
                Did you find Inner Wake through the book{' '}
                <em className="italic text-soul-gold">Before the Words?</em>
              </h2>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => choose('yes')}
                className="w-full rounded-2xl border border-primary/25 bg-primary/10 py-4 min-h-[48px] text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/15 active:scale-[0.98]"
              >
                Yes, I've read it
              </button>
              <button
                onClick={() => choose('no')}
                className="w-full rounded-2xl border border-border/30 bg-card/40 py-4 min-h-[48px] text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted/10 active:scale-[0.98]"
              >
                No, I'm new here
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground/50 italic font-heading">
              Both paths arrive at the same ground.
            </p>

            {/* For the "new here" path: the book exists, and it's out now. */}
            <BookAvailability
              compact
              className="text-left"
              note="Not required — the practice stands on its own. It's here if you want the why."
            />
          </motion.div>
        )}

        {false && (
          <motion.div key="never">
            <span />
          </motion.div>
        )}

        {phase === 'orient' && (
          <motion.div
            key="orient"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md text-left space-y-6"
          >
            <div className="flex items-center gap-2 text-primary/70">
              <BookOpen size={14} />
              <span className="text-[10px] uppercase tracking-[0.22em]">Orientation</span>
            </div>
            <h2 className="font-heading text-3xl text-foreground leading-tight">
              You already know this territory.
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>The daily practice at the end of the book lives here.</p>
              <ul className="space-y-2 text-foreground/85">
                <li>
                  The <span className="text-primary">Morning Settling</span> is the Morning Awakening.
                </li>
                <li>
                  The <span className="text-primary">Evening Release</span> is the Evening Settling.
                </li>
                <li>
                  The state check-in is the practice of asking <em>"What ground am I standing on right now?"</em>
                </li>
                <li>
                  The <span className="text-primary">Alignment Wheel</span> is the formation line in motion.
                </li>
                <li>
                  Each <span className="text-primary">Current</span> is an area of life where the inner ground shapes the outcome.
                </li>
              </ul>
              <p className="font-heading italic text-foreground/90 pt-2">
                You don't need to learn Inner Wake. You need to return to it.
              </p>
            </div>
            <button
              onClick={finishOrient}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]"
            >
              Begin the practice <ArrowRight size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
