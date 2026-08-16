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

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Friendly tool label, e.g. "the Alignment Wheel". */
  tool: string;
  /** Free-tier daily limit for this tool. */
  limit: number;
  /** Optional override for the body line. */
  message?: string;
}

export function PaywallModal({ open, onOpenChange, tool, limit, message }: PaywallModalProps) {
  const navigate = useNavigate();
  const body =
    message ??
    `You've met today's edge with ${tool} — ${limit === 1 ? "one session" : `${limit} sessions`} a day on the free path. Pro keeps the door open: unlimited practice, all five Currents, and the deeper tools whenever you reach for them.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl border-primary/15 bg-card/95 px-6 py-7 text-center">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X size={18} />
        </button>
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            <Sparkles size={20} />
          </div>
          <DialogTitle className="font-heading text-2xl font-light leading-snug text-foreground">
            This Current is waiting for you in Pro
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {body}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex flex-col gap-2.5 sm:flex-col">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              navigate("/profile/subscription");
            }}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]"
          >
            <Sparkles size={16} /> See Pro options
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="min-h-[44px] text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Continue with what's free
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
