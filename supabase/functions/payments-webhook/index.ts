import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyWebhook, EventName, type PaddleEnv } from '../_shared/paddle.ts';

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
    console.error('No userId in customData');
    return;
  }

  const item = items[0];
  const priceId = item.price.importMeta?.externalId || item.price.id;
  const productId = item.product.importMeta?.externalId || item.product.id;

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
  }, { onConflict: 'user_id,environment' });

  // Mark profile as premium
  await supabase.from('profiles')
    .update({ subscription_tier: 'premium', updated_at: new Date().toISOString() })
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
    .select('user_id,current_period_end')
    .maybeSingle();

  if (sub?.user_id) {
    const periodStillOpen = !sub.current_period_end || new Date(sub.current_period_end) > new Date();
    const tier = ['active', 'trialing'].includes(status) || (status === 'canceled' && periodStillOpen) ? 'premium' : 'free';
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

  await supabase.from('subscriptions')
    .update({ status: 'past_due', updated_at: new Date().toISOString() })
    .eq('paddle_subscription_id', subscriptionId)
    .eq('environment', env);
}

async function handleTransactionCompleted(data: any, env: PaddleEnv) {
  // Handle one-time lifetime purchases (no subscription)
  const { customerId, items, customData } = data;
  const userId = customData?.userId;
  if (!userId) return;

  const item = items[0];
  const priceId = item.price?.importMeta?.externalId || item.price?.id;

  // Lifetime: upsert as a permanent active subscription with no end date
  if (priceId === 'premium_lifetime' || priceId === 'premium_lifetime_149') {
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      paddle_subscription_id: `lifetime_${data.id}`,
      paddle_customer_id: customerId,
      product_id: 'inner_wake_lifetime',
      price_id: priceId,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: null,
      environment: env,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,environment' });

    await supabase.from('profiles')
      .update({ subscription_tier: 'lifetime', updated_at: new Date().toISOString() })
      .eq('user_id', userId);
  }
}
