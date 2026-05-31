import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, AlertTriangle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

/**
 * Top-of-app banner reflecting the three-tier pricing structure.
 *
 * States:
 *  - Past-due payment (grace period): "Update your payment method →"
 *  - Founder window active (Day 1–90): "Founder access · N days remaining · See pricing →"
 *  - Post-window, on Free: "You're on Free. Your founding rate is reserved — lock it in →"
 *  - Paid (any tier): hidden
 *  - Legacy standard-trial final week: kept as a soft warning
 */
export function TrialCountdownBanner() {
  const navigate = useNavigate();
  const {
    hasPaidAccess,
    status,
    founderWindowActive,
    founderDaysRemaining,
    isFoundingMember,
    trialActive,
    trialType,
    trialDaysRemaining,
  } = useSubscription();

  // Payment failed but still inside paid period — warn loudly even though
  // access is preserved during the dunning grace window.
  if (status === 'past_due') {
    return (
      <button
        type="button"
        onClick={() => navigate('/profile/subscription')}
        className="flex w-full items-center justify-center gap-2 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-destructive transition-colors hover:bg-destructive/15"
      >
        <AlertTriangle className="h-3 w-3" />
        Payment failed · Update your card before access ends →
      </button>
    );
  }

  if (hasPaidAccess) return null;

  const goPricing = () => navigate('/profile/subscription');


  // 1. Active 90-day founder window → headline pricing CTA
  if (founderWindowActive && founderDaysRemaining != null) {
    const dayLabel = founderDaysRemaining === 1 ? 'day' : 'days';
    return (
      <button
        type="button"
        onClick={goPricing}
        className="flex w-full items-center justify-center gap-2 border-b border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-primary/90 transition-colors hover:bg-primary/15"
      >
        <Sparkles className="h-3 w-3" />
        Founder access · {founderDaysRemaining} {dayLabel} remaining · See pricing →
      </button>
    );
  }

  // 2. Founding member, post-window, dropped to Free
  if (isFoundingMember) {
    return (
      <button
        type="button"
        onClick={goPricing}
        className="flex w-full items-center justify-center gap-2 border-b border-primary/20 bg-primary/5 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-primary/80 transition-colors hover:bg-primary/10"
      >
        <Sparkles className="h-3 w-3" />
        You're on Free · Your founding rate is reserved — lock it in →
      </button>
    );
  }

  // 3. Legacy standard trial — keep the soft last-week warning
  if (trialActive && trialType !== 'beta' && trialDaysRemaining != null && trialDaysRemaining <= 7) {
    const urgent = trialDaysRemaining <= 2;
    const dayLabel = trialDaysRemaining === 1 ? 'day' : 'days';
    return (
      <button
        type="button"
        onClick={goPricing}
        className={`flex w-full items-center justify-center gap-2 border-b px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition-colors ${
          urgent
            ? 'border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15'
            : 'border-primary/20 bg-primary/10 text-primary/90 hover:bg-primary/15'
        }`}
      >
        <Clock className="h-3 w-3" />
        {trialDaysRemaining} {dayLabel} left in your full experience · Choose your path
      </button>
    );
  }

  return null;
}
