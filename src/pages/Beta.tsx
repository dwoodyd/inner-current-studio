import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, KeyRound, Sparkles } from 'lucide-react';
import innerWakeIcon from '@/assets/master-mark.png';

const STORAGE_KEY = 'iw_beta_access_v1';
const BETA_CODES = ['INNERWAKE-BETA', 'CURRENT20', 'QUIETRETURN'] as const;

const codeBenefits: Record<(typeof BETA_CODES)[number], string> = {
  'INNERWAKE-BETA': 'Open beta access to all five Currents.',
  CURRENT20: 'Founding-20 circle. Your feedback shapes v1.',
  QUIETRETURN: 'A soft landing. Nervous-system-friendly support.',
};

export default function Beta() {
  const [params] = useSearchParams();
  const prefilled = (params.get('code') ?? '').trim();
  const [code, setCode] = useState(prefilled);
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  const normalized = useMemo(
    () => code.trim().toUpperCase().replace(/\s+/g, '-'),
    [code],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!(BETA_CODES as readonly string[]).includes(normalized)) {
      setError('That code is not on the beta list yet.');
      return;
    }
    try { localStorage.setItem(STORAGE_KEY, 'open'); } catch {}
    setUnlocked(true);
    // Send them into the app
    window.location.href = '/welcome';
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-background text-foreground safe-x safe-top">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <section className="relative z-10 mx-auto flex max-w-md flex-col items-center px-5 pb-16 pt-14 text-center">
        <motion.img
          src={innerWakeIcon}
          alt="Inner Wake"
          className="h-20 w-20 object-contain"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        />
        <p className="mt-7 text-xs uppercase tracking-[0.28em] text-primary/70">Private Beta</p>
        <h1 className="mt-3 font-heading text-4xl font-light leading-tight">
          A soft place to come back to.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Inner Wake is opening quietly to a first circle of testers. Five gentle
          Currents — Self, Money, Energy, Relationships, Health — designed for
          your nervous system, not your to-do list.
        </p>

        <form onSubmit={submit} className="mt-8 w-full space-y-3 text-left">
          <label htmlFor="beta-code" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Beta access code
          </label>
          <div className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-border/40 bg-card/60 px-4 backdrop-blur">
            <KeyRound className="h-4 w-4 shrink-0 text-primary/70" />
            <input
              id="beta-code"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(''); }}
              placeholder="Enter invite code"
              className="min-w-0 flex-1 bg-transparent py-4 text-sm placeholder:text-muted-foreground/50 outline-none"
              autoComplete="off"
              autoCapitalize="characters"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            type="submit"
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]"
          >
            {unlocked ? 'Opening…' : 'Enter Beta'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <ul className="mt-10 w-full space-y-3 text-left text-sm text-muted-foreground">
          {[
            'Five Currents to soften, steady, and return to flow.',
            'Daily rituals shaped to your state, not a streak counter.',
            'Private, gentle, no shame loops — ever.',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Check className="h-3 w-3" />
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-10 w-full rounded-2xl border border-border/40 bg-card/40 p-5 text-left backdrop-blur">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary/70">
            <Sparkles className="h-3 w-3" /> Active beta codes
          </p>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            {BETA_CODES.map((c) => (
              <li key={c}>
                <span className="font-mono text-foreground">{c}</span>
                <span className="ml-2">— {codeBenefits[c]}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-muted-foreground/70">
          Recruiting 20 early testers for gentle feedback before public launch.
          By entering you agree to our{' '}
          <Link to="/privacy" className="underline">Privacy</Link> &{' '}
          <Link to="/terms" className="underline">Terms</Link>.
        </p>
      </section>
    </main>
  );
}
