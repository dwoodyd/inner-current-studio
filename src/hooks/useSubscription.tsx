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

// Shared cache — many components read subscription state; collapse to one fetch.
type CacheKey = string; // `${userId}:${env}:${ownerAccess}`
let cachedKey: CacheKey | null = null;
let cachedState: SubscriptionState | null = null;
let inflight: Promise<SubscriptionState> | null = null;
const subscribers = new Set<() => void>();

function computeState(
  sub: any,
  profile: any,
  adminRole: any,
  ownerAccess: boolean,
): SubscriptionState {
  const isAdmin = !!adminRole;
  const isOwner = ownerAccess || isAdmin;
  const periodStillOpen = !sub?.current_period_end || new Date(sub.current_period_end) > new Date();
  const active =
    sub &&
    (["active", "trialing", "past_due"].includes(sub.status) ||
      (sub.status === "canceled" && periodStillOpen)) &&
    periodStillOpen;

  const baseTier = (profile?.subscription_tier as SubscriptionState["tier"]) || "free";
  const tier: SubscriptionState["tier"] = isOwner ? "lifetime" : baseTier;
  const hasPaidAccess = isOwner || !!active || tier === "lifetime" || tier === "premium";

  const trialEndsAt = profile?.trial_ends_at || null;
  const trialActive = !isOwner && !!trialEndsAt && new Date(trialEndsAt) > new Date();
  const trialDaysRemaining = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  const trialType = (profile?.trial_type as "standard" | "beta") || null;
  const founderEndsAt = profile?.founder_window_ends_at || null;
  const founderWindowActive = !isOwner && !!founderEndsAt && new Date(founderEndsAt) > new Date();
  const founderDaysRemaining = founderEndsAt
    ? Math.max(0, Math.ceil((new Date(founderEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  const isFoundingMember = isOwner || !!profile?.is_founding_member;

  let detailedTier: DetailedTier = "free";
  if (isOwner || tier === "lifetime") detailedTier = "lifetime";
  else if (tier === "premium" && sub?.price_id) {
    const mapped = priceIdToTier(sub.price_id);
    detailedTier = mapped === "free" ? "pro_monthly" : (mapped as DetailedTier);
  } else if (founderWindowActive && trialType === "beta") detailedTier = "founder_trial";

  return {
    loading: false,
    isPremium: hasPaidAccess || trialActive || founderWindowActive,
    tier,
    detailedTier,
    freeCurrent: profile?.free_current || "money",
    status: sub?.status || (isOwner ? "owner" : null),
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
  };
}

async function loadState(userId: string, env: string, ownerAccess: boolean): Promise<SubscriptionState> {
  const [{ data: sub }, { data: profile }, { data: adminRole }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("status,cancel_at_period_end,current_period_end,product_id,price_id")
      .eq("user_id", userId)
      .eq("environment", env)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("subscription_tier,free_current,trial_ends_at,trial_type,founder_window_ends_at,is_founding_member")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle(),
  ]);
  return computeState(sub, profile, adminRole, ownerAccess);
}

function fetchShared(userId: string, env: string, ownerAccess: boolean): Promise<SubscriptionState> {
  const key: CacheKey = `${userId}:${env}:${ownerAccess}`;
  if (cachedKey === key && cachedState) return Promise.resolve(cachedState);
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const state = await loadState(userId, env, ownerAccess);
      cachedKey = key;
      cachedState = state;
      subscribers.forEach((fn) => fn());
      return state;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

let realtimeUserId: string | null = null;
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

function ensureRealtime(userId: string, env: string, ownerAccess: boolean) {
  if (realtimeUserId === userId && realtimeChannel) return;
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
  realtimeUserId = userId;
  const channelName = `sub-${userId}-${Math.random().toString(36).slice(2, 10)}`;
  realtimeChannel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${userId}` },
      () => {
        cachedKey = null;
        fetchShared(userId, env, ownerAccess);
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "profiles", filter: `user_id=eq.${userId}` },
      () => {
        cachedKey = null;
        fetchShared(userId, env, ownerAccess);
      }
    )
    .subscribe();
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  // Elevated access is decided server-side by the admin role in user_roles.
  const ownerAccess = false;
  const env = getPaddleEnv();
  const key = user ? `${user.id}:${env}:${ownerAccess}` : null;

  const [state, setState] = useState<SubscriptionState>(() => {
    if (key && cachedKey === key && cachedState) return cachedState;
    return {
      loading: !!user,
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
    };
  });

  useEffect(() => {
    if (!user) {
      cachedKey = null;
      cachedState = null;
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
        realtimeUserId = null;
      }
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    let mounted = true;
    const sync = () => {
      if (!mounted) return;
      if (cachedKey === key && cachedState) setState(cachedState);
    };
    subscribers.add(sync);
    fetchShared(user.id, env, ownerAccess).then(sync);
    ensureRealtime(user.id, env, ownerAccess);

    return () => {
      mounted = false;
      subscribers.delete(sync);
    };
  }, [user, env, ownerAccess, key]);

  return state;
}
