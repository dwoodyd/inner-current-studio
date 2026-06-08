import { ReactNode, useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, KeyRound, Lock, X } from 'lucide-react';
import { Link } from 'react-router-dom';
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
      {/* Ambient luminous backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-[120px]"
        />
        <div className="absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.05] blur-[80px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,hsl(var(--background))_75%)]" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex w-full max-w-[440px] flex-col items-center text-center"
      >
        {/* Hero orb — glass-encased */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative mb-10"
        >
          <div className="absolute inset-0 -m-8 rounded-full bg-primary/20 blur-3xl opacity-60 animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="relative h-32 w-32 rounded-full border border-foreground/10 bg-gradient-to-b from-foreground/[0.06] to-transparent p-2 backdrop-blur-2xl shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.3)]">
            <div className="h-full w-full overflow-hidden rounded-full border border-foreground/5 bg-background shadow-inner">
              <video
                src="/orb-beta.mp4"
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                preload="auto"
                aria-label="Inner Wake"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-[10px] font-medium uppercase tracking-[0.32em] text-primary/80"
        >
          Private Beta
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32 }}
          className="mt-4 font-heading text-[42px] font-light italic leading-[1.08] tracking-tight text-foreground"
        >
          Inner Wake is opening quietly.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-5 max-w-[340px] text-[15px] leading-relaxed text-muted-foreground/80"
        >
          Early access is invite-only while the first circle tests onboarding, installability, and the five Currents.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          onSubmit={submit}
          className="mt-9 w-full max-w-[320px] space-y-3"
        >
          <div className="group relative">
            <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
            <input
              id="beta-code"
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                setError('');
              }}
              placeholder="Enter invite code"
              aria-label="Beta access code"
              className="h-[52px] w-full rounded-2xl border border-foreground/10 bg-foreground/[0.03] pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none backdrop-blur-xl transition-all focus:border-primary/40 focus:bg-foreground/[0.05] focus:ring-2 focus:ring-primary/15"
              autoComplete="off"
              autoCapitalize="characters"
            />
          </div>
          {error && <p className="text-xs text-destructive text-left">{error}</p>}
          <button
            type="submit"
            className="group relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.6)] transition-all hover:shadow-[0_12px_40px_-8px_hsl(var(--primary)/0.7)] active:scale-[0.98]"
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 to-transparent opacity-50" />
            <span className="relative">Enter Beta</span>
            <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 flex flex-col items-center gap-5"
        >
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/45">
            Recruiting 20 early testers
          </p>

          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => { setOwnerOpen(true); setOwnerError(''); setOwnerPw(''); setOwnerRemember(false); }}
              className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/55 transition-colors hover:text-primary/80"
            >
              <Lock className="h-3 w-3" /> Owner Access
            </button>
            <Link
              to="/owner"
              className="text-[11px] text-muted-foreground/40 transition-colors hover:text-primary/70"
            >
              Open dedicated owner sign-in →
            </Link>
          </div>
        </motion.div>
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
