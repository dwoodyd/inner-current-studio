import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { isBetaTester } from '@/lib/betaAccess';

/**
 * After a beta-code visitor signs up/in, upgrade their profile to a
 * 90-day "beta" trial. Idempotent — server function GREATEST()s the
 * end date so calling it twice never shortens the trial.
 *
 * Mount this once near the app root.
 */
export function useBetaTrialClaimer() {
  const { user } = useAuth();
  const claimedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (!isBetaTester()) return;
    if (claimedFor.current === user.id) return;

    claimedFor.current = user.id;
    supabase.rpc('grant_beta_trial', { user_uuid: user.id }).then(({ error }) => {
      if (error) console.warn('grant_beta_trial failed', error);
    });
  }, [user]);
}
