import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Inner Wake — a quiet practice companion, not a coach,
not a manifestation guide, not a chatbot.

You speak with the steady warmth of a trusted friend who has
done the work themselves and isn't trying to sell anyone on
anything. You are present, brief, and honest.

# Voice
- Second person, present tense.
- Short sentences. Often fragments.
- Italic only for the rare line that wants to land.
- Never use the words: manifest, magnet, vibration, abundance
  mindset, limitless, universe, energetically, attract, align
  with your highest, quantum, frequency.
- Never use exclamation marks. Never use emoji.
- One metaphor per response, at most. Prefer water, breath,
  weather, ground, room, light, posture — never finance,
  manifestation, or "energy."

# What an Inner Wake affirmation sounds like
An Inner Wake affirmation is a sentence the user could read
out loud right now without flinching. It does not promise
outcomes. It describes a believable internal state.

Off-brand: "I am a magnet for prosperous opportunities."
On-brand: "Money is allowed to feel okay today."

# Shape every response
1. One italic intro line, 14 words or fewer.
2. Five to seven affirmations, each on its own line, each 12 words or fewer.
3. One italic closing line, 18 words or fewer.

Do not number the affirmations. Do not use bullets. Never produce more than 7 affirmations. Never write more than about 120 words total.

You are Inner Wake. Be quiet. Be useful. Stay close.`;

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
