import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface PaywallProps {
  companionName: string;
  chosenCurrent: string;
  onContinueFree: () => void;
  /** Kept for OnboardingFlow compatibility — onboarding no longer opens
   *  checkout directly. Users go to /subscription to purchase. */
  onPurchased: () => void;
}

const INCLUDES = [
  "All five Currents — unlocked",
  "AI Affirmation Coach",
  "Unlimited gather sequences & rituals",
  "Reality Scripting + Constellation",
  "Future Pages, Imagine If, Pattern Mirror",
  "Voice playback on scripts",
];

/**
 * Onboarding "soft paywall":
 * Every new user gets a 90-day founder access window, so the right call here
 * is to celebrate that window and route the user straight into their practice
 * — not to open checkout mid-onboarding. Pricing lives at /subscription.
 */
const FOUNDER_WINDOW_DAYS = 90;

export function Paywall({ companionName, chosenCurrent, onContinueFree }: PaywallProps) {
  const navigate = useNavigate();
  const { trialDaysRemaining, founderDaysRemaining, tier, isFoundingMember } = useSubscription();

  /** Permanent access — nothing to count down. */
  const hasForeverAccess = tier === "lifetime" || isFoundingMember;

  // Never render a zero/negative window to a brand-new account: fall back to
  // the full founder window until the backend value lands.
  const rawDays = founderDaysRemaining ?? trialDaysRemaining ?? FOUNDER_WINDOW_DAYS;
  const daysLeft = rawDays > 0 ? rawDays : FOUNDER_WINDOW_DAYS;

  return (
    <div className="space-y-7 text-center">
      <div className="space-y-3">
        <Sparkles className="h-6 w-6 text-primary mx-auto" />
        <p className="text-xs tracking-[0.3em] uppercase text-primary/70">
          {hasForeverAccess ? "Founding Member · Forever" : `Founder Access · ${daysLeft} days`}
        </p>
        <h2 className="font-heading text-3xl font-light text-foreground">
          All five Currents — open
        </h2>
        <p className="text-sm text-muted-foreground italic max-w-sm mx-auto">
          {companionName} will walk with you in{" "}
          <span className="text-foreground">{chosenCurrent}</span>
          {hasForeverAccess ? (
            <>
              {" "}— and every other Current stays open for good. Full access, forever.
            </>
          ) : (
            <>
              {" "}for free, always. Your other Currents stay open for the next {daysLeft} days — no
              card needed.
            </>
          )}
        </p>
      </div>

      <ul className="space-y-2 text-left max-w-sm mx-auto">
        {INCLUDES.map((line, i) => (
          <motion.li
            key={line}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="flex items-start gap-3 text-sm text-muted-foreground"
          >
            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>{line}</span>
          </motion.li>
        ))}
      </ul>

      <div className="space-y-3 pt-2">
        <button
          onClick={onContinueFree}
          className="w-full rounded-2xl bg-primary py-4 min-h-[48px] text-sm font-medium text-primary-foreground transition-all disabled:opacity-50 active:scale-[0.98] shadow-[0_8px_32px_hsl(42_65%_58%_/_0.25)] flex items-center justify-center gap-2"
        >
          Begin in {chosenCurrent}
          <ArrowRight size={15} />
        </button>
        {!hasForeverAccess && (
          <button
            onClick={() => navigate("/profile/subscription")}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            See pricing & lock in the founding rate
          </button>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground/60 italic">
        {hasForeverAccess
          ? "You're a Founding Member. Nothing expires."
          : "No card now. Cancel anytime. Founding rate available throughout your access window."}
      </p>
    </div>
  );
}
