import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, ShieldCheck, Mail, ExternalLink } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Subscription() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const sub = useSubscription();

  const planLabel = (() => {
    if (sub.loading) return '…';
    if (sub.status === 'owner') return 'Owner · Lifetime';
    if (sub.tier === 'lifetime') return 'Lifetime';
    if (sub.tier === 'premium') return 'Premium';
    if (sub.trialActive && sub.trialType === 'beta') return 'Founder Trial';
    if (sub.trialActive) return 'Trial';
    return 'Free';
  })();

  const handleBillingPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error || !data?.url) throw error;
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('No active billing portal is available for this account yet.');
    }
  };

  return (
    <div className="relative min-h-[100dvh] pb-24">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        className="relative mx-auto max-w-lg space-y-6 px-5 pt-6 safe-top"
      >
        <motion.button
          variants={fadeUp}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} /> Back
        </motion.button>

        <motion.div variants={fadeUp} className="space-y-2 text-center pt-2">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Subscription</h1>
          <p className="text-sm text-muted-foreground font-heading italic">
            Your plan, your pace.
          </p>
        </motion.div>

        {/* Plan summary */}
        <motion.div
          variants={fadeUp}
          className="soul-glass-elevated rounded-2xl px-6 py-6 space-y-4 border border-primary/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Current plan
            </span>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {planLabel}
            </span>
          </div>

          {sub.trialActive && sub.trialDaysRemaining != null && (
            <div className="space-y-1.5">
              <p className="font-heading text-xl text-foreground">
                {sub.trialDaysRemaining} {sub.trialDaysRemaining === 1 ? 'day' : 'days'} remaining
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {sub.trialType === 'beta'
                  ? 'You’re on the Founder Trial. Lifetime access is locked in at $99 — no auto-charge, no surprise.'
                  : 'Your full-experience trial is active. You’ll be guided to choose a path before it ends.'}
              </p>
            </div>
          )}

          {sub.status === 'owner' && (
            <div className="space-y-1.5">
              <p className="font-heading text-xl text-foreground">Lifetime access</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                You hold owner-level access to every Current and every practice. Nothing to manage here.
              </p>
            </div>
          )}

          {sub.hasPaidAccess && sub.status !== 'owner' && (
            <div className="space-y-1.5">
              <p className="font-heading text-xl text-foreground">Lifetime locked in</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Your $99 founder rate is permanent. No recurring charges, no renewals.
              </p>
            </div>
          )}

          {!sub.hasPaidAccess && !sub.trialActive && (
            <div className="space-y-1.5">
              <p className="font-heading text-xl text-foreground">Free Current</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                You have one free Current open. Upgrade any time for lifetime access to all five.
              </p>
            </div>
          )}
        </motion.div>

        {/* Lifetime promise */}
        <motion.div variants={fadeUp} className="soul-glass rounded-2xl px-6 py-5 flex items-start gap-3">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" strokeWidth={1.5} />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Lifetime $99 · one-time</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Inner Wake doesn’t do recurring subscriptions. Pay once, keep your practice for as long as the app lives.
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div variants={fadeUp} className="space-y-2.5">
          {sub.hasPaidAccess && sub.status !== 'owner' && (
            <button
              type="button"
              onClick={handleBillingPortal}
              className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-border/30 bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/10"
            >
              <ExternalLink size={15} />
              View invoices & payment details
            </button>
          )}

          {!sub.hasPaidAccess && !sub.trialActive && (
            <button
              type="button"
              onClick={() => navigate('/onboarding')}
              className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]"
            >
              <Sparkles size={16} />
              Unlock lifetime — $99
            </button>
          )}

          <a
            href="mailto:hello@soulengineer.online?subject=Inner%20Wake%20%E2%80%94%20help%20with%20my%20plan"
            className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-border/20 bg-transparent px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/10 hover:text-foreground"
          >
            <Mail size={15} />
            Need help? Email us
          </a>
        </motion.div>

        <motion.div variants={fadeUp} className="text-center pt-2 space-y-1">
          <p className="text-[10px] text-muted-foreground/40 truncate">{user?.email}</p>
          <p className="text-xs text-muted-foreground/40 font-heading italic">
            Your rhythm, not your performance.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
