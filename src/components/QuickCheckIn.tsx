import { QuickState } from '@/lib/types';
import { motion } from 'framer-motion';
import { STATE_DEFS, STATE_ORDER } from '@/lib/states';

interface QuickCheckInProps {
  selected?: QuickState;
  onSelect: (state: QuickState) => void;
}

const emojiByState: Record<QuickState, string> = {
  tight: '◉', restless: '◈', flat: '○', open: '◎', flowing: '✦',
};

const states = STATE_ORDER.map(id => ({
  value: id,
  label: STATE_DEFS[id].label,
  emoji: emojiByState[id],
  hint: STATE_DEFS[id].tagline,
}));

// Legacy inline state list (now sourced from STATE_DEFS above):
const _unused = [
  { value: 'tight', label: 'Tight', emoji: '◉', hint: 'Contracted, holding on' },
  { value: 'restless', label: 'Restless', emoji: '◈', hint: 'Scattered, unsettled' },
  { value: 'flat', label: 'Flat', emoji: '○', hint: 'Neutral, still' },
  { value: 'open', label: 'Open', emoji: '◎', hint: 'Receptive, softening' },
  { value: 'flowing', label: 'Flowing', emoji: '✦', hint: 'Aligned, in the current' },
];

const pulseVariants: Record<QuickState, import('framer-motion').TargetAndTransition> = {
  tight: { scale: [1, 0.92, 1], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } },
  restless: { x: [0, -2, 2, -1, 1, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } },
  flat: { opacity: [0.6, 1, 0.6], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  open: { scale: [1, 1.15, 1], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
  flowing: { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
};

export default function QuickCheckIn({ selected, onSelect }: QuickCheckInProps) {
  return (
    <div className="space-y-2">
      <div className="px-1">
        <p className="text-xs text-muted-foreground font-heading italic">How does your energy feel right now?</p>
      </div>
      <div className="grid grid-cols-5 gap-1.5 rounded-2xl border border-border/30 bg-card p-1.5 sm:p-2">
        {states.map(({ value, label, emoji, hint }) => {
          const isSelected = selected === value;
          return (
            <button
              key={value}
              onClick={() => onSelect(value)}
              className={`relative flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-colors duration-150 sm:min-h-[48px] ${
                isSelected ? 'bg-primary/10' : 'hover:bg-muted/50 active:bg-muted/70'
              }`}
              aria-label={label}
              aria-pressed={isSelected}
              title={hint}
            >
              {isSelected && (
                <motion.div
                  layoutId="check-in-bg"
                  className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <motion.span
                className={`relative text-lg leading-none ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
                animate={isSelected ? pulseVariants[value] : {}}
              >
                {emoji}
              </motion.span>
              <span className={`relative text-[11px] font-medium leading-none ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
      {selected && (
        <motion.p
          key={selected}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-muted-foreground/70 text-center italic"
        >
          {states.find(s => s.value === selected)?.hint}
        </motion.p>
      )}
    </div>
  );
}
