import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getPaddleEnv } from '@/lib/paddle';
import { toast } from '@/hooks/use-toast';

/**
 * Safety net for a checkout whose webhook never landed.
 *
 * On return from Paddle (`?checkout=success`, with Paddle's own `_ptxn`
 * transaction id) we ask our backend to read the transaction straight from
 * Paddle and set the member's access from that — instead of trusting the
 * redirect or waiting on the webhook.
 */
export default function CheckoutReconciler() {
  const { user } = useAuth();
  const location = useLocation();
  const attempted = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') !== 'success') return;
    const transactionId = params.get('_ptxn') ?? params.get('transaction_id');
    if (!transactionId || attempted.current === transactionId) return;
    attempted.current = transactionId;

    const run = async () => {
      // Give the webhook a short head start; it is the normal path.
      await new Promise((r) => setTimeout(r, 2500));
      try {
        const { data, error } = await supabase.functions.invoke('reconcile-checkout', {
          body: { transactionId, environment: getPaddleEnv() },
        });
        if (error) throw error;
        if (data?.reconciled) {
          toast({ title: 'Your access is active', description: 'Thank you — everything is unlocked.' });
          // Refresh subscription state everywhere.
          window.dispatchEvent(new CustomEvent('iw:subscription-refresh'));
        }
      } catch (e) {
        console.error('checkout reconciliation failed', e);
      }
    };

    void run();
  }, [user, location.search]);

  return null;
}
