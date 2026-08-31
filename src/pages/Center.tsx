/**
 * /center — the ten-second center.
 *
 * Rules for this page: it starts instantly, needs no account, and carries
 * nothing else. A ten-second practice has to be reachable in under ten
 * seconds, so there is no intro, no nav, no copy to read before it begins.
 * Haptics mark the inhale / hold / exhale boundaries so the practice works
 * with the screen dark and the phone face-down.
 *
 * It doubles as the iOS home-screen / shortcut surface: safe-area aware,
 * no rubber-band scroll, screen kept awake for the breath, and a standalone
 * launch never shows browser chrome affordances it can't honour.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type Phase = 'in' | 'hold' | 'out' | 'done';

const SEQUENCE: Array<{ phase: Phase; ms: number; buzz: number | number[] }> = [
  { phase: 'in', ms: 4000, buzz: 18 },
  { phase: 'hold', ms: 2000, buzz: 10 },
  { phase: 'out', ms: 4000, buzz: [14, 60, 14] },
];

const STORE_KEY = 'iw_center_count';

function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* haptics are a bonus, never a requirement */
  }
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

const PHASE_LABEL: Record<Phase, string> = {
  in: 'Breathing in',
  hold: 'Holding',
  out: 'Letting go',
  done: 'Complete',
};

export default function Center() {
  const [phase, setPhase] = useState<Phase>('in');
  const [round, setRound] = useState(0);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const standalone = useRef(isStandalone()).current;

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const run = useCallback(() => {
    clear();
    let at = 0;
    SEQUENCE.forEach((step) => {
      timers.current.push(
        setTimeout(() => {
          setPhase(step.phase);
          buzz(step.buzz);
        }, at),
      );
      at += step.ms;
    });
    timers.current.push(
      setTimeout(() => {
        setPhase('done');
        try {
          const n = Number(localStorage.getItem(STORE_KEY) || '0') + 1;
          localStorage.setItem(STORE_KEY, String(n));
        } catch {
          /* private mode — the breath still counted */
        }
      }, at),
    );
  }, []);

  useEffect(() => {
    run();
    return clear;
  }, [run, round]);

  // Keep the screen awake while a breath is running (iOS 16.4+ / Android).
  useEffect(() => {
    let sentinel: { release: () => Promise<void> } | null = null;
    let cancelled = false;
    const request = async () => {
      try {
        const wl = (navigator as unknown as {
          wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> };
        }).wakeLock;
        if (!wl) return;
        const s = await wl.request('screen');
        if (cancelled) void s.release();
        else sentinel = s;
      } catch {
        /* wake lock is a bonus */
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') void request();
    };
    void request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release().catch(() => undefined);
    };
  }, []);

  // No rubber-band scroll behind the breath while this page is mounted.
  useEffect(() => {
    const prev = document.body.style.overscrollBehaviorY;
    document.body.style.overscrollBehaviorY = 'none';
    return () => {
      document.body.style.overscrollBehaviorY = prev;
    };
  }, []);

  const scale = phase === 'in' || phase === 'hold' ? 1 : phase === 'out' ? 0.42 : 0.62;
  const dur = phase === 'in' ? 4000 : phase === 'out' ? 4000 : 900;

  return (
    <main
      className="relative flex min-h-[100dvh] w-full select-none flex-col items-center justify-center overflow-hidden bg-background px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]"
      style={{ touchAction: 'manipulation' }}
      aria-label="Ten second centering breath"
    >
      {/* The field itself — no words needed to know what it is asking. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, hsl(var(--field-h) var(--field-s) 52% / 0.10), transparent 62%)',
        }}
      />

      <div
        aria-hidden="true"
        className="relative rounded-full motion-reduce:transition-none"
        style={{
          width: 220,
          height: 220,
          transform: `scale(${scale})`,
          transition: `transform ${dur}ms cubic-bezier(0.37, 0, 0.23, 1), opacity 900ms ease`,
          opacity: phase === 'done' ? 0.55 : 1,
          background:
            'radial-gradient(circle at 38% 32%, hsl(var(--field-h) var(--field-s) 72% / 0.85), hsl(var(--field-h) var(--field-s) 48% / 0.35) 58%, transparent 72%)',
          boxShadow:
            '0 0 90px hsl(var(--field-h) var(--field-s) 55% / 0.28), 0 0 180px hsl(var(--field-h) var(--field-s) 50% / 0.14)',
        }}
      />

      <div
        role="status"
        aria-live="polite"
        className="mt-12 flex min-h-[44px] flex-col items-center gap-3 text-center"
      >
        {phase === 'done' ? (
          <>
            <button
              type="button"
              onClick={() => setRound((r) => r + 1)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border px-6 text-sm text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Again
            </button>
            <Link
              to="/"
              className="inline-flex min-h-[44px] items-center px-4 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {standalone ? 'Open Inner Wake' : 'Open the full practice'}
            </Link>
          </>
        ) : (
          <span className="sr-only">{PHASE_LABEL[phase]}</span>
        )}
      </div>
    </main>
  );
}
