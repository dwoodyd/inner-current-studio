// Cron-driven push scheduler — runs every minute and dispatches notifications
// based on each subscription's preferences (morning, evening, gentle returns,
// hourly affirmations).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import webpush from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Public VAPID key — matches src/lib/push.ts (safe to embed; it's served to the client).
const DEFAULT_VAPID_PUBLIC =
  'BDl5RUS1cQKYB-WQ13SYMnFH3pY2zgvRIzPVzte-hmiXZryUuYORdGgCty8HT0bzGUWPoRz_G4qi9GxZ8SNFl7Y';

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

const MORNING = [
  { title: 'Good morning', body: 'Before the day begins — where are you right now?' },
  { title: 'A new day', body: 'Start with one honest check-in. That changes everything.' },
  { title: 'Morning current', body: 'What feels present this morning? Your practice is ready.' },
];
const EVENING = [
  { title: 'Evening reflection', body: 'Before you rest — what moved through you today?' },
  { title: 'Day closing', body: 'A quiet moment of reflection before the day ends.' },
  { title: 'Settle in', body: "How are you landing tonight? There's no wrong answer." },
];
const RETURNS = [
  { title: 'A moment for you', body: 'Your inner current is waiting. Even one breath counts.' },
  { title: 'Gentle check-in', body: 'How are you feeling right now? Take a moment to notice.' },
  { title: 'Still here', body: "Your rituals don't judge. They just hold space." },
];
const AFFIRMS = [
  { title: 'Time to affirm ✦', body: 'Money flows to me easily and effortlessly.' },
  { title: 'Affirm now ✦', body: 'I am a powerful money magnet.' },
  { title: 'Your reminder ✦', body: 'Everything always works out in my favor.' },
  { title: 'Affirmation time ✦', body: 'I receive large sums of money regularly.' },
  { title: 'Saturate your mind ✦', body: 'I manifest instantly and effortlessly.' },
];

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

interface Sub {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
  morning_reminder: boolean;
  morning_time: string;
  evening_reflection: boolean;
  evening_time: string;
  gentle_returns: boolean;
  return_interval_hours: number;
  affirmation_interval_minutes: number;
  updated_at: string;
}

function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const vapid = configureVapid();
  if (!vapid.ok) {
    console.error('push-scheduler: VAPID not configured —', vapid.reason);
    return new Response(JSON.stringify({ ok: false, error: vapid.reason }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }



  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: subs, error } = await admin
    .from('push_subscriptions')
    .select('*')
    .eq('active', true);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const minute = nowHHMM();
  const nowMs = Date.now();
  let dispatched = 0;

  for (const s of (subs ?? []) as Sub[]) {
    const toSend: { title: string; body: string; tag: string }[] = [];

    if (s.morning_reminder && s.morning_time === minute) {
      const m = pick(MORNING);
      toSend.push({ ...m, tag: 'morning' });
    }
    if (s.evening_reflection && s.evening_time === minute) {
      const m = pick(EVENING);
      toSend.push({ ...m, tag: 'evening' });
    }

    const lastUpdate = new Date(s.updated_at).getTime();
    const hoursSince = (nowMs - lastUpdate) / 3_600_000;

    if (s.gentle_returns && s.return_interval_hours > 0 && hoursSince >= s.return_interval_hours) {
      const m = pick(RETURNS);
      toSend.push({ ...m, tag: 'return' });
    }

    if (s.affirmation_interval_minutes && s.affirmation_interval_minutes > 0) {
      const minutesSince = (nowMs - lastUpdate) / 60_000;
      if (minutesSince >= s.affirmation_interval_minutes) {
        const m = pick(AFFIRMS);
        toSend.push({ ...m, tag: 'affirm' });
      }
    }

    for (const msg of toSend) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } },
          JSON.stringify({ title: msg.title, body: msg.body, tag: `innerwake-${msg.tag}`, url: '/' })
        );
        dispatched++;
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await admin.from('push_subscriptions').update({ active: false }).eq('id', s.id);
        }
      }
    }

    if (toSend.length > 0) {
      await admin
        .from('push_subscriptions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', s.id);
    }
  }

  return new Response(JSON.stringify({ ok: true, dispatched }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
