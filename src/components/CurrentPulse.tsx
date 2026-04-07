import { motion } from 'framer-motion';
import { QuickState } from '@/lib/types';

interface CurrentPulseProps {
  quickState?: QuickState;
}

const stateColors: Record<QuickState, { inner: string; outer: string; glow: string }> = {
  tight: { inner: 'bg-soul-dim/60', outer: 'border-soul-dim/40', glow: '' },
  restless: { inner: 'bg-soul-blue/50', outer: 'border-soul-blue/30', glow: '' },
  flat: { inner: 'bg-muted/60', outer: 'border-muted-foreground/20', glow: '' },
  open: { inner: 'bg-soul-violet/50', outer: 'border-soul-violet/40', glow: 'soul-glow-violet' },
  flowing: { inner: 'bg-soul-gold/50', outer: 'border-soul-gold/40', glow: 'soul-glow-gold' },
};

const stateLabels: Record<QuickState, string> = {
  tight: 'Contracted',
  restless: 'Restless',
  flat: 'Still',
  open: 'Opening',
  flowing: 'Flowing',
};

export default function CurrentPulse({ quickState = 'flat' }: CurrentPulseProps) {
  const colors = stateColors[quickState];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative flex items-center justify-center ${colors.glow}`}>
        {/* Outer ring */}
        <motion.div
          className={`absolute h-32 w-32 rounded-full border-2 ${colors.outer} opacity-40`}
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Inner orb */}
        <motion.div
          className={`h-24 w-24 rounded-full ${colors.inner} backdrop-blur-sm`}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Center dot */}
        <div className="absolute h-3 w-3 rounded-full bg-primary/60" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{stateLabels[quickState]}</p>
    </div>
  );
}
