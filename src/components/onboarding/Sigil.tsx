import { motion } from "framer-motion";

interface SigilProps {
  seed: string; // companion name
  hue?: number;
  size?: number;
  progress?: number;
  className?: string;
}

/**
 * Generate a unique geometric sigil from a seed string. Deterministic.
 * Inspired by sacred geometry — concentric petals + a central node.
 */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Sigil({ seed, hue = 42, size = 160, progress = 0, className }: SigilProps) {
  const h = hash(seed || "current");
  const petals = 5 + (h % 6); // 5–10 petals
  const innerRing = 3 + (h % 4); // 3–6 inner nodes
  const rotation = (h % 360);
  const cx = 100, cy = 100, r = 70;
  const growth = Math.min(1, Math.max(0, progress));

  const petalPath = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    const x = cx + Math.cos(rad) * r;
    const y = cy + Math.sin(rad) * r;
    return `M ${cx} ${cy} Q ${cx + Math.cos(rad - 0.3) * r * 0.6} ${cy + Math.sin(rad - 0.3) * r * 0.6} ${x} ${y} Q ${cx + Math.cos(rad + 0.3) * r * 0.6} ${cy + Math.sin(rad + 0.3) * r * 0.6} ${cx} ${cy}`;
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      initial={{ opacity: 0, rotate: rotation - 30 }}
      animate={{ opacity: 1, rotate: rotation }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      style={{ filter: `drop-shadow(0 0 ${8 + growth * 24}px hsl(${hue} 75% 62% / ${0.2 + growth * 0.28}))` }}
    >
      <defs>
        <radialGradient id={`grad-${seed}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={`hsl(${hue} 80% 75%)`} stopOpacity="1" />
          <stop offset="60%" stopColor={`hsl(${hue} 70% 55%)`} stopOpacity="0.6" />
          <stop offset="100%" stopColor={`hsl(${hue} 60% 40%)`} stopOpacity="0" />
        </radialGradient>
        <filter id={`glow-${seed}`}>
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* outer ring */}
      <circle cx={cx} cy={cy} r={r + 12} stroke={`hsl(${hue} 60% 55% / 0.25)`} strokeWidth="0.5" fill="none" />
      <circle cx={cx} cy={cy} r={r + 6} stroke={`hsl(${hue} 70% 60% / 0.4)`} strokeWidth="0.7" fill="none" />
      <motion.circle
        cx={cx}
        cy={cy}
        r={r + 22}
        stroke={`hsl(${hue} 85% 68% / ${0.16 + growth * 0.24})`}
        strokeWidth={1 + growth * 2}
        fill="none"
        strokeDasharray={`${Math.max(8, growth * 540)} 540`}
        initial={{ rotate: -90 }}
        animate={{ rotate: 270 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* petals */}
      {Array.from({ length: petals }).map((_, i) => {
        const a = (360 / petals) * i;
        return (
          <motion.path
            key={i}
            d={petalPath(a)}
            fill={`url(#grad-${seed})`}
            opacity={0.55}
            filter={`url(#glow-${seed})`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        );
      })}

      {/* inner ring of nodes */}
      {Array.from({ length: innerRing }).map((_, i) => {
        const a = (360 / innerRing) * i + rotation;
        const rad = (a * Math.PI) / 180;
        const x = cx + Math.cos(rad) * 22;
        const y = cy + Math.sin(rad) * 22;
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="2.5"
            fill={`hsl(${hue} 90% 80%)`}
            filter={`url(#glow-${seed})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 + i * 0.1, duration: 0.5 }}
          />
        );
      })}

      {/* center */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={6 + growth * 4}
        fill={`hsl(${hue} 100% 88%)`}
        filter={`url(#glow-${seed})`}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.3, 1] }}
        transition={{ delay: 0.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.svg>
  );
}
