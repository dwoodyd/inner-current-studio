/**
 * BookAvailability — the one place the app invites you to the companion book.
 *
 * Calm, never salesy: a line saying the book is available now and two quiet
 * links. Reused on About, Profile, Reading Bridge (non-readers), the origin
 * gate's "no" path, and the marketing landing page.
 */
import { BookOpen, ExternalLink } from 'lucide-react';
import {
  AMAZON_BOOK_URL,
  BOOK_AUTHOR,
  BOOK_TITLE,
  SOUL_ENGINEER_BOOK_URL,
} from '@/lib/book';

interface BookAvailabilityProps {
  /** Optional line above the buttons. */
  note?: string;
  /** Compact = no icon block, tighter spacing (for inline cards). */
  compact?: boolean;
  className?: string;
}

export default function BookAvailability({ note, compact = false, className = '' }: BookAvailabilityProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-start gap-3">
        {!compact && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10">
            <BookOpen size={18} className="text-primary" strokeWidth={1.5} />
          </div>
        )}
        <div className="min-w-0 space-y-1">
          <p className="font-heading text-base text-foreground">
            <em className="italic">{BOOK_TITLE}</em> — available now
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {note ?? `by ${BOOK_AUTHOR}. Inner Wake gives you the practice; the book gives you the why.`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={SOUL_ENGINEER_BOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-4 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
        >
          Read on soulengineer.online <ExternalLink size={12} aria-hidden="true" />
        </a>
        <a
          href={AMAZON_BOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-border/40 bg-card/40 px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted/10"
        >
          Get it on Amazon <ExternalLink size={12} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
