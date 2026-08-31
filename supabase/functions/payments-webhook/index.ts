import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyWebhook, EventName, gatewayFetch, type PaddleEnv } from '../_shared/paddle.ts';
import { priceIdToTier, externalIdFrom, FOUNDING_LIFETIME_PRICE_ID } from './tiers.ts';

// Transaction webhook payloads sometimes omit `import_meta` on the inlined
// price object. Fetch the full price to recover the external_id.
async function fetchExternalId(paddlePriceId: string, env: PaddleEnv): Promise<string | null> {
  try {
    const res = await gatewayFetch(env, `/prices/${paddlePriceId}`);
    const json = await res.json();
    const ext = json?.data?.import_meta?.external_id;
    return typeof ext === 'string' && ext.length > 0 ? ext : null;
  } catch (e) {
    console.error('fetchExternalId failed', paddlePriceId, e);
    return null;
  }
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const env = (url.searchParams.get('env') || 'sandbox') as PaddleEnv;

  try {
    const event = await verifyWebhook(req, env);
    console.log('Received event:', event.eventType, 'env:', env);

    switch (event.eventType) {
      case EventName.SubscriptionCreated:
      case 'subscription.activated':
      case 'subscription.trialing':
        await handleSubscriptionCreated(event.data, env);
        break;
      case EventName.SubscriptionUpdated:
      case 'subscription.past_due':
      case 'subscription.paused':
      case 'subscription.resumed':
        await handleSubscriptionUpdated(event.data, env);
        break;
      case EventName.SubscriptionCanceled:
        await handleSubscriptionCanceled(event.data, env);
        break;
      case EventName.TransactionCompleted:
        await handleTransactionCompleted(event.data, env);
        break;
      case EventName.TransactionPaymentFailed:
        await handleTransactionPaymentFailed(event.data, env);
        break;
      default:
        console.log('Unhandled event:', event.eventType);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Webhook error:', e);
    return new Response('Webhook error', { status: 400 });
  }
});

async function handleSubscriptionCreated(data: any, env: PaddleEnv) {
  const { id, customerId, items, status, currentBillingPeriod, customData } = data;

  const userId = customData?.userId;
  if (!userId) {
    console.error('No userId in customData for subscription', id);
    return;
  }

  const item = items?.[0];
  if (!item) {
    console.error('Subscription has no items', id);
    return;
  }

  const priceId = externalIdFrom(item.price);
  const productId = externalIdFrom(item.product);
  if (!priceId || !productId) {
    console.warn('Skipping subscription: missing importMeta.externalId', {
      subscriptionId: id,
      rawPriceId: item.price?.id,
      rawProductId: item.product?.id,
    });
    return;
  }

  const tier = priceIdToTier(priceId);

  // Key on paddle_subscription_id so re-subscribing after a cancel inserts
  // a new row instead of overwriting the canceled one (preserves history).
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    paddle_subscription_id: id,
    paddle_customer_id: customerId,
    product_id: productId,
    price_id: priceId,
    status,
    current_period_start: currentBillingPeriod?.startsAt,
    current_period_end: currentBillingPeriod?.endsAt,
    environment: env,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'paddle_subscription_id' });

  // Founding Member badge is reserved for paid lifetime purchases only —
  // never granted from a subscription event.
  await supabase.from('profiles')
    .update({ subscription_tier: tier === 'free' ? 'premium' : tier, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
}

async function handleSubscriptionUpdated(data: any, env: PaddleEnv) {
  const { id, status, currentBillingPeriod, scheduledChange } = data;

  const { data: sub } = await supabase.from('subscriptions')
    .update({
      status,
      current_period_start: currentBillingPeriod?.startsAt,
      current_period_end: currentBillingPeriod?.endsAt,
      cancel_at_period_end: scheduledChange?.action === 'cancel',
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', id)
    .eq('environment', env)
    .select('user_id,current_period_end,price_id')
    .maybeSingle();

  if (sub?.user_id) {
    const periodStillOpen = !sub.current_period_end || new Date(sub.current_period_end) > new Date();
    // Grace period: active, trialing, past_due (Paddle retrying), and
    // canceled-but-paid-through all keep premium access until period_end.
    const active =
      ['active', 'trialing', 'past_due'].includes(status) ||
      (status === 'canceled' && periodStillOpen);
    const tier = active ? (priceIdToTier(sub.price_id) === 'free' ? 'premium' : priceIdToTier(sub.price_id)) : 'free';
    await supabase.from('profiles')
      .update({ subscription_tier: tier, updated_at: new Date().toISOString() })
      .eq('user_id', sub.user_id)
      .neq('subscription_tier', 'lifetime');
  }
}

async function handleSubscriptionCanceled(data: any, env: PaddleEnv) {
  const { data: sub } = await supabase.from('subscriptions')
    .update({ status: 'canceled', updated_at: new Date().toISOString() })
    .eq('paddle_subscription_id', data.id)
    .eq('environment', env)
    .select('user_id')
    .maybeSingle();

  if (sub?.user_id) {
    const periodStillOpen = data.currentBillingPeriod?.endsAt && new Date(data.currentBillingPeriod.endsAt) > new Date();
    if (!periodStillOpen) {
      await supabase.from('profiles')
        .update({ subscription_tier: 'free', updated_at: new Date().toISOString() })
        .eq('user_id', sub.user_id)
        .neq('subscription_tier', 'lifetime');
    }
  }
}

async function handleTransactionPaymentFailed(data: any, env: PaddleEnv) {
  console.log('Payment failed:', data.id, 'env:', env);
  const subscriptionId = data.subscriptionId;
  if (!subscriptionId) return;

  // Mark past_due — DO NOT downgrade profile tier here. The user keeps
  // premium until current_period_end so Paddle's dunning retries can run.
  // useSubscription respects the grace window.
  await supabase.from('subscriptions')
    .update({ status: 'past_due', updated_at: new Date().toISOString() })
    .eq('paddle_subscription_id', subscriptionId)
    .eq('environment', env);
}

async function handleTransactionCompleted(data: any, env: PaddleEnv) {
  // Handle one-time lifetime purchases (no subscription gets created for these).
  const { customerId, items, customData } = data;
  const userId = customData?.userId;
  if (!userId) return;

  const item = items?.[0];
  if (!item?.price) return;

  let priceId = externalIdFrom(item.price);
  if (!priceId && item.price?.id) {
    priceId = await fetchExternalId(item.price.id, env);
  }
  if (!priceId) {
    console.warn('Skipping transaction: missing price importMeta.externalId', {
      transactionId: data.id,
      rawPriceId: item.price?.id,
    });
    return;
  }

  const tier = priceIdToTier(priceId);
  if (tier !== 'lifetime') return;

  const lifetimeSubId = `lifetime_${data.id}`;
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    paddle_subscription_id: lifetimeSubId,
    paddle_customer_id: customerId,
    product_id: 'inner_wake_pro',
    price_id: priceId,
    status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: null,
    environment: env,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'paddle_subscription_id' });

  // Only the founding lifetime price grants the Founding Member badge.
  const isFoundingLifetime = priceId === FOUNDING_LIFETIME_PRICE_ID;
  await supabase.from('profiles')
    .update({
      subscription_tier: 'lifetime',
      ...(isFoundingLifetime ? { is_founding_member: true } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  // Claim a founding lifetime slot (only the founding price).
  if (isFoundingLifetime) {
    await supabase.from('founder_lifetime_slots').upsert({
      user_id: userId,
      paddle_subscription_id: lifetimeSubId,
      environment: env,
    }, { onConflict: 'user_id' });
  }
}
