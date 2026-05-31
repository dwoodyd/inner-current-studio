import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const TOTAL_SLOTS = 100;

export function useFounderSlots() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase.rpc("founder_slots_remaining");
      if (cancelled) return;
      if (!error && typeof data === "number") setRemaining(data);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return {
    loading,
    remaining,
    total: TOTAL_SLOTS,
    claimed: remaining != null ? TOTAL_SLOTS - remaining : null,
    soldOut: remaining === 0,
  };
}
