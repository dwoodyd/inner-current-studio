// Sends a single test push to the calling user's active subscriptions.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import webpush from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Public VAPID key — matches src/lib/push.ts (safe to embed; it's served to the client).
const DEFAULT_VAPID_PUBLIC =
  'BMbnWNEhWEjRzwxSGbJD0TL_Wi3vC-u_vOVjUIcsuJRa97jDroq3h6M1ylvdBrT39m7Kt4RTxBLnFYHDzgJZiQ4';

let vapidConfigured = false;
function configureVapid(): { ok: true } | { ok: false; reason: string } {
  if (vapidConfigured) return { ok: true };
  const pub = Deno.env.get('VAPID_PUBLIC_KEY') || DEFAULT_VAPID_PUBLIC;
  const priv = Deno.env.get('VAPID_PRIVATE_KEY');
  const subject = Deno.env.get('VAPID_SUBJECT') || 'mailto:hello@innerwake.app';
  if (!priv) return { ok: false, reason: 'VAPID_PRIVATE_KEY is not configured' };
  try {
    webpush.setVapidDetails(subject, pub, priv);
    vapidConfigured = true;
    return { ok: true };
  } catch (e: any) {
    return { ok: false, reason: e?.message ?? 'invalid VAPID configuration' };
  }
}

const MESSAGES: Record<string, { title: string; body: string }[]> = {
  morning: [
    { title: 'Good morning', body: 'Before the day begins — where are you right now?' },
    { title: 'A new day', body: 'Start with one honest check-in. That changes everything.' },
  ],
  evening: [
    { title: 'Evening reflection', body: 'Before you rest — what moved through you today?' },
    { title: 'Settle in', body: "How are you landing tonight? There's no wrong answer." },
  ],
  return: [
    { title: 'A moment for you', body: 'Your inner current is waiting. Even one breath counts.' },
    { title: 'Still here', body: "Your rituals don't judge. They just hold space." },
  ],
  affirm: [
    { title: 'Time to affirm ✦', body: 'Money flows to me easily and effortlessly.' },
    { title: 'Affirm now ✦', body: 'I am a powerful money magnet.' },
    { title: 'Saturate your mind ✦', body: 'I manifest instantly and effortlessly.' },
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const vapid = configureVapid();
  if (!vapid.ok) {
    console.error('send-test-push: VAPID not configured —', vapid.reason);
    return new Response(JSON.stringify({ ok: false, error: vapid.reason }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }



  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: cerr } = await supabase.auth.getClaims(token);
    if (cerr || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claims.claims.sub;
    const body = await req.json().catch(() => ({}));
    const type = (body.type as string) || 'return';
    const msg = pick(MESSAGES[type] ?? MESSAGES.return);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: subs } = await admin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth_key')
      .eq('user_id', userId)
      .eq('active', true);

    let sent = 0;
    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } },
          JSON.stringify({ title: msg.title, body: msg.body, tag: `innerwake-${type}`, url: '/' })
        );
        sent++;
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await admin.from('push_subscriptions').update({ active: false }).eq('id', s.id);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, sent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? 'unknown' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
