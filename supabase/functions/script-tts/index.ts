import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://esm.sh/zod@3.25.76";

const VOICE_ID = "M7wzTk2Y1hGQyRzr9sbS";
const MAX_TEXT_LENGTH = 2200;
const BodySchema = z.object({
  title: z.string().max(160).optional(),
  text: z.string().min(1).max(MAX_TEXT_LENGTH),
  environment: z.enum(["sandbox", "live"]).default("live"),
});

function getCorsHeaders(req: Request) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Vary": "Origin",
  };
}

async function hasPremiumAccess(userId: string, environment: string) {
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: profile } = await admin.from("profiles").select("subscription_tier").eq("user_id", userId).maybeSingle();
  if (profile?.subscription_tier === "premium" || profile?.subscription_tier === "lifetime") return true;
  const { data } = await admin.rpc("has_active_subscription", { user_uuid: userId, check_env: environment });
  return data === true;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Script text is required and must be under 4,800 characters." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!(await hasPremiumAccess(user.id, parsed.data.environment))) {
      return new Response(JSON.stringify({ error: "Premium access is required for audio playback." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) throw new Error("ElevenLabs is not configured yet.");

    const text = parsed.data.title ? `${parsed.data.title}.\n\n${parsed.data.text}` : parsed.data.text;
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_22050_32`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.62,
          similarity_boost: 0.8,
          style: 0.25,
          use_speaker_boost: true,
          speed: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs TTS error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Audio could not be prepared right now." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("script-tts error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Audio failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});