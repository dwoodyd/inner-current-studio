import { motion } from 'framer-motion';

interface Props {
  progress: number;
  tier: string;
  scripts: number;
  evidence: number;
}

const stars = [
  [18, 36], [34, 18], [52, 42], [72, 24], [86, 54], [62, 72], [38, 66], [20, 82],
];

export default function ConstellationProgress({ progress, tier, scripts, evidence }: Props) {
  const lit = Math.min(stars.length, Math.max(1, Math.ceil((progress / 100) * stars.length)));

  return (
    <div className="soul-glass-elevated rounded-2xl p-5 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 20%, hsl(var(--primary) / 0.12), transparent 62%)' }} />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current tier</p>
          <h2 className="font-heading text-2xl text-foreground">{tier}</h2>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>{scripts} scripts</p>
          <p>{evidence} evidence</p>
        </div>
      </div>
      <svg viewBox="0 0 100 100" className="relative mt-3 h-36 w-full" role="img" aria-label="Scripting constellation progress">
        {stars.slice(0, lit - 1).map(([x, y], i) => {
          const [nx, ny] = stars[i + 1];
          return <line key={`${x}-${y}`} x1={x} y1={y} x2={nx} y2={ny} stroke="hsl(var(--primary) / 0.32)" strokeWidth="0.6" />;
        })}
        {stars.map(([x, y], i) => (
          <motion.circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={i < lit ? 2.2 : 1.2}
            fill={i < lit ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.28)'}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: i < lit ? 1 : 0.45, scale: 1 }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
          />
        ))}
      </svg>
      <div className="relative h-1.5 rounded-full bg-muted/40 overflow-hidden">
        <motion.div className="h-full bg-primary/70" initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 0.8 }} />
      </div>
    </div>
  );
}
