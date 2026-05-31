import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown, ExternalLink, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useFounderSlots } from '@/hooks/useFounderSlots';
import { usePaddleCheckout } from '@/hooks/usePaddleCheckout';
import { FOUNDING_PRICES, RETAIL_PRICES } from '@/lib/pricing';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

type Cadence = 'monthly' | 'annual';

const FREE_FEATURES = [
  'Living Orb · all five states',
  'Unlimited energy check-ins',
  'Money Current — fully open',
  '1 daily Alignment Wheel',
  '1 daily Breathwork session',
  '1 daily Reset tool',
  '3 daily Current Guide reflections',
  'Stillness Timer — unlimited',
  'Pattern Mirror — current week',
];

const PRO_FEATURES = [
  'Everything in Free, unlimited',
  'All 5 Currents · Self · Energy · Relationship · Health',
  'Custom Sigil generation per Current',
  'Resonance Library',
  'Practice Constellation',
  'State-matched soundscapes  ·  Coming soon',
  'Pattern Mirror — multi-month history',
  'Wisdom Streams — full library  ·  Coming soon',
  'Unlimited custom Rituals',
];

const LIFETIME_EXTRAS = [
  'Everything in Pro',
  'Never billed again',
  'Founding Member badge',
  'Direct line to DeWayne — one note per quarter',
  '1-on-1 onboarding call with DeWayne',
  'Free download of Before the Words when it releases',
];

export default function Subscription() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const sub = useSubscription();
  const slots = useFounderSlots();
  const checkout = usePaddleCheckout();
  const [cadence, setCadence] = useState<Cadence>('annual');
  const [showCompare, setShowCompare] = useState(false);

  const inFounderWindow = sub.founderWindowActive;
  const ctaVerb = inFounderWindow ? 'Reserve' : 'Upgrade to';

  // Founding rate is reserved for life for founding members + anyone still inside their founder window.
  // Everyone else (new signups after the 100 lifetime slots fill) sees retail pricing.
  const eligibleForFounding = sub.isFoundingMember || inFounderWindow || !slots.soldOut;
  const proPriceId = eligibleForFounding
    ? (cadence === 'annual' ? FOUNDING_PRICES.annual : FOUNDING_PRICES.monthly)
    : (cadence === 'annual' ? RETAIL_PRICES.annual : RETAIL_PRICES.monthly);
  const lifetimeAvailable = !slots.soldOut || sub.detailedTier === 'lifetime';

  const startCheckout = async (priceId: string) => {
    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }
    try {
      await checkout.openCheckout({
        priceId,
        customerEmail: user.email ?? undefined,
        userId: user.id,
        successUrl: `${window.location.origin}/profile/subscription?checkout=success`,
      });
    } catch (e) {
      toast.error('Checkout could not open. Try again in a moment.');
      console.error(e);
    }
  };

  const handleBillingPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error || !data?.url) throw error;
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('No active billing portal is available for this account yet.');
    }
  };

  const currentPlanLabel = (() => {
    if (sub.loading) return '…';
    if (sub.status === 'owner') return 'Owner · Lifetime';
    if (sub.detailedTier === 'lifetime') return sub.isFoundingMember ? 'Founding Member · Lifetime' : 'Lifetime';
    if (sub.detailedTier === 'pro_annual') return 'Pro · Annual';
    if (sub.detailedTier === 'pro_monthly') return 'Pro · Monthly';
    if (sub.detailedTier === 'founder_trial') return `Founder Access · Day ${91 - (sub.founderDaysRemaining ?? 0)} of 90`;
    return 'Free';
  })();

  return (
    <div className="relative min-h-[100dvh] pb-24">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        className="relative mx-auto max-w-3xl space-y-6 px-5 pt-6 safe-top"
      >
        <motion.button
          variants={fadeUp}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} /> Back
        </motion.button>

        <motion.div variants={fadeUp} className="space-y-2 text-center pt-2">
          <h1 className="font-heading text-3xl font-semibold text-foreground">Pricing</h1>
          <p className="text-sm text-muted-foreground font-heading italic">
            Simple, honest. No dark patterns.
          </p>
        </motion.div>

        {/* Status strip */}
        <motion.div
          variants={fadeUp}
          className="soul-glass-elevated rounded-2xl px-5 py-4 border border-primary/10 space-y-2"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Current plan
            </span>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {currentPlanLabel}
            </span>
          </div>
          {inFounderWindow && (
            <p className="text-sm text-foreground/90">
              <span className="font-medium">Your founding rate is locked for life.</span>{' '}
              You have <span className="font-medium">{sub.founderDaysRemaining}</span> days remaining in your founder access window.
              After that, your founding rate is reserved — upgrade with one click whenever you're ready.
            </p>
          )}
          {!inFounderWindow && sub.detailedTier === 'free' && sub.isFoundingMember && (
            <p className="text-sm text-foreground/90">
              You're on Free. Your founding rate is reserved — lock it in anytime.
            </p>
          )}
          {!slots.loading && lifetimeAvailable && slots.claimed != null && (
            <p className="text-xs text-muted-foreground">
              Founding Member · {slots.claimed} of {slots.total} lifetime slots claimed
            </p>
          )}
        </motion.div>

        {/* Cadence toggle */}
        <motion.div variants={fadeUp} className="flex justify-center">
          <div className="inline-flex rounded-full border border-border/30 bg-card p-1">
            {(['monthly', 'annual'] as Cadence[]).map((c) => (
              <button
                key={c}
                onClick={() => setCadence(c)}
                className={`min-w-[110px] rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.18em] transition-colors ${
                  cadence === c ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {c === 'monthly' ? 'Monthly' : 'Annual · save 35%'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tier cards */}
        <motion.div variants={fadeUp} className="grid gap-4 md:grid-cols-3">
          {/* Free */}
          <TierCard
            name="Free"
            price="$0"
            period="forever"
            tagline="Begin the practice."
            features={FREE_FEATURES.slice(0, 6)}
            cta={sub.detailedTier === 'free' ? 'You\'re on Free' : 'Continue free'}
            ctaDisabled={sub.detailedTier === 'free'}
            onCta={() => navigate('/')}
          />

          {/* Pro */}
          <TierCard
            highlight
            name={cadence === 'annual' ? 'Pro Annual' : 'Pro Monthly'}
            price={
              eligibleForFounding
                ? (cadence === 'annual' ? '$39' : '$4.99')
                : (cadence === 'annual' ? '$59' : '$7.99')
            }
            period={cadence === 'annual' ? '/yr' : '/mo'}
            badge={eligibleForFounding ? 'Founding Rate' : undefined}
            sub={
              eligibleForFounding
                ? (cadence === 'annual' ? '$59/yr retail · ≈ $3.25/mo' : '$7.99/mo retail')
                : (cadence === 'annual' ? '≈ $4.92/mo · save 38%' : undefined)
            }
            tagline={eligibleForFounding ? 'Locked for life.' : 'Full Pro access.'}
            features={PRO_FEATURES.slice(0, 6)}
            cta={`${ctaVerb} Pro ${cadence === 'annual' ? 'Annual' : 'Monthly'}`}
            ctaNote={
              eligibleForFounding
                ? (inFounderWindow ? 'No card now — founding rate locked for life.' : 'Founding rate locked for life.')
                : 'Cancel anytime.'
            }
            onCta={() => startCheckout(proPriceId)}
            ctaDisabled={sub.detailedTier === 'pro_annual' || sub.detailedTier === 'pro_monthly' || sub.detailedTier === 'lifetime'}
            loading={checkout.loading}
          />

          {/* Lifetime */}
          {lifetimeAvailable ? (
            <TierCard
              name="Pro Lifetime"
              price="$99"
              period=" one-time"
              badge="Founder-only"
              sub="Retiring with the founding member program"
              tagline="One purchase. Lifetime."
              features={LIFETIME_EXTRAS.slice(0, 6)}
              cta="Lock in Lifetime $99"
              ctaNote="One charge. Never billed again."
              onCta={() => startCheckout(FOUNDING_PRICES.lifetime)}
              ctaDisabled={sub.detailedTier === 'lifetime' || slots.soldOut}
              loading={checkout.loading}
            />
          ) : (
            <div className="soul-glass rounded-2xl px-5 py-6 text-center text-xs text-muted-foreground/70">
              All 100 founding lifetime slots are claimed. Pro Monthly &amp; Annual remain at retail rates for new members.
            </div>
          )}

          {/* Founding-member application CTA */}
          {lifetimeAvailable && sub.detailedTier !== 'lifetime' && (
            <button
              type="button"
              onClick={() => navigate('/founding-member')}
              className="soul-glass w-full rounded-2xl px-5 py-4 text-left text-xs text-muted-foreground hover:bg-muted/10 transition-colors flex items-center justify-between gap-3"
            >
              <span>
                <span className="block font-heading text-sm text-foreground">Apply to the Founding 100</span>
                <span className="mt-1 block text-muted-foreground/80">
                  Prefer a hand-reviewed entry? Tell us your story — we'll send a private founding-rate link if it's a fit.
                </span>
              </span>
              <span className="shrink-0 text-primary/70">→</span>
            </button>
          )}
        </motion.div>

        {/* Compare expand */}
        <motion.div variants={fadeUp}>
          <button
            onClick={() => setShowCompare((s) => !s)}
            className="mx-auto flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
          >
            {showCompare ? 'Hide' : 'Show'} full feature comparison
            <ChevronDown size={14} className={showCompare ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          {showCompare && (
            <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
              <CompareColumn title="Free" items={FREE_FEATURES} />
              <CompareColumn title="Pro" items={PRO_FEATURES} highlight />
              <CompareColumn title="Lifetime" items={LIFETIME_EXTRAS} />
            </div>
          )}
        </motion.div>

        {/* Trust strip */}
        <motion.div variants={fadeUp} className="soul-glass rounded-2xl px-5 py-4 flex items-start gap-3">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" strokeWidth={1.5} />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Secure checkout · Cancel anytime · No hidden fees. Inner Wake never raises your founding rate, even when retail rises.
          </p>
        </motion.div>

        {/* Manage billing for paid users */}
        {sub.hasPaidAccess && sub.status !== 'owner' && (
          <motion.div variants={fadeUp}>
            <button
              type="button"
              onClick={handleBillingPortal}
              className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-border/30 bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/10"
            >
              <ExternalLink size={15} />
              View invoices &amp; payment details
            </button>
          </motion.div>
        )}

        <motion.div variants={fadeUp}>
          <a
            href="mailto:hello@soulengineer.online?subject=Inner%20Wake%20%E2%80%94%20help%20with%20my%20plan"
            className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-border/20 bg-transparent px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/10 hover:text-foreground"
          >
            <Mail size={15} />
            Questions? Email us
          </a>
        </motion.div>

        <motion.div variants={fadeUp} className="text-center pt-2 space-y-1">
          <p className="text-[10px] text-muted-foreground/40 truncate">{user?.email}</p>
          <p className="text-xs text-muted-foreground/40 font-heading italic">
            Continuary works alongside Inner Wake — part of the Soul Engineer ecosystem.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

interface TierCardProps {
  name: string;
  price: string;
  period: string;
  badge?: string;
  sub?: string;
  tagline: string;
  features: string[];
  cta: string;
  ctaNote?: string;
  ctaDisabled?: boolean;
  onCta: () => void;
  highlight?: boolean;
  loading?: boolean;
}

function TierCard({
  name, price, period, badge, sub, tagline, features, cta, ctaNote, ctaDisabled, onCta, highlight, loading,
}: TierCardProps) {
  return (
    <div className={`relative rounded-2xl px-5 py-6 flex flex-col gap-4 ${
      highlight
        ? 'soul-glass-elevated border border-primary/30 ring-1 ring-primary/20'
        : 'soul-glass border border-border/20'
    }`}>
      {badge && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] uppercase tracking-[0.2em] text-primary-foreground">
          {badge}
        </span>
      )}
      <div className="space-y-1">
        <p className="font-heading text-lg text-foreground">{name}</p>
        <p className="text-xs italic text-muted-foreground">{tagline}</p>
      </div>
      <div>
        <p className="font-heading text-3xl text-foreground">
          {price}<span className="text-base font-normal text-muted-foreground">{period}</span>
        </p>
        {sub && <p className="text-[11px] text-muted-foreground/70 mt-1">{sub}</p>}
      </div>
      <ul className="space-y-1.5 text-sm text-foreground/85 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check size={14} className="mt-0.5 shrink-0 text-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-1.5">
        <button
          type="button"
          disabled={ctaDisabled || loading}
          onClick={onCta}
          className={`flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
            highlight
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border border-border/40 bg-card text-foreground hover:bg-muted/10'
          }`}
        >
          {highlight && <Sparkles size={14} />}
          {cta}
        </button>
        {ctaNote && <p className="text-[11px] text-center text-muted-foreground/70 leading-snug">{ctaNote}</p>}
      </div>
    </div>
  );
}

function CompareColumn({ title, items, highlight }: { title: string; items: string[]; highlight?: boolean }) {
  return (
    <div className={`rounded-xl px-4 py-4 ${highlight ? 'soul-glass-elevated border border-primary/20' : 'soul-glass border border-border/15'}`}>
      <p className={`text-xs uppercase tracking-[0.22em] mb-3 ${highlight ? 'text-primary' : 'text-muted-foreground'}`}>{title}</p>
      <ul className="space-y-1.5">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-2 text-foreground/85">
            <Check size={13} className="mt-0.5 shrink-0 text-primary/80" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
