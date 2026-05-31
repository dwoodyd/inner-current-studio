import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

export type GatedTool =
  | "alignment_wheel"
  | "breathwork"
  | "reset"
  | "current_guide";

export const FREE_DAILY_LIMITS: Record<GatedTool, number> = {
  alignment_wheel: 1,
  breathwork: 1,
  reset: 1, // combined across State Ladder, Contrast, Resistance, Quiet Mind
  current_guide: 3,
};

export const TOOL_LABELS: Record<GatedTool, string> = {
  alignment_wheel: "the Alignment Wheel",
  breathwork: "Breathwork",
  reset: "Reset tools",
  current_guide: "the Current Guide",
};

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface DailyLimitState {
  loading: boolean;
  used: number;
  limit: number;
  canUse: boolean;
  isFree: boolean;
  /** True when free user is over the daily limit. */
  blocked: boolean;
  /** Atomically increment the count server-side. */
  recordUse: () => Promise<number | null>;
  refresh: () => Promise<void>;
}

export function useDailyLimit(tool: GatedTool): DailyLimitState {
  const { user } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription();
  const [used, setUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  const limit = FREE_DAILY_LIMITS[tool];
  const isFree = !isPremium;

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    if (isPremium) {
      setUsed(0);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("daily_usage")
      .select("count")
      .eq("user_id", user.id)
      .eq("tool", tool)
      .eq("usage_date", todayUTC())
      .maybeSingle();
    setUsed(data?.count ?? 0);
    setLoading(false);
  }, [user, isPremium, tool]);

  useEffect(() => {
    if (subLoading) return;
    setLoading(true);
    load();
  }, [load, subLoading]);

  const recordUse = useCallback(async () => {
    if (!user || isPremium) return null;
    const { data, error } = await supabase.rpc("increment_daily_usage", { _tool: tool });
    if (error) {
      console.error("increment_daily_usage failed", error);
      return null;
    }
    const next = (data as number) ?? used + 1;
    setUsed(next);
    return next;
  }, [user, isPremium, tool, used]);

  const canUse = isPremium || used < limit;
  const blocked = isFree && used >= limit;

  return { loading: loading || subLoading, used, limit, canUse, isFree, blocked, recordUse, refresh: load };
}
