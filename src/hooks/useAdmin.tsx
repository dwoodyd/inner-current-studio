import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Shared cache so many components asking "am I admin?" collapse to one query.
let cache: { userId: string; isAdmin: boolean } | null = null;
let inflight: Promise<boolean> | null = null;
const subs = new Set<() => void>();

function fetchAdmin(userId: string): Promise<boolean> {
  if (cache && cache.userId === userId) return Promise.resolve(cache.isAdmin);
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      const isAdmin = !!data;
      cache = { userId, isAdmin };
      subs.forEach((fn) => fn());
      return isAdmin;
    } catch {
      return false;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(
    cache && user && cache.userId === user.id ? cache.isAdmin : false
  );
  const [loading, setLoading] = useState(!cache || !user || cache.userId !== user.id);

  useEffect(() => {
    if (!user) {
      cache = null;
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    if (cache && cache.userId !== user.id) cache = null;

    let mounted = true;
    const update = () => {
      if (!mounted) return;
      if (cache && cache.userId === user.id) {
        setIsAdmin(cache.isAdmin);
        setLoading(false);
      }
    };
    subs.add(update);
    fetchAdmin(user.id).then(() => update());

    return () => {
      mounted = false;
      subs.delete(update);
    };
  }, [user]);

  return { isAdmin, loading };
}
