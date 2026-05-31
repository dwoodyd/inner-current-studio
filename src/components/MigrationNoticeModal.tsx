import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

const STORAGE_KEY_PREFIX = "iw_migration_notice_v2_seen_";

/**
 * One-time migration notice shown to users carried over from the old single-tier
 * lifetime model into the new three-tier (Free / Pro / Lifetime) structure with
 * a 90-day founder window. Dismissed permanently per user via localStorage.
 */
export function MigrationNoticeModal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const sub = useSubscription();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || sub.loading) return;
    const seen = localStorage.getItem(STORAGE_KEY_PREFIX + user.id);
    if (seen) return;
    // Only show to users who pre-existed the new model: founding members or
    // users currently inside their (newly granted) founder window.
    if (sub.isFoundingMember || sub.founderWindowActive) {
      const t = window.setTimeout(() => setOpen(true), 800);
      return () => window.clearTimeout(t);
    }
  }, [user, sub.loading, sub.isFoundingMember, sub.founderWindowActive]);

  const dismiss = () => {
    if (user) localStorage.setItem(STORAGE_KEY_PREFIX + user.id, "1");
    setOpen(false);
  };

  const isLifetime = sub.detailedTier === "lifetime";
  const days = sub.founderDaysRemaining ?? 90;

  const title = isLifetime
    ? "You're a Founding Member"
    : "Your founder access is open";

  const body = isLifetime
    ? "Inner Wake just opened three plans: Free, Pro Monthly, and Pro Annual. Your Lifetime stays exactly as it is — full access, forever — and you're permanently flagged as a Founding Member. Thank you for being early."
    : `Inner Wake just opened three plans: Free, Pro Monthly, and Pro Annual. As an early member, you have ${days} day${days === 1 ? "" : "s"} of full Pro access — every Current, every tool, no card required. Whenever you're ready, you can lock in founding rates that stay yours for life.`;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : dismiss())}>
      <DialogContent className="max-w-sm rounded-3xl border-primary/15 bg-card/95 px-6 py-7 text-center">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X size={18} />
        </button>
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            <Sparkles size={20} />
          </div>
          <DialogTitle className="font-heading text-2xl font-semibold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {body}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex flex-col gap-2.5 sm:flex-col">
          <button
            type="button"
            onClick={() => {
              dismiss();
              navigate("/profile/subscription");
            }}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]"
          >
            <Sparkles size={16} /> {isLifetime ? "View my plan" : "See the new plans"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="min-h-[44px] text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Got it
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
