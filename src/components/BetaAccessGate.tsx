import { ReactNode, useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, KeyRound, Lock, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import innerWakeIcon from '@/assets/inner-wake-logo.svg';
import {
  BETA_CODES,
  isOwnerPassword,
  isGateUnlocked,
  unlockBetaSession,
  unlockOwnerSession,
  markBetaTester,
} from '@/lib/betaAccess';

interface BetaAccessGateProps {
  children: ReactNode;
}

export function BetaAccessGate({ children }: BetaAccessGateProps) {
  const initialCode = (() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return (params.get('code') ?? '').trim();
  })();
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(() => isGateUnlocked());
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [ownerPw, setOwnerPw] = useState('');
  const [ownerRemember, setOwnerRemember] = useState(false);
  const [ownerError, setOwnerError] = useState('');

  // Auto-unlock if URL has an owner password as ?owner=
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const owner = (params.get('owner') ?? '').trim();
    const remember = params.get('remember') === '1';
    if (owner && isOwnerPassword(owner)) {
      unlockOwnerSession({ persist: remember });
      setUnlocked(true);
    }
  }, []);

  const normalizedCode = useMemo(() => code.trim().toUpperCase().replace(/\s+/g, '-'), [code]);
  const publicPath = typeof window !== 'undefined' && ['/privacy', '/terms', '/beta', '/owner'].includes(window.location.pathname);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isOwnerPassword(code)) {
      unlockOwnerSession({ persist: true });
      setUnlocked(true);
      return;
    }
    if (!BETA_CODES.includes(normalizedCode)) {
      setError('That code is not on the beta list yet.');
      return;
    }
    unlockBetaSession();
    markBetaTester();
    setUnlocked(true);
  };

  const submitOwner = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isOwnerPassword(ownerPw)) {
      setOwnerError('Incorrect password.');
      return;
    }
    unlockOwnerSession({ persist: ownerRemember });
    setUnlocked(true);
    setOwnerOpen(false);
  };

  if (unlocked || publicPath) return <>{children}</>;

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

        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => { setOwnerOpen(true); setOwnerError(''); setOwnerPw(''); setOwnerRemember(false); }}
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-primary/80 transition-colors"
          >
            <Lock className="h-3 w-3" /> Owner access
          </button>
          <Link
            to="/owner"
            className="text-[11px] text-muted-foreground/50 hover:text-primary/70 transition-colors"
          >
            Open dedicated owner sign-in →
          </Link>
        </div>
      </motion.section>

      <AnimatePresence>
        {ownerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-5"
            onClick={() => setOwnerOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl border border-border/40 bg-card/95 p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setOwnerOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 text-muted-foreground/70 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <h2 className="mt-4 font-heading text-2xl font-light text-foreground">Owner access</h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Enter the owner password to bypass the beta gate on this device.
                </p>
              </div>

              <form onSubmit={submitOwner} className="mt-6 space-y-3">
                <div className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-border/40 bg-background/60 px-4">
                  <KeyRound className="h-4 w-4 shrink-0 text-primary/70" />
                  <input
                    type="password"
                    value={ownerPw}
                    onChange={(e) => { setOwnerPw(e.target.value); setOwnerError(''); }}
                    placeholder="Owner password"
                    autoFocus
                    className="min-w-0 flex-1 bg-transparent py-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                    autoComplete="current-password"
                  />
                </div>
                {ownerError && <p className="text-xs text-destructive">{ownerError}</p>}
                <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={ownerRemember}
                    onChange={(e) => setOwnerRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-border/40 bg-background/60 text-primary"
                  />
                  Trust this device (persist beyond session)
                </label>
                <button
                  type="submit"
                  className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]"
                >
                  Unlock <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-[11px] leading-relaxed text-muted-foreground/60 text-center">
                  Session-only by default. Visit <span className="text-primary/70">/owner</span> for the dedicated page.
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
