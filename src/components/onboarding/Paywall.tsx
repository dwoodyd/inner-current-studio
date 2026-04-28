import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { useSubscription } from "@/hooks/useSubscription";

interface PaywallProps {
  companionName: string;
  chosenCurrent: string;
  onContinueFree: () => void;
  onPurchased: () => void;
}

const STANDARD_TIERS = [
  {
    id: "premium_yearly",
    label: "Yearly",
    badge: "Most chosen",
    price: "$49",
    period: "/year",
    sublabel: "$4.08 / month — save 42%",
  },
  {
    id: "premium_lifetime_149",
    label: "Lifetime",
    badge: "Founding member",
    price: "$149",
    period: "once",
    sublabel: "Pay once. Yours forever.",
  },
  {
    id: "premium_monthly",
    label: "Monthly",
    badge: null,
    price: "$7",
    period: "/month",
    sublabel: "Cancel anytime",
  },
] as const;

const BETA_LIFETIME_TIER = {
  id: "premium_lifetime_beta_99",
  label: "Lifetime",
  badge: "Founder offer · $50 off",
  price: "$99",
  period: "once",
  sublabel: "Beta-tester gratitude. Yours forever.",
} as const;

const INCLUDES = [
  "All five Currents — unlocked",
  "AI Affirmation Coach",
  "Unlimited gather sequences & rituals",
  "Reality Scripting + Constellation",
  "Future Pages, Imagine If, Pattern Mirror",
  "Voice playback on scripts",
  "Daily insights tuned to your Current",
  "Export your reflections anytime",
];

export function Paywall({
  companionName,
  chosenCurrent,
  onContinueFree,
  onPurchased,
}: PaywallProps) {
  const { user } = useAuth();
  const { openCheckout, loading } = usePaddleCheckout();
  const { trialActive, trialType, trialDaysRemaining, hasPaidAccess } = useSubscription();

  const isBeta = trialType === 'beta';
  // Beta testers see the $99 lifetime instead of the $149 lifetime
  const tiers = isBeta
    ? [STANDARD_TIERS[0], BETA_LIFETIME_TIER, STANDARD_TIERS[2]]
    : STANDARD_TIERS;

  const defaultSelected = isBeta ? "premium_lifetime_beta_99" : "premium_yearly";
  const [selected, setSelected] = useState<string>(defaultSelected);

  const handlePurchase = async () => {
    if (!user) return;
    try {
      await openCheckout({
        priceId: selected,
        customerEmail: user.email,
        userId: user.id,
        successUrl: `${window.location.origin}/?checkout=success`,
      });
      onPurchased();
    } catch (e) {
      console.error("checkout failed", e);
    }
  };

  // Trial-aware headline
  let eyebrow = "Act Seven";
  let headline = "Open all five Currents";
  let subhead = (
    <>
      {companionName} will walk with you in <span className="text-foreground">{chosenCurrent}</span> for free, always.
      When you're ready, the other four open below.
    </>
  );

  if (trialActive && trialDaysRemaining != null && !hasPaidAccess) {
    if (isBeta) {
      eyebrow = `Founder Trial · ${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'} left`;
      headline = "Lock in your founder lifetime";
      subhead = (
        <>
          Thank you for being early. Your trial keeps going — but the $99 lifetime
          offer is reserved only for beta testers.
        </>
      );
    } else if (trialDaysRemaining <= 7) {
      eyebrow = `${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'} left in your full experience`;
      headline = "Choose your path forward";
      subhead = (
        <>
          When your trial ends, {chosenCurrent} stays open for free, always. Open all
          five Currents below — or return to your free Current on day {trialDaysRemaining > 0 ? trialDaysRemaining : 1}.
        </>
      );
    }
  }

  return (
    <div className="space-y-7 text-center">
      <div className="space-y-3">
        <Sparkles className="h-6 w-6 text-primary mx-auto" />
        <p className="text-xs tracking-[0.3em] uppercase text-primary/70">{eyebrow}</p>
        <h2 className="font-heading text-3xl font-light text-foreground">
          {headline}
        </h2>
        <p className="text-sm text-muted-foreground italic max-w-sm mx-auto">
          {subhead}
        </p>
      </div>

      <div className="space-y-2">
        {tiers.map((tier, i) => {
          const isSelected = selected === tier.id;
          return (
            <motion.button
              key={tier.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              onClick={() => setSelected(tier.id)}
              className={`w-full rounded-2xl border px-5 py-4 text-left transition-all active:scale-[0.99] ${
                isSelected
                  ? "border-primary/60 bg-primary/10 shadow-[0_0_24px_hsl(42_65%_58%_/_0.15)]"
                  : "border-border/30 bg-card/40 hover:border-border/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-lg text-foreground">{tier.label}</span>
                    {tier.badge && (
                      <span className="text-[10px] tracking-widest uppercase text-primary/80 border border-primary/30 rounded-full px-2 py-0.5">
                        {tier.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{tier.sublabel}</div>
                </div>
                <div className="text-right">
                  <div className="font-heading text-xl text-foreground">{tier.price}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {tier.period}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <ul className="space-y-2 text-left max-w-sm mx-auto">
        {INCLUDES.map((line) => (
          <li key={line} className="flex items-start gap-3 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <div className="space-y-3 pt-2">
        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-all disabled:opacity-50 active:scale-[0.98] shadow-[0_8px_32px_hsl(42_65%_58%_/_0.25)]"
        >
          {loading ? "Opening checkout…" : "Open all five Currents"}
        </button>
        <button
          onClick={onContinueFree}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          Continue with {chosenCurrent} for free
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground/60 italic">
        14-day refund. Cancel anytime. No tricks.
      </p>
    </div>
  );
}
