// Sends a single test push to the calling user's active subscriptions.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import webpush from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:hello@innerwake.app';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

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
