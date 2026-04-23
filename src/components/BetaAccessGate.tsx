import { ReactNode, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, KeyRound } from 'lucide-react';
import innerWakeIcon from '@/assets/inner-wake-icon.svg';

const STORAGE_KEY = 'iw_beta_access_v1';
const BETA_CODES = ['INNERWAKE-BETA', 'CURRENT20', 'QUIETRETURN'];

interface BetaAccessGateProps {
  children: ReactNode;
}

export function BetaAccessGate({ children }: BetaAccessGateProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'open';
    } catch {
      return false;
    }
  });

  const normalizedCode = useMemo(() => code.trim().toUpperCase().replace(/\s+/g, '-'), [code]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!BETA_CODES.includes(normalizedCode)) {
      setError('That code is not on the beta list yet.');
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, 'open');
    } catch {}
    setUnlocked(true);
  };

  if (unlocked) return <>{children}</>;

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background px-5 py-10 text-foreground safe-x safe-top">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm text-center"
      >
        <img src={innerWakeIcon} alt="Inner Wake" className="mx-auto h-20 w-20 object-contain" />
        <p className="mt-7 text-xs uppercase tracking-[0.28em] text-primary/70">Private Beta</p>
        <h1 className="mt-3 font-heading text-4xl font-light leading-tight text-foreground">Inner Wake is opening quietly.</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Early access is invite-only while the first circle tests onboarding, installability, and the five Currents.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-3 text-left">
          <label htmlFor="beta-code" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Beta access code
          </label>
          <div className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-border/40 bg-card/60 px-4 backdrop-blur">
            <KeyRound className="h-4 w-4 shrink-0 text-primary/70" />
            <input
              id="beta-code"
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                setError('');
              }}
              placeholder="Enter invite code"
              className="min-w-0 flex-1 bg-transparent py-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
              autoComplete="off"
              autoCapitalize="characters"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            type="submit"
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]"
          >
            Enter Beta <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground/70">
          Recruiting 20 early testers for gentle feedback before public launch.
        </p>
      </motion.section>
    </main>
  );
}