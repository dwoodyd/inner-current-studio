import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import innerWakeIcon from '@/assets/inner-wake-icon.svg';
import {
  isOwnerPassword,
  unlockOwnerSession,
  isGateUnlocked,
} from '@/lib/betaAccess';

export default function OwnerAccess() {
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  // Auto-unlock if URL has ?owner=PASSWORD
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const owner = (params.get('owner') ?? '').trim();
    const rememberParam = params.get('remember') === '1';
    if (owner && isOwnerPassword(owner)) {
      unlockOwnerSession({ persist: rememberParam });
      setUnlocked(true);
      setTimeout(() => navigate('/', { replace: true }), 400);
    } else if (isGateUnlocked()) {
      setUnlocked(true);
    }
  }, [navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwnerPassword(pw)) {
      setError('Incorrect password.');
      return;
    }
    unlockOwnerSession({ persist: remember });
    setUnlocked(true);
    navigate('/', { replace: true });
  };

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
        <p className="mt-7 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.28em] text-primary/70">
          <ShieldCheck className="h-3 w-3" /> Owner Access
        </p>
        <h1 className="mt-3 font-heading text-4xl font-light leading-tight text-foreground">
          {unlocked ? 'Unlocked.' : 'Sign in privately.'}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {unlocked
            ? 'Redirecting you into the app…'
            : 'Enter the owner password to bypass the beta gate. By default, access lasts only for this browser session.'}
        </p>

        {!unlocked && (
          <form onSubmit={submit} className="mt-8 space-y-3 text-left">
            <label htmlFor="owner-pw" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Owner password
            </label>
            <div className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-border/40 bg-card/60 px-4 backdrop-blur">
              <KeyRound className="h-4 w-4 shrink-0 text-primary/70" />
              <input
                id="owner-pw"
                type="password"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(''); }}
                placeholder="Enter password"
                autoFocus
                className="min-w-0 flex-1 bg-transparent py-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}

            <label className="flex cursor-pointer items-center gap-2 pt-1 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-border/40 bg-card/60 text-primary"
              />
              Trust this device (persist beyond this session)
            </label>

            <button
              type="submit"
              className="mt-2 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]"
            >
              Unlock <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <p className="mt-6 inline-flex items-center gap-1.5 text-[11px] leading-relaxed text-muted-foreground/70">
          <Lock className="h-3 w-3" /> Session-only by default · clears when you close the tab
        </p>
      </motion.section>
    </main>
  );
}
