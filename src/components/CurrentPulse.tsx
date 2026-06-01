import React from 'react';
import { motion } from 'framer-motion';
import { QuickState } from '@/lib/types';
import { STATE_DEFS } from '@/lib/states';
import OrbVideo from '@/components/OrbVideo';


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
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      <div className={`relative grid h-36 w-36 place-items-center sm:h-44 sm:w-44 ${colors.glow}`}>
        {/* Ambient particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute h-1.5 w-1.5 rounded-full ${colors.particle}`}
            animate={{
              x: [0, Math.cos((i * Math.PI * 2) / 6) * 56, 0],
              y: [0, Math.sin((i * Math.PI * 2) / 6) * 56, 0],
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

        {/* Outer ring — concentric with orb */}
        <motion.div
          className={`absolute inset-0 rounded-full border ${colors.outer} opacity-30`}
          animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: speed + 1, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Mid ring — concentric, slightly inset */}
        <motion.div
          className={`absolute inset-2 rounded-full border ${colors.outer} opacity-20`}
          animate={{ scale: [1.04, 1, 1.04], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: speed, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />

        {/* Living orb video — fills the ring exactly */}
        <motion.div
          className="relative h-full w-full"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: speed, repeat: Infinity, ease: 'easeInOut' }}
        >
          <OrbVideo state={quickState} className="h-full w-full" />
        </motion.div>

      </div>

      <motion.div
        key={quickState}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-0.5"
      >
        <p className="text-xs font-medium tracking-wide text-foreground sm:text-sm">
          {STATE_DEFS[quickState].label}
        </p>
        <p className="text-[10px] text-muted-foreground/70 italic sm:text-[11px]">
          {STATE_DEFS[quickState].tagline}
        </p>
      </motion.div>

    </div>
  );
});

export default CurrentPulse;
