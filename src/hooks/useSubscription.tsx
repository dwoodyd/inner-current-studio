import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getPaddleEnv } from "@/lib/paddle";
import { priceIdToTier } from "@/lib/pricing";

export type DetailedTier =
  | "free"
  | "founder_trial"
  | "pro_monthly"
  | "pro_annual"
  | "lifetime";

export interface SubscriptionState {
  loading: boolean;
  isPremium: boolean;
  /** Legacy coarse tier — kept for backward compatibility with existing gates. */
  tier: "free" | "premium" | "lifetime";
  /** Detailed tier reflecting the new three-tier pricing structure. */
  detailedTier: DetailedTier;
  freeCurrent: string | null;
  status: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  // Trial / founder window
  trialActive: boolean;
  trialType: "standard" | "beta" | null;
  trialEndsAt: string | null;
  trialDaysRemaining: number | null;
  /** True if user is inside their 90-day founder access window. */
  founderWindowActive: boolean;
  founderDaysRemaining: number | null;
  isFoundingMember: boolean;
  hasPaidAccess: boolean;
  priceId: string | null;
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    loading: true,
    isPremium: false,
    tier: "free",
    detailedTier: "free",
    freeCurrent: null,
    status: null,
    cancelAtPeriodEnd: false,
    currentPeriodEnd: null,
    trialActive: false,
    trialType: null,
    trialEndsAt: null,
    trialDaysRemaining: null,
    founderWindowActive: false,
    founderDaysRemaining: null,
    isFoundingMember: false,
    hasPaidAccess: false,
    priceId: null,
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
        const [{ data: sub }, { data: profile }, { data: adminRole }] = await Promise.all([
          supabase
            .from("subscriptions")
            .select("status,cancel_at_period_end,current_period_end,product_id,price_id")
            .eq("user_id", user.id)
            .eq("environment", env)
            .maybeSingle(),
          supabase
            .from("profiles")
            .select("subscription_tier,free_current,trial_ends_at,trial_type,founder_window_ends_at,is_founding_member")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle(),
        ]);

        if (cancelled) return;

        const isAdmin = !!adminRole;
        const periodStillOpen = !sub?.current_period_end || new Date(sub.current_period_end) > new Date();
        const active =
          sub &&
          (["active", "trialing"].includes(sub.status) || (sub.status === "canceled" && periodStillOpen)) &&
          periodStillOpen;

        const baseTier = (profile?.subscription_tier as SubscriptionState["tier"]) || "free";
        const tier: SubscriptionState["tier"] = isAdmin ? "lifetime" : baseTier;
        const hasPaidAccess = isAdmin || !!active || tier === "lifetime" || tier === "premium";

        // Trial / founder window calcs — admins skip the trial UI entirely
        const trialEndsAt = profile?.trial_ends_at || null;
        const trialActive = !isAdmin && !!trialEndsAt && new Date(trialEndsAt) > new Date();
        const trialDaysRemaining = trialEndsAt
          ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : null;
        const trialType = (profile?.trial_type as "standard" | "beta") || null;
        const founderEndsAt = (profile as any)?.founder_window_ends_at || null;
        const founderWindowActive = !isAdmin && !!founderEndsAt && new Date(founderEndsAt) > new Date();
        const founderDaysRemaining = founderEndsAt
          ? Math.max(0, Math.ceil((new Date(founderEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : null;
        const isFoundingMember = isAdmin || !!(profile as any)?.is_founding_member;

        // Derive detailed tier
        let detailedTier: DetailedTier = "free";
        if (isAdmin || tier === "lifetime") detailedTier = "lifetime";
        else if (tier === "premium" && sub?.price_id) {
          const mapped = priceIdToTier(sub.price_id);
          detailedTier = mapped === "free" ? "pro_monthly" : (mapped as DetailedTier);
        } else if (founderWindowActive && trialType === "beta") detailedTier = "founder_trial";

        setState({
          loading: false,
          isPremium: hasPaidAccess || trialActive || founderWindowActive,
          tier,
          detailedTier,
          freeCurrent: profile?.free_current || "money",
          status: sub?.status || (isAdmin ? "owner" : null),
          cancelAtPeriodEnd: !!sub?.cancel_at_period_end,
          currentPeriodEnd: sub?.current_period_end || null,
          trialActive,
          trialType,
          trialEndsAt,
          trialDaysRemaining,
          founderWindowActive,
          founderDaysRemaining,
          isFoundingMember,
          hasPaidAccess,
          priceId: sub?.price_id || null,
        });
      } catch (err) {
        console.error("useSubscription load failed", err);
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      }
    }

    load();

    // Unique channel name per mount to avoid StrictMode / re-mount races
    // where Supabase reuses an already-subscribed channel and throws
    // "cannot add postgres_changes callbacks after subscribe()".
    const channelName = `sub-${user.id}-${Math.random().toString(36).slice(2, 10)}`;
    const channel = supabase
      .channel(channelName)
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
