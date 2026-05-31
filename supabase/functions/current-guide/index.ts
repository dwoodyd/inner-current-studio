import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

const SYSTEM_PROMPT = `You are the Current Guide — a calm, emotionally precise companion within Inner Wake.

Your role:
- Help users locate their emotional state without judgment
- Offer gentle reframes, not advice or therapy
- Speak in short, spacious paragraphs — never walls of text
- Use metaphors of water, currents, seasons, and breath
- Never use aggressive motivation language
- Never reference Abraham-Hicks, "the Vortex," or any copyrighted frameworks
- You are original — your language comes from inner stillness, not self-help trends

Tone: Warm but not saccharine. Precise but not clinical. Like a wise friend who listens deeply.

When the user shares their emotional state context, acknowledge it naturally and respond to their actual message. Keep responses under 150 words unless they ask for more depth.`;

// Max payload sizes
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONTEXT_LENGTH = 500;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    // --- AUTH CHECK ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // --- INPUT VALIDATION ---
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Request body must be an object" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { messages, emotionalContext, environment = "live", currentSlug, voiceVocabulary, voiceAvoid } = body as Record<string, unknown>;

    if (environment !== "sandbox" && environment !== "live") {
      return new Response(JSON.stringify({ error: "Invalid billing environment" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    if (!(await hasPremiumAccess(user.id, environment))) {
      return new Response(JSON.stringify({ error: "Premium access is required for the Current Guide." }), {
        status: 403,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages must be a non-empty array" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    if (messages.length > MAX_MESSAGES) {
      return new Response(JSON.stringify({ error: `Too many messages (max ${MAX_MESSAGES})` }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Validate each message
    const validatedMessages: { role: string; content: string }[] = [];
    for (const msg of messages) {
      if (!msg || typeof msg !== "object" || !("role" in msg) || !("content" in msg)) {
        return new Response(JSON.stringify({ error: "Each message must have role and content" }), {
          status: 400,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      const { role, content } = msg as { role: string; content: string };
      if (role !== "user" && role !== "assistant") {
        return new Response(JSON.stringify({ error: "Message role must be 'user' or 'assistant'" }), {
          status: 400,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      if (typeof content !== "string" || content.length > MAX_MESSAGE_LENGTH) {
        return new Response(JSON.stringify({ error: `Message content must be a string under ${MAX_MESSAGE_LENGTH} chars` }), {
          status: 400,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      validatedMessages.push({ role, content });
    }

    let contextNote = "";
    if (emotionalContext != null) {
      if (typeof emotionalContext !== "string" || emotionalContext.length > MAX_CONTEXT_LENGTH) {
        return new Response(JSON.stringify({ error: `emotionalContext must be a string under ${MAX_CONTEXT_LENGTH} chars` }), {
          status: 400,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      contextNote = `\n\nUser's recent emotional context: ${emotionalContext}`;
    }

    // Per-current voice rails (additive — only when sent).
    const ALLOWED_SLUGS = new Set(["money", "self", "energy", "relationships", "health"]);
    let voiceNote = "";
    if (typeof currentSlug === "string" && ALLOWED_SLUGS.has(currentSlug)) {
      const vocab = Array.isArray(voiceVocabulary)
        ? (voiceVocabulary as unknown[]).filter((v) => typeof v === "string" && (v as string).length < 60).slice(0, 20)
        : [];
      const avoid = Array.isArray(voiceAvoid)
        ? (voiceAvoid as unknown[]).filter((v) => typeof v === "string" && (v as string).length < 60).slice(0, 20)
        : [];
      voiceNote = `\n\nThe user is working in the ${currentSlug} current. Tune the tone accordingly.`;
      if (vocab.length) voiceNote += `\nLean into vocabulary like: ${vocab.join(", ")}.`;
      if (avoid.length) voiceNote += `\nNever use these words or phrases: ${avoid.join(", ")}.`;
    }

    // --- AI CALL ---
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
          { role: "system", content: SYSTEM_PROMPT + contextNote + voiceNote },
          ...validatedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Take a breath and try again in a moment." }), {
          status: 429,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits in Settings." }), {
          status: 402,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Something went still. Try again." }), {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...getCorsHeaders(req), "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("current-guide error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
