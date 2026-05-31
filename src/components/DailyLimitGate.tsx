import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PaywallModal } from "@/components/PaywallModal";
import { useDailyLimit, GatedTool, TOOL_LABELS } from "@/hooks/useDailyLimit";

interface DailyLimitGateProps {
  tool: GatedTool;
  children: ReactNode;
}

/**
 * Wraps a tool route. Free users at-or-over their daily limit see the paywall
 * modal and are bounced home if they dismiss it. Pro / lifetime / founder-trial
 * users pass through with no gate.
 */
export function DailyLimitGate({ tool, children }: DailyLimitGateProps) {
  const navigate = useNavigate();
  const { loading, blocked, limit, isFree } = useDailyLimit(tool);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && blocked) setOpen(true);
  }, [loading, blocked]);

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full bg-primary/20 animate-pulse" />
      </div>
    );
  }

  if (blocked) {
    return (
      <>
        <div className="flex min-h-[60dvh] items-center justify-center bg-background" />
        <PaywallModal
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) navigate("/");
          }}
          tool={TOOL_LABELS[tool]}
          limit={limit}
        />
      </>
    );
  }

  return <>{children}</>;
}
