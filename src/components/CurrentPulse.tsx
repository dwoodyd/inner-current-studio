import React from 'react';
import { motion } from 'framer-motion';
import { QuickState } from '@/lib/types';

interface CurrentPulseProps {
  quickState?: QuickState;
}

const stateColors: Record<QuickState, { inner: string; outer: string; glow: string; particle: string }> = {
  tight: { inner: 'bg-soul-dim/60', outer: 'border-soul-dim/40', glow: '', particle: 'bg-soul-dim/30' },
  restless: { inner: 'bg-soul-blue/50', outer: 'border-soul-blue/30', glow: '', particle: 'bg-soul-blue/20' },
  flat: { inner: 'bg-muted/60', outer: 'border-muted-foreground/20', glow: '', particle: 'bg-muted-foreground/10' },
  open: { inner: 'bg-soul-violet/50', outer: 'border-soul-violet/40', glow: 'soul-glow-violet', particle: 'bg-soul-violet/20' },
  flowing: { inner: 'bg-soul-gold/50', outer: 'border-soul-gold/40', glow: 'soul-glow-gold', particle: 'bg-primary/15' },
};

const stateLabels: Record<QuickState, string> = {
  tight: 'Contracted',
  restless: 'Restless',
  flat: 'Still',
  open: 'Opening',
  flowing: 'Flowing',
};

const breathSpeeds: Record<QuickState, number> = {
  tight: 6,
  restless: 4.5,
  flat: 5,
  open: 4,
  flowing: 3.5,
};

const CurrentPulse = React.memo(function CurrentPulse({ quickState = 'flat' }: CurrentPulseProps) {
  const colors = stateColors[quickState];
  const speed = breathSpeeds[quickState];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative flex items-center justify-center ${colors.glow}`}>
        {/* Ambient particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute h-1.5 w-1.5 rounded-full ${colors.particle}`}
            animate={{
              x: [0, Math.cos((i * Math.PI * 2) / 6) * 50, 0],
              y: [0, Math.sin((i * Math.PI * 2) / 6) * 50, 0],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: speed + 2,
              repeat: Infinity,
              delay: i * 0.8,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Outer ring */}
        <motion.div
          className={`absolute h-36 w-36 rounded-full border ${colors.outer} opacity-30`}
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: speed + 1, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Mid ring */}
        <motion.div
          className={`absolute h-28 w-28 rounded-full border ${colors.outer} opacity-20`}
          animate={{ scale: [1.05, 1, 1.05], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: speed, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />

        {/* Inner orb */}
        <motion.div
          className={`h-24 w-24 rounded-full ${colors.inner} backdrop-blur-md`}
          style={{
            background: quickState === 'flowing'
              ? 'radial-gradient(circle at 40% 35%, hsl(42 65% 58% / 0.6), hsl(35 70% 45% / 0.3))'
              : quickState === 'open'
              ? 'radial-gradient(circle at 40% 35%, hsl(265 25% 45% / 0.5), hsl(280 30% 35% / 0.2))'
              : undefined,
          }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: speed, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Center dot */}
        <motion.div
          className="absolute h-3 w-3 rounded-full bg-primary/70"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: speed - 1, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <motion.p
        key={quickState}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-medium text-muted-foreground tracking-wide"
      >
        {stateLabels[quickState]}
      </motion.p>
    </div>
  );
});

export default CurrentPulse;
