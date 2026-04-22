/**
 * Web Push subscription helpers — registers a service worker, subscribes the
 * browser to the push service, and syncs the subscription + preferences with
 * the backend so the server can deliver notifications even when the app is
 * closed.
 */
import { supabase } from '@/integrations/supabase/client';

// Public VAPID key — safe to expose in the client bundle.
const VAPID_PUBLIC_KEY =
  'BMbnWNEhWEjRzwxSGbJD0TL_Wi3vC-u_vOVjUIcsuJRa97jDroq3h6M1ylvdBrT39m7Kt4RTxBLnFYHDzgJZiQ4';

export interface PushPrefs {
  morning_reminder: boolean;
  morning_time: string;
  evening_reflection: boolean;
  evening_time: string;
  gentle_returns: boolean;
  return_interval_hours: number;
  affirmation_interval_minutes: number;
}

export const hasPushSupport = (): boolean =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

export const hasServiceWorkerSupport = (): boolean =>
  typeof window !== 'undefined' && 'serviceWorker' in navigator;

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; ++i) view[i] = raw.charCodeAt(i);
  return buffer;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!hasServiceWorkerSupport()) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch (e) {
    console.warn('SW registration failed', e);
    return null;
  }
}

export async function subscribeAndSync(prefs: PushPrefs): Promise<boolean> {
  if (!hasPushSupport()) return false;

  const reg = await registerServiceWorker();
  if (!reg) return false;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    try {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    } catch (e) {
      console.warn('Push subscribe failed', e);
      return false;
    }
  }

  const json = sub.toJSON();
  const endpoint = json.endpoint!;
  const p256dh = json.keys?.p256dh ?? '';
  const auth = json.keys?.auth ?? '';

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Upsert by endpoint (unique per browser/device).
  const { data: existing } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)
    .maybeSingle();

  const payload = {
    user_id: user.id,
    endpoint,
    p256dh,
    auth_key: auth,
    active: true,
    ...prefs,
  };

  if (existing) {
    await supabase.from('push_subscriptions').update(payload).eq('id', existing.id);
  } else {
    await supabase.from('push_subscriptions').insert(payload);
  }

  return true;
}

export async function updatePushPrefs(prefs: Partial<PushPrefs>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('push_subscriptions')
    .update(prefs)
    .eq('user_id', user.id);
}

export async function unsubscribePush(): Promise<void> {
  if (!hasPushSupport()) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    const endpoint = sub.endpoint;
    await sub.unsubscribe();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('push_subscriptions')
        .update({ active: false })
        .eq('user_id', user.id)
        .eq('endpoint', endpoint);
    }
  }
}

export async function sendTestPush(type: 'morning' | 'evening' | 'return' | 'affirm'): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke('send-test-push', {
    body: { type },
  });
  if (error) {
    console.warn('Test push failed', error);
    return false;
  }
  return !!data?.ok;
}
