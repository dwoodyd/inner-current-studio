import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getPaddleEnv } from "@/lib/paddle";

export interface SubscriptionState {
  loading: boolean;
  isPremium: boolean;
  tier: "free" | "premium" | "lifetime";
  freeCurrent: string | null;
  status: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    loading: true,
    isPremium: false,
    tier: "free",
    freeCurrent: null,
    status: null,
    cancelAtPeriodEnd: false,
    currentPeriodEnd: null,
  });

  useEffect(() => {
    if (!user) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    const env = getPaddleEnv();
    let cancelled = false;

    async function load() {
      const [{ data: sub }, { data: profile }] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("status,cancel_at_period_end,current_period_end,product_id")
          .eq("user_id", user.id)
          .eq("environment", env)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("subscription_tier,free_current")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      const periodStillOpen = !sub?.current_period_end || new Date(sub.current_period_end) > new Date();
      const active =
        sub &&
        (["active", "trialing"].includes(sub.status) || (sub.status === "canceled" && periodStillOpen)) &&
        periodStillOpen;

      const tier = (profile?.subscription_tier as SubscriptionState["tier"]) || "free";

      setState({
        loading: false,
        isPremium: !!active || tier === "lifetime" || tier === "premium",
        tier,
        freeCurrent: profile?.free_current || null,
        status: sub?.status || null,
        cancelAtPeriodEnd: !!sub?.cancel_at_period_end,
        currentPeriodEnd: sub?.current_period_end || null,
      });
    }

    load();

    const channel = supabase
      .channel(`sub-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        () => load()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  return state;
}
