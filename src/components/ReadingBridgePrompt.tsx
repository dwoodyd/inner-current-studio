import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useReadingBridge } from '@/lib/readingBridge/useReadingBridge';
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

  if (isActive || optedOut || promptDismissed) return null;
  if (state.checkIns.length < SESSION_THRESHOLD) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="soul-glass rounded-2xl border border-primary/15 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
          <BookOpen size={15} className="text-primary" strokeWidth={1.5} />
        </div>
        <div className="flex-1 space-y-1.5 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Reading Bridge</p>
          <p className="text-sm text-foreground leading-snug">
            Reading <em className="italic">Before the Words</em>? Tell us where you are and we'll hold that alongside your practice.
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => navigate('/reading-bridge')}
          className="flex-1 min-h-[40px] rounded-xl bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Set my chapter
        </button>
        <button
          type="button"
          onClick={optOut}
          className="flex-1 min-h-[40px] rounded-xl border border-border/40 bg-card/40 px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/10"
        >
          Not reading it
        </button>
      </div>
    </motion.div>
  );
}
