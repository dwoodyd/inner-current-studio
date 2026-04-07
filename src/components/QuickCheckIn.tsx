import { QuickState } from '@/lib/types';
import { motion } from 'framer-motion';

interface QuickCheckInProps {
  selected?: QuickState;
  onSelect: (state: QuickState) => void;
}

const states: { value: QuickState; label: string; emoji: string }[] = [
  { value: 'tight', label: 'Tight', emoji: '◉' },
  { value: 'restless', label: 'Restless', emoji: '◈' },
  { value: 'flat', label: 'Flat', emoji: '○' },
  { value: 'open', label: 'Open', emoji: '◎' },
  { value: 'flowing', label: 'Flowing', emoji: '✦' },
];

export default function QuickCheckIn({ selected, onSelect }: QuickCheckInProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl bg-card p-3 border border-border/30">
      {states.map(({ value, label, emoji }) => {
        const isSelected = selected === value;
        return (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={`relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 px-1 transition-colors ${
              isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
            }`}
            aria-label={`Check in as ${label}`}
            aria-pressed={isSelected}
          >
            {isSelected && (
              <motion.div
                layoutId="check-in-bg"
                className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className={`relative text-lg ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
              {emoji}
            </span>
            <span className={`relative text-[10px] font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
