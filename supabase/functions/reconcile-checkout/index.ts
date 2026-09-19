import { createClient } from 'npm:@supabase/supabase-js@2';
import { gatewayFetch, type PaddleEnv } from '../_shared/paddle.ts';

// Mirrors supabase/functions/payments-webhook/tiers.ts (edge functions cannot
// import across function folders).
const FOUNDING_LIFETIME_PRICE_ID = 'iw_pro_lifetime_founding';

function priceIdToTier(priceId: string | undefined | null): 'premium' | 'lifetime' | 'free' {
  if (!priceId) return 'free';
  if (
    priceId.includes('lifetime') ||
    priceId === 'premium_lifetime' ||
    priceId === 'premium_lifetime_149'
  ) return 'lifetime';
  if (priceId.includes('monthly') || priceId.includes('annual') || priceId.includes('yearly')) {
    return 'premium';
  }
  return 'free';
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Content-Type': 'application/json',
};

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

async function externalIdForPrice(paddlePriceId: string, env: PaddleEnv): Promise<string | null> {
  const res = await gatewayFetch(env, `/prices/${paddlePriceId}`);
  const j = await res.json();
  const ext = j?.data?.import_meta?.external_id;
  return typeof ext === 'string' && ext.length > 0 ? ext : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    // Identify the caller from their JWT — we only ever grant access to them.
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    const { data: userData } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (!user) return json({ error: 'Not authenticated' }, 401);

    const { transactionId, environment } = await req.json();
    const env = (environment === 'live' ? 'live' : 'sandbox') as PaddleEnv;
    if (!transactionId || typeof transactionId !== 'string') {
      return json({ error: 'transactionId required' }, 400);
    }

    const res = await gatewayFetch(env, `/transactions/${encodeURIComponent(transactionId)}`);
    const body = await res.json();
    const tx = body?.data;
    if (!tx) return json({ error: 'Transaction not found', reconciled: false }, 404);

    // Only trust a transaction that Paddle itself reports as paid, and that
    // carries this user's id in custom_data.
    const paid = ['completed', 'paid', 'billed'].includes(tx.status);
    const txUserId = tx.custom_data?.userId ?? tx.custom_data?.user_id;
    if (!paid) return json({ reconciled: false, reason: `status:${tx.status}` });
    if (txUserId && txUserId !== user.id) return json({ error: 'Transaction belongs to another account' }, 403);

    const item = tx.items?.[0];
    const rawPriceId = item?.price?.id;
    let priceId: string | null = item?.price?.import_meta?.external_id ?? null;
    if (!priceId && rawPriceId) priceId = await externalIdForPrice(rawPriceId, env);
    if (!priceId) return json({ reconciled: false, reason: 'missing_external_id' });

    const tier = priceIdToTier(priceId);
    if (tier === 'free') return json({ reconciled: false, reason: 'non_paid_price' });

    const subscriptionId: string | null = tx.subscription_id ?? null;
    const paddleSubId = subscriptionId ?? `lifetime_${tx.id}`;

    let currentPeriodStart: string | null = tx.billed_at ?? new Date().toISOString();
    let currentPeriodEnd: string | null = null;
    let status = 'active';

    if (subscriptionId) {
      const subRes = await gatewayFetch(env, `/subscriptions/${subscriptionId}`);
      const subBody = await subRes.json();
      const sub = subBody?.data;
      if (sub) {
        status = sub.status ?? 'active';
        currentPeriodStart = sub.current_billing_period?.starts_at ?? currentPeriodStart;
        currentPeriodEnd = sub.current_billing_period?.ends_at ?? null;
      }
    }

    await admin.from('subscriptions').upsert(
      {
        user_id: user.id,
        paddle_subscription_id: paddleSubId,
        paddle_customer_id: tx.customer_id,
        product_id: item?.price?.product_id ?? 'inner_wake_pro',
        price_id: priceId,
        status,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        environment: env,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'paddle_subscription_id' },
    );

    const isFoundingLifetime = priceId === FOUNDING_LIFETIME_PRICE_ID;
    await admin
      .from('profiles')
      .update({
        subscription_tier: tier,
        ...(isFoundingLifetime ? { is_founding_member: true } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (isFoundingLifetime) {
      await admin.from('founder_lifetime_slots').upsert(
        { user_id: user.id, paddle_subscription_id: paddleSubId, environment: env },
        { onConflict: 'user_id' },
      );
    }

    return json({ reconciled: true, tier, priceId, environment: env });
  } catch (e) {
    console.error('reconcile-checkout error', e);
    return json({ error: String(e), reconciled: false }, 500);
  }
});
