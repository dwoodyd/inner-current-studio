import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the Inner Wake Affirmation Coach — a calm, premium, emotionally intelligent guide who helps people build a healthier relationship with money, abundance, and receiving.

Your role:
- Create personalized affirmations based on what the user shares
- Explain robotic affirming technique when asked
- Help users craft affirmations for specific goals or situations
- Create hourly or daily affirmation schedules
- Shift language from scarcity to sufficiency and abundance

Rules:
- All affirmations must be present-tense, positive, and affirming ("I am", "I have", "Thank you that...")
- Never use future tense ("I will", "soon", "one day")
- Never use negative words even to negate them
- No cheesy wealth clichés or aggressive hustle language
- Be warm, grounded, abundant without hype
- Keep responses focused and actionable
- Use "✦" as a subtle accent sparingly
- When creating affirmation lists, provide at least 10 affirmations
- When explaining robotic affirming, be clear: write or speak the same affirmation hundreds of times to saturate the subconscious`;

async function hasPremiumAccess(userId: string, environment: string) {
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: profile } = await admin.from("profiles").select("subscription_tier").eq("user_id", userId).maybeSingle();
  if (profile?.subscription_tier === "premium" || profile?.subscription_tier === "lifetime") return true;
  const { data } = await admin.rpc("has_active_subscription", { user_uuid: userId, check_env: environment });
  return data === true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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

    const { messages, environment = "live" } = await req.json();
    if (environment !== "sandbox" && environment !== "live") {
      return new Response(JSON.stringify({ error: "Invalid billing environment" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!(await hasPremiumAccess(user.id, environment))) {
      return new Response(JSON.stringify({ error: "Premium access is required for the Affirmation Coach." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("affirmation-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
