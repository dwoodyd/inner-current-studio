import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message: string;
  /** Short italic line in the app's voice, shown under the message. */
  invitation?: string;
  action?: { label: string; onClick: () => void };
}

/**
 * Empty states are invitations, not blank space — the app speaking first.
 */
export default function EmptyState({ icon: Icon, title, message, invitation, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto flex min-h-[34vh] max-w-sm flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border border-border/30 bg-card/40 px-7 py-10 text-center backdrop-blur-xl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-16 h-40 opacity-60"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.16), transparent 70%)',
        }}
      />
      <motion.div
        className="relative flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/5"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {Icon ? <Icon size={22} className="text-primary/70" strokeWidth={1.5} /> : null}
      </motion.div>

      {title && (
        <h3 className="relative font-heading text-xl font-light leading-snug text-foreground">
          {title}
        </h3>
      )}
      <p className="relative text-sm leading-relaxed text-muted-foreground">{message}</p>
      {invitation && (
        <p className="relative font-heading text-sm italic text-primary/70">{invitation}</p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="relative mt-1 min-h-[44px] rounded-2xl bg-primary px-6 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
