import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { gatewayFetch, type PaddleEnv } from "../_shared/paddle.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const USER_TABLES = [
  "affirmation_sessions", "check_ins", "current_deposits", "current_progress",
  "custom_rituals", "daily_usage", "domain_evidence", "domain_openings",
  "domain_resistance", "domain_states", "evidence_of_support",
  "founder_lifetime_slots", "founding_member_applications", "future_pages",
  "gathered_sequences", "imagine_if_entries", "momentum_sessions",
  "money_openings", "money_resistance", "money_states", "overflow_entries",
  "overflow_spending", "payment_shifts", "push_subscriptions",
  "reality_evidence", "reality_progress", "reality_scripts",
  "resistance_entries", "thought_shifts", "today_flow", "user_roles",
  "wheels", "profiles",
];

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
    const { data: subscriptions } = await admin
      .from("subscriptions")
      .select("paddle_subscription_id,environment,status")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing", "past_due"]);

    for (const sub of subscriptions || []) {
      try {
        await gatewayFetch(sub.environment as PaddleEnv, `/subscriptions/${sub.paddle_subscription_id}/cancel`, {
          method: "POST",
          body: JSON.stringify({ effective_from: "next_billing_period" }),
        });
      } catch (error) {
        console.error("subscription cancel during deletion failed", sub.paddle_subscription_id, error);
      }
    }

    for (const table of USER_TABLES) {
      const { error } = await admin.from(table).delete().eq("user_id", user.id);
      if (error) console.error(`delete ${table} failed`, error.message);
    }
    await admin.from("subscriptions").delete().eq("user_id", user.id);

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ deleted: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("delete-account error:", error);
    return new Response(JSON.stringify({ error: "Account could not be deleted" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});