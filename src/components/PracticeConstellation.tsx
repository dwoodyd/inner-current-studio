import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '@/lib/AppContext';

/**
 * Practice Constellation — a quiet visual of your recent practice.
 * Replaces the numeric "resets/returns" counter.
 *
 * Counts distinct practice events from the last 7 days:
 *   check-ins, momentum sessions, wheels, gathered sequences,
 *   resistance entries, thought shifts, today-flow completions.
 *
 * Up to 12 stars light up as nodes; the rest stay faint. The shape
 * stays the same so the constellation feels stable across visits.
 */

const NODES = 12;
// Fixed positional layout (percent-of-box) — a calm, vaguely circular constellation.
const POSITIONS: { x: number; y: number }[] = [
  { x: 12, y: 24 }, { x: 28, y: 14 }, { x: 50, y: 8 },  { x: 72, y: 14 },
  { x: 88, y: 24 }, { x: 92, y: 50 }, { x: 78, y: 74 }, { x: 56, y: 86 },
  { x: 34, y: 84 }, { x: 16, y: 70 }, { x: 22, y: 48 }, { x: 64, y: 46 },
];

// Soft, low-energy connecting lines — drawn between every other node.
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
  [8, 9], [9, 0], [10, 1], [10, 11], [11, 5], [11, 7], [10, 8],
];

function within7Days(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < 7 * 86400000;
}

export default function PracticeConstellation() {
  const { state } = useAppState();

  const count = useMemo(() => {
    const c =
      state.checkIns.filter(x => within7Days(x.createdAt)).length +
      state.momentumSessions.filter(x => within7Days(x.createdAt)).length +
      state.wheels.filter(x => within7Days(x.createdAt)).length +
      state.gatheredSequences.filter(x => within7Days(x.createdAt)).length +
      state.resistanceEntries.filter(x => within7Days(x.createdAt)).length +
      state.thoughtShifts.filter(x => within7Days(x.createdAt)).length;
    return Math.min(NODES, c);
  }, [state]);

  const phrase =
    count === 0 ? 'Your constellation is waiting.' :
    count <= 3  ? 'A small constellation is forming.' :
    count <= 7  ? 'The shape is becoming clearer.' :
    count < NODES ? 'A bright constellation, steady and lit.' :
                    'A full constellation — every node alive.';

  return (
    <div className="soul-glass-elevated rounded-2xl p-5 space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="font-heading text-lg font-medium text-foreground">Practice Constellation</h3>
        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.18em]">Last 7 days</span>
      </div>

      <div className="relative w-full aspect-[2/1] mx-auto">
        <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
          {/* edges */}
          {EDGES.map(([a, b], i) => {
            const pa = POSITIONS[a], pb = POSITIONS[b];
            const lit = a < count && b < count;
            return (
              <line
                key={i}
                x1={pa.x} y1={pa.y / 2}
                x2={pb.x} y2={pb.y / 2}
                stroke={lit ? 'hsl(42 65% 58%)' : 'hsl(0 0% 60%)'}
                strokeWidth={lit ? 0.25 : 0.12}
                strokeOpacity={lit ? 0.35 : 0.12}
              />
            );
          })}
          {/* nodes */}
          {POSITIONS.map((p, i) => {
            const lit = i < count;
            return (
              <motion.circle
                key={i}
                cx={p.x}
                cy={p.y / 2}
                r={lit ? 1.1 : 0.7}
                fill={lit ? 'hsl(42 80% 65%)' : 'hsl(0 0% 80%)'}
                fillOpacity={lit ? 0.95 : 0.18}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  scale: lit ? [1, 1.25, 1] : 1,
                }}
                transition={{
                  delay: i * 0.04,
                  duration: lit ? 3.2 : 0.4,
                  repeat: lit ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                style={lit ? { filter: 'drop-shadow(0 0 1.2px hsl(42 85% 60% / 0.8))' } : undefined}
              />
            );
          })}
        </svg>
      </div>

      <p className="text-xs text-muted-foreground font-heading italic text-center">
        {phrase}
      </p>
    </div>
  );
}
