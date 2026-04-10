import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center min-h-[30vh] gap-4 px-6"
    >
      {Icon && (
        <div className="soul-completion-ring">
          <Icon size={24} className="text-primary/60" strokeWidth={1.5} />
        </div>
      )}
      {title && (
        <h3 className="font-heading text-lg font-medium text-foreground">{title}</h3>
      )}
      <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
        {message}
      </p>
      {action && (
        <button onClick={action.onClick} className="soul-btn-primary mt-2">
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
