import { motion } from 'framer-motion';
import { BookOpen, X } from 'lucide-react';
import { useState } from 'react';
import { useReadingBridge } from '@/lib/readingBridge/useReadingBridge';
import { getStateLine, getCurrentLine } from '@/lib/readingBridge/config';
import type { QuickState } from '@/lib/types';
import type { DomainKey } from '@/lib/domains';

interface Props {
  /** When given, surfaces the felt-state line for the active chapter + this state. */
  state?: QuickState | null;
  /** When given, surfaces the post-practice current line for the active chapter + this current. */
  current?: DomainKey | null;
  /** Optional one-tap dismissal (used for the post-practice card). */
  dismissable?: boolean;
  className?: string;
}

/**
 * A muted, single-line acknowledgment that appears only when a real
 * chapter ⇄ state / chapter ⇄ current correspondence exists. Silent otherwise —
 * never advertises the book, never blocks the practice.
 */
export default function ReadingBridgeNote({ state, current, dismissable, className }: Props) {
  const { chapter, isActive } = useReadingBridge();
  const [hidden, setHidden] = useState(false);

  if (!isActive || hidden) return null;

  const line = state
    ? getStateLine(chapter, state)
    : current
      ? getCurrentLine(chapter, current)
      : null;

  if (!line) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex items-start gap-2.5 rounded-xl border border-border/30 bg-card/40 px-3.5 py-2.5 ${className ?? ''}`}
    >
      <BookOpen size={13} className="mt-[2px] shrink-0 text-primary/70" strokeWidth={1.5} />
      <p className="flex-1 text-[12px] leading-snug text-muted-foreground italic font-heading">
        {line}
      </p>
      {dismissable && (
        <button
          type="button"
          onClick={() => setHidden(true)}
          aria-label="Dismiss"
          className="-mr-1 -mt-1 rounded-full p-1 text-muted-foreground/50 hover:text-muted-foreground"
        >
          <X size={12} />
        </button>
      )}
    </motion.div>
  );
}
