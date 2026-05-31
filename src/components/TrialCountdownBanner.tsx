import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

/**
 * Shows a slim banner reminding the user how many days remain in their trial.
 * Visibility rules:
 *  - Hidden if user already has paid access
 *  - Hidden if no active trial
 *  - For STANDARD trial: only shown in last 7 days
 *  - For BETA trial: always visible (Founder Trial badge), styled differently
 */
export function TrialCountdownBanner() {
  const navigate = useNavigate();
  const { hasPaidAccess, trialActive, trialType, trialDaysRemaining } = useSubscription();

  if (hasPaidAccess) return null;
  if (!trialActive || trialDaysRemaining == null) return null;

  const isBeta = trialType === 'beta';
  const isStandardLastWeek = !isBeta && trialDaysRemaining <= 7;

  if (!isBeta && !isStandardLastWeek) return null;

  const dayLabel = trialDaysRemaining === 1 ? 'day' : 'days';

  if (isBeta) {
    return (
      <button
        type="button"
        onClick={() => navigate('/profile/subscription')}
        className="flex w-full items-center justify-center gap-2 border-b border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-primary/90 transition-colors hover:bg-primary/15"
      >
        <Sparkles className="h-3 w-3" />
        Founder Trial · {trialDaysRemaining} {dayLabel} left · $99 locks lifetime access
      </button>
    );
  }

  // Standard trial, final 7 days
  const urgent = trialDaysRemaining <= 2;
  return (
    <button
      type="button"
      onClick={() => navigate('/profile/subscription')}
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
