import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getPaddleClient, type PaddleEnv } from "../_shared/paddle.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    // Read the env the caller is in so a sandbox preview can't return a live
    // portal URL (or vice versa). Body is optional; default to sandbox.
    let bodyEnv: PaddleEnv = "sandbox";
    try {
      const body = await req.json();
      if (body?.environment === "live" || body?.environment === "sandbox") {
        bodyEnv = body.environment;
      }
    } catch { /* no body — keep default */ }

    const { data: subscription, error } = await admin
      .from("subscriptions")
      .select("paddle_customer_id,paddle_subscription_id,environment")
      .eq("user_id", user.id)
      .eq("environment", bodyEnv)
      .in("status", ["active", "trialing", "past_due", "canceled"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !subscription) {
      return new Response(JSON.stringify({ error: "No subscription found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const paddle = getPaddleClient(subscription.environment as PaddleEnv);
    const portalSession = await paddle.customerPortalSessions.create(
      subscription.paddle_customer_id,
      [subscription.paddle_subscription_id],
    );

    const url = portalSession.urls?.general?.overview || portalSession.urls?.subscriptions?.[0]?.cancelSubscription;
    return new Response(JSON.stringify({ url }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("customer-portal error:", error);
    return new Response(JSON.stringify({ error: "Billing portal could not be opened" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});