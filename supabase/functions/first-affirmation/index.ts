import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are the Inner Wake first-affirmation oracle. Given a person's chosen Current name, the feeling they're carrying right now, and the feeling they want to move toward, write ONE single affirmation that meets ALL of these rules:

- Present tense, first person ("I am", "I have", "I feel")
- 8 to 16 words
- Specific to what they shared (use their feeling language)
- No negative words at all (no "not", "don't", "stop", "release", "let go", "away from")
- No clichés ("you've got this", "everything happens for a reason")
- No exclamation marks. Quiet, grounded tone.
- Beautiful, slightly poetic — like a single line of a private prayer

Return ONLY the affirmation text. No quotes, no explanation, no preamble.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companionName, carrying, wanting } = await req.json();

    if (!companionName || !carrying || !wanting) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    const userPrompt = `My Current is named "${companionName}". I'm carrying: ${carrying}. I want to feel: ${wanting}.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('AI gateway error:', response.status, text);
      return new Response(JSON.stringify({
        affirmation: `I am held by something steady within me, even now.`,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const affirmation = data.choices?.[0]?.message?.content?.trim()
      || `I am held by something steady within me, even now.`;

    return new Response(JSON.stringify({ affirmation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('first-affirmation error:', e);
    return new Response(JSON.stringify({
      affirmation: `I am held by something steady within me, even now.`,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
