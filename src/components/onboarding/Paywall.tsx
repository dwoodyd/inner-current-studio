import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";

interface PaywallProps {
  companionName: string;
  chosenCurrent: string;
  onContinueFree: () => void;
  onPurchased: () => void;
}

const TIERS = [
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

const INCLUDES = [
  "All five Currents — unlocked",
  "AI Affirmation Coach",
  "Unlimited gather sequences & rituals",
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
  const [selected, setSelected] = useState<string>("premium_yearly");

  const handlePurchase = async () => {
    if (!user) return;
    try {
      await openCheckout({
        priceId: selected,
        customerEmail: user.email,
        userId: user.id,
        successUrl: `${window.location.origin}/?checkout=success`,
      });
      // Webhook will mark them premium; optimistic redirect happens on success URL
      onPurchased();
    } catch (e) {
      console.error("checkout failed", e);
    }
  };

  return (
    <div className="space-y-7 text-center">
      <div className="space-y-3">
        <Sparkles className="h-6 w-6 text-primary mx-auto" />
        <p className="text-xs tracking-[0.3em] uppercase text-primary/70">Act Seven</p>
        <h2 className="font-heading text-3xl font-light text-foreground">
          Open all five Currents
        </h2>
        <p className="text-sm text-muted-foreground italic max-w-sm mx-auto">
          {companionName} will walk with you in <span className="text-foreground">{chosenCurrent}</span> for free, always.
          When you're ready, the other four open below.
        </p>
      </div>

      <div className="space-y-2">
        {TIERS.map((tier, i) => {
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
        7-day refund. Cancel anytime. No tricks.
      </p>
    </div>
  );
}
