import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAppState } from '@/lib/AppContext';

interface PremiumGateProps {
  children: ReactNode;
  domain?: string;
  feature?: string;
}

export function PremiumGate({ children, domain, feature = 'this practice' }: PremiumGateProps) {
  const navigate = useNavigate();
  const { state } = useAppState();
  const { loading, isPremium, freeCurrent } = useSubscription();
  const hasFreeCurrentAccess = domain && freeCurrent === domain;
  const hasLocalFreeCurrentAccess = domain && state.onboarding.freeCurrent === domain;

  if (isPremium || domain === 'money' || hasFreeCurrentAccess || hasLocalFreeCurrentAccess) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full bg-primary/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-5 text-center safe-top">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
        <Lock size={22} />
      </div>
      <p className="mb-2 text-xs uppercase tracking-[0.28em] text-primary/70">Premium Current</p>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Open all five Currents</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Your free Current stays open. Unlock {feature} with the lifetime founder plan ($99) — one payment, all five Currents, forever.
      </p>
      <div className="mt-7 flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={() => navigate('/profile/subscription')}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]"
        >
          <Sparkles size={16} /> View plan & unlock
        </button>
        <button
          type="button"
          onClick={() => navigate(freeCurrent ? `/${freeCurrent}` : '/currents')}
          className="min-h-[44px] text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Return to my free Current
        </button>
      </div>
    </div>
  );
}