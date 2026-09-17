import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useFounderSlots } from '@/hooks/useFounderSlots';
import { usePaddleCheckout } from '@/hooks/usePaddleCheckout';
import { clearSignupIntent, planToPriceId, readSignupIntent } from '@/lib/signupIntent';

/**
 * After sign-up, honours the plan the visitor picked on the marketing site:
 * saves the campaign tags on their profile and opens checkout for that plan.
 * `plan=free` just drops them into the app.
 */
export default function SignupIntentHandler() {
  const { user } = useAuth();
  const sub = useSubscription();
  const slots = useFounderSlots();
  const { openCheckout } = usePaddleCheckout();
  const handled = useRef(false);

  useEffect(() => {
    if (!user || handled.current || sub.loading) return;
    const intent = readSignupIntent();
    if (!intent) return;
    handled.current = true;

    const run = async () => {
      const patch: Record<string, string> = { signup_plan: intent.plan };
      if (intent.utmSource) patch.utm_source = intent.utmSource;
      if (intent.utmContent) patch.utm_content = intent.utmContent;
      try {
        await (supabase.from('profiles') as any).update(patch).eq('user_id', user.id);
      } catch {
        /* attribution is best-effort — never block the member */
      }

      const founding = sub.isFoundingMember || sub.founderWindowActive || !slots.soldOut;
      const priceId = planToPriceId(intent.plan, { founding });
      clearSignupIntent();

      if (!priceId || sub.isPremium) return;
      try {
        await openCheckout({
          priceId,
          customerEmail: user.email ?? undefined,
          userId: user.id,
          successUrl: `${window.location.origin}/?checkout=success`,
        });
      } catch {
        /* the member can still upgrade from the subscription page */
      }
    };

    void run();
  }, [user, sub.loading, sub.isFoundingMember, sub.founderWindowActive, sub.isPremium, slots.soldOut, openCheckout]);

  return null;
}
