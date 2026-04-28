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
  // Trial state
  trialActive: boolean;
  trialType: "standard" | "beta" | null;
  trialEndsAt: string | null;
  trialDaysRemaining: number | null;
  // True only if access comes from a real paid subscription (not the trial)
  hasPaidAccess: boolean;
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
    trialActive: false,
    trialType: null,
    trialEndsAt: null,
    trialDaysRemaining: null,
    hasPaidAccess: false,
  });

  useEffect(() => {
    if (!user) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    const env = getPaddleEnv();
    let cancelled = false;

    async function load() {
      try {
        const [{ data: sub }, { data: profile }] = await Promise.all([
          supabase
            .from("subscriptions")
            .select("status,cancel_at_period_end,current_period_end,product_id")
            .eq("user_id", user.id)
            .eq("environment", env)
            .maybeSingle(),
          supabase
            .from("profiles")
            .select("subscription_tier,free_current,trial_ends_at,trial_type")
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
        const hasPaidAccess = !!active || tier === "lifetime" || tier === "premium";

        // Trial calculations
        const trialEndsAt = profile?.trial_ends_at || null;
        const trialActive = !!trialEndsAt && new Date(trialEndsAt) > new Date();
        const trialDaysRemaining = trialEndsAt
          ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : null;
        const trialType = (profile?.trial_type as "standard" | "beta") || null;

        setState({
          loading: false,
          isPremium: hasPaidAccess || trialActive,
          tier,
          freeCurrent: profile?.free_current || null,
          status: sub?.status || null,
          cancelAtPeriodEnd: !!sub?.cancel_at_period_end,
          currentPeriodEnd: sub?.current_period_end || null,
          trialActive,
          trialType,
          trialEndsAt,
          trialDaysRemaining,
          hasPaidAccess,
        });
      } catch (err) {
        // Never leave the gate stuck on loading if a query fails.
        console.error("useSubscription load failed", err);
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      }
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
