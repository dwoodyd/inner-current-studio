import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * StateDial — wordless check-in.
 *
 * Nearly every mood tracker demands vocabulary from people at the exact moment
 * they don't have any. This one asks you to move a weight instead: drag, tap,
 * or arrow along a track. No words are required to answer.
 *
 * The dial is generic over the number of stops so both the daily check-in
 * (5 states) and each current's check-in (6 states) share one gesture.
 */
interface StateDialProps {
  steps: number;
  /** Index of the settled value, or null when nothing has been said yet. */
  value?: number | null;
  /** Fires continuously while moving — use it to let the Orb respond live. */
  onPreview?: (index: number) => void;
  /** Fires when the weight comes to rest. */
  onCommit: (index: number) => void;
  ariaLabel?: string;
  /** Accessible names for each stop (screen readers only — never rendered). */
  stopLabels?: string[];
  className?: string;
}

export default function StateDial({
  steps,
  value = null,
  onPreview,
  onCommit,
  ariaLabel = 'Move the weight to check in',
  stopLabels,
  className = '',
}: StateDialProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState<number>(() =>
    value == null ? 0.5 : value / Math.max(1, steps - 1)
  );
  const [dragging, setDragging] = useState(false);
  const lastIndex = useRef<number>(value ?? Math.round(0.5 * (steps - 1)));

  // Follow external changes (cloud sync, another surface) while at rest.
  useEffect(() => {
    if (dragging || value == null) return;
    setRatio(value / Math.max(1, steps - 1));
    lastIndex.current = value;
  }, [value, steps, dragging]);

  const indexFromRatio = useCallback(
    (r: number) => Math.round(r * (steps - 1)),
    [steps]
  );

  const ratioFromEvent = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return 0.5;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return 0.5;
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }, []);

  const move = useCallback(
    (clientX: number) => {
      const r = ratioFromEvent(clientX);
      setRatio(r);
      const i = indexFromRatio(r);
      if (i !== lastIndex.current) {
        lastIndex.current = i;
        onPreview?.(i);
      }
    },
    [ratioFromEvent, indexFromRatio, onPreview]
  );

  const settle = useCallback(() => {
    const i = lastIndex.current;
    setRatio(i / Math.max(1, steps - 1));
    setDragging(false);
    onCommit(i);
  }, [steps, onCommit]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragging(true);
    move(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    move(e.clientX);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const current = lastIndex.current;
    let next = current;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(0, current - 1);
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(steps - 1, current + 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = steps - 1;
    else return;
    e.preventDefault();
    lastIndex.current = next;
    setRatio(next / Math.max(1, steps - 1));
    onPreview?.(next);
    onCommit(next);
  };

  const activeIndex = indexFromRatio(ratio);
  // The weight gains presence as it travels toward the open end.
  const beadSize = 20 + ratio * 12;

  return (
    <div className={`select-none ${className}`}>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={steps - 1}
        aria-valuenow={activeIndex}
        aria-valuetext={stopLabels?.[activeIndex]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={settle}
        onPointerCancel={settle}
        onKeyDown={handleKeyDown}
        className="relative h-14 w-full cursor-grab touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:cursor-grabbing"
      >
        {/* Track */}
        <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-muted/70">
          <div
            className="h-full rounded-full transition-[width] duration-150"
            style={{
              width: `${ratio * 100}%`,
              background:
                'linear-gradient(90deg, hsl(var(--field-h) var(--field-s) 45% / 0.35), hsl(var(--field-h) var(--field-s) 62% / 0.85))',
            }}
          />
        </div>

        {/* Stops — geometry, not vocabulary */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between">
          {Array.from({ length: steps }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full transition-colors duration-200"
              style={{
                background:
                  i <= activeIndex
                    ? 'hsl(var(--field-h) var(--field-s) 62% / 0.7)'
                    : 'hsl(var(--muted-foreground) / 0.35)',
              }}
            />
          ))}
        </div>

        {/* The weight */}
        <motion.div
          className="pointer-events-none absolute top-1/2 rounded-full"
          animate={{
            left: `${ratio * 100}%`,
            width: beadSize,
            height: beadSize,
            scale: dragging ? 1.08 : 1,
          }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          style={{
            translateX: '-50%',
            translateY: '-50%',
            background:
              'radial-gradient(circle at 32% 30%, hsl(var(--field-h) var(--field-s) 78%), hsl(var(--field-h) var(--field-s) 46%))',
            boxShadow:
              '0 0 0 1px hsl(var(--field-h) var(--field-s) 70% / 0.35), 0 0 26px hsl(var(--field-h) var(--field-s) 60% / 0.35)',
          }}
        />
      </div>
    </div>
  );
}
