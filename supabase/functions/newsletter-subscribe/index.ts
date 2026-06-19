import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const AUDIENCE_ID = '859bea40-a95c-468d-baf9-8697922e68a6';
const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

const BodySchema = z.object({
  email: z.string().trim().email().max(255),
  source: z.string().trim().max(64).optional(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { email, source } = parsed.data;

    const response = await fetch(
      `${GATEWAY_URL}/audiences/${AUDIENCE_ID}/contacts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          'X-Connection-Api-Key': RESEND_API_KEY,
        },
        body: JSON.stringify({
          email,
          unsubscribed: false,
          // Resend accepts unknown fields silently; tag the source for our own debugging
          first_name: source ? `[${source}]` : undefined,
        }),
      },
    );

    const data = await response.json().catch(() => ({}));

    // Resend returns 200 for new contacts; duplicates also return success-shaped responses.
    // Treat any non-2xx as soft error but don't leak provider details.
    if (!response.ok) {
      console.error('Resend audience add failed', response.status, data);
      return new Response(JSON.stringify({ error: 'Could not subscribe right now' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('newsletter-subscribe error', err);
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
