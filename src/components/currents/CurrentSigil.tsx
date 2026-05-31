// Evolving Sigil renderer — base shape unique per Current, stage adds detail.
// Stage 1 Seed → 2 Sprout → 3 Bloom → 4 Resonance.

import { motion } from 'framer-motion';
import type { SigilBase } from '@/lib/currents/spec';
import type { SigilStage } from '@/lib/currents/progress';

interface Props {
  base: SigilBase;
  stage: SigilStage;
  size?: number;
  glow?: string;        // hsl color string
  className?: string;
}

const GOLD = 'hsl(42 65% 58%)';

export default function CurrentSigil({ base, stage, size = 160, glow = GOLD, className }: Props) {
  return (
    <motion.div
      className={className}
      style={{ width: size, height: size, position: 'relative' }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      aria-label={`Sigil — stage ${stage}`}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: -20, borderRadius: '50%',
          background: `radial-gradient(circle, ${glow.replace(')', ' / 0.18)')}, transparent 70%)`,
          filter: stage >= 3 ? 'blur(8px)' : 'blur(14px)',
        }}
      />
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ position: 'relative' }}>
        <defs>
          <radialGradient id={`sg-${base}-${stage}`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={glow} stopOpacity={stage >= 3 ? 0.9 : 0.7} />
            <stop offset="100%" stopColor={glow} stopOpacity={0.15} />
          </radialGradient>
          <filter id={`gl-${base}-${stage}`}>
            <feGaussianBlur stdDeviation={stage >= 4 ? 2.4 : 1.2} />
          </filter>
        </defs>

        {base === 'spiral' && <SpiralSigil stage={stage} glow={glow} fillId={`sg-${base}-${stage}`} />}
        {base === 'concentric' && <ConcentricSigil stage={stage} glow={glow} fillId={`sg-${base}-${stage}`} />}
        {base === 'wave' && <WaveSigil stage={stage} glow={glow} fillId={`sg-${base}-${stage}`} />}
        {base === 'venn' && <VennSigil stage={stage} glow={glow} fillId={`sg-${base}-${stage}`} />}
        {base === 'leaf' && <LeafSigil stage={stage} glow={glow} fillId={`sg-${base}-${stage}`} />}

        {stage >= 3 && Array.from({ length: stage === 4 ? 16 : 8 }).map((_, i) => {
          const angle = (i / (stage === 4 ? 16 : 8)) * Math.PI * 2;
          const r = stage === 4 ? 78 : 72;
          const cx = 100 + Math.cos(angle) * r;
          const cy = 100 + Math.sin(angle) * r;
          return <circle key={i} cx={cx} cy={cy} r={stage === 4 ? 1.8 : 1.2} fill={glow} opacity={0.7} />;
        })}
      </svg>
    </motion.div>
  );
}

function strokeW(stage: SigilStage) { return stage === 1 ? 1.2 : stage === 2 ? 1.6 : stage === 3 ? 2 : 2.4; }

function SpiralSigil({ stage, glow, fillId }: { stage: SigilStage; glow: string; fillId: string }) {
  const sw = strokeW(stage);
  return (
    <g fill="none" stroke={glow} strokeWidth={sw} strokeLinecap="round">
      <circle cx={100} cy={100} r={70} stroke={glow} strokeOpacity={0.55} />
      {stage >= 2 && <circle cx={100} cy={100} r={60} fill={`url(#${fillId})`} fillOpacity={0.18} stroke="none" />}
      <path d="M100 100 m0 -50 a50 50 0 1 1 -35 85 a35 35 0 1 1 25 -60 a20 20 0 1 1 -14 34" />
      {stage >= 4 && (
        <motion.g
          style={{ transformOrigin: '100px 100px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, ease: 'linear', repeat: Infinity }}
        >
          <circle cx={100} cy={30} r={2} fill={glow} />
          <circle cx={170} cy={100} r={1.5} fill={glow} opacity={0.7} />
          <circle cx={100} cy={170} r={2} fill={glow} />
          <circle cx={30} cy={100} r={1.5} fill={glow} opacity={0.7} />
        </motion.g>
      )}
    </g>
  );
}

function ConcentricSigil({ stage, glow, fillId }: { stage: SigilStage; glow: string; fillId: string }) {
  const sw = strokeW(stage);
  return (
    <g fill="none" stroke={glow} strokeWidth={sw} strokeLinecap="round">
      <circle cx={100} cy={100} r={70} strokeOpacity={0.55} />
      <circle cx={100} cy={100} r={32} fill={stage >= 2 ? `url(#${fillId})` : 'none'} />
      {stage >= 2 && <line x1={100} y1={68} x2={100} y2={132} />}
      {stage >= 3 && Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const x1 = 100 + Math.cos(a) * 72;
        const y1 = 100 + Math.sin(a) * 72;
        const x2 = 100 + Math.cos(a) * 88;
        const y2 = 100 + Math.sin(a) * 88;
        return <path key={i} d={`M${x1} ${y1} Q${100 + Math.cos(a) * 80} ${100 + Math.sin(a) * 80 - 6} ${x2} ${y2}`} />;
      })}
      {stage >= 4 && (
        <motion.circle cx={100} cy={100} r={48} strokeOpacity={0.45}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
          style={{ transformOrigin: '100px 100px' }}
        />
      )}
    </g>
  );
}

function WaveSigil({ stage, glow, fillId }: { stage: SigilStage; glow: string; fillId: string }) {
  const sw = strokeW(stage);
  return (
    <g fill="none" stroke={glow} strokeWidth={sw} strokeLinecap="round">
      <circle cx={100} cy={100} r={70} strokeOpacity={0.35} />
      {stage >= 2 && <circle cx={100} cy={100} r={56} fill={`url(#${fillId})`} fillOpacity={0.16} stroke="none" />}
      <path d="M30 100 Q50 70 70 100 T110 100 T150 100 T170 100" />
      {stage >= 2 && <path d="M30 118 Q55 88 80 118 T130 118 T170 118" strokeOpacity={0.7} />}
      {stage >= 3 && <circle cx={100} cy={100} r={4} fill={glow} />}
      {stage >= 4 && (
        <motion.path
          d="M30 82 Q55 52 80 82 T130 82 T170 82"
          strokeOpacity={0.65}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </g>
  );
}

function VennSigil({ stage, glow, fillId }: { stage: SigilStage; glow: string; fillId: string }) {
  const sw = strokeW(stage);
  const offset = stage === 1 ? 28 : stage === 2 ? 22 : 18;
  return (
    <g fill="none" stroke={glow} strokeWidth={sw} strokeLinecap="round">
      <circle cx={100 - offset} cy={100} r={42} fill={stage >= 2 ? `url(#${fillId})` : 'none'} fillOpacity={0.18} />
      <circle cx={100 + offset} cy={100} r={42} fill={stage >= 2 ? `url(#${fillId})` : 'none'} fillOpacity={0.18} />
      {stage >= 2 && <line x1={100 - offset} y1={100} x2={100 + offset} y2={100} strokeOpacity={0.6} />}
      {stage >= 3 && <circle cx={100} cy={100 + 30} r={36} strokeOpacity={0.55} />}
      {stage >= 4 && (
        <motion.circle cx={100} cy={100} r={6} fill={glow}
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '100px 100px' }}
        />
      )}
    </g>
  );
}

function LeafSigil({ stage, glow, fillId }: { stage: SigilStage; glow: string; fillId: string }) {
  const sw = strokeW(stage);
  return (
    <g fill="none" stroke={glow} strokeWidth={sw} strokeLinecap="round">
      <circle cx={100} cy={100} r={70} strokeOpacity={0.25} />
      <path d="M100 150 L100 90" />
      <path d="M100 90 Q80 80 85 60 Q95 70 100 90" fill={`url(#${fillId})`} fillOpacity={stage >= 2 ? 0.35 : 0.18} />
      {stage >= 2 && <path d="M100 110 Q120 100 115 80 Q105 90 100 110" fill={`url(#${fillId})`} fillOpacity={0.32} />}
      {stage >= 3 && <>
        <path d="M100 125 Q80 115 85 95 Q95 105 100 125" fill={`url(#${fillId})`} fillOpacity={0.3} />
        <path d="M100 70 Q90 55 100 40 Q110 55 100 70" fill={`url(#${fillId})`} fillOpacity={0.4} />
      </>}
      {stage >= 4 && (
        <motion.g
          style={{ transformOrigin: '100px 130px' }}
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle cx={100} cy={40} r={3} fill={glow} />
        </motion.g>
      )}
    </g>
  );
}
