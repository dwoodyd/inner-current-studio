import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useReadingBridge } from '@/lib/readingBridge/useReadingBridge';
import { trackBridgeEvent } from '@/lib/readingBridge/analytics';
import { useAppState } from '@/lib/AppContext';

const SESSION_THRESHOLD = 3;

/**
 * A single, dismissible card surfaced on Home after the user's third session.
 * Permanently silenced once the user selects a chapter or taps "Not reading it."
 */
export default function ReadingBridgePrompt() {
  const navigate = useNavigate();
  const { state } = useAppState();
  const { isActive, optedOut, promptDismissed, optOut } = useReadingBridge();

  const eligible =
    !isActive && !optedOut && !promptDismissed && state.checkIns.length >= SESSION_THRESHOLD;

  useEffect(() => {
    if (eligible) trackBridgeEvent('bridge_prompt_shown', { checkIns: state.checkIns.length });
  }, [eligible, state.checkIns.length]);

  if (!eligible) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="soul-glass rounded-2xl border border-primary/15 p-4"
      role="region"
      aria-labelledby="rb-prompt-title"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
          aria-hidden="true"
        >
          <BookOpen size={15} className="text-primary" strokeWidth={1.5} />
        </div>
        <div className="flex-1 space-y-1.5 min-w-0">
          <p id="rb-prompt-title" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
            Reading Bridge
          </p>
          <p className="text-sm text-foreground leading-snug">
            Reading <em className="italic">Before the Words</em>? Tell us where you are and we'll hold that alongside your practice.
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => navigate('/reading-bridge')}
          className="flex-1 min-h-[44px] rounded-xl bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Set my chapter
        </button>
        <button
          type="button"
          onClick={optOut}
          className="flex-1 min-h-[44px] rounded-xl border border-border/40 bg-card/40 px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Not reading it
        </button>
      </div>
    </motion.aside>
  );
}
