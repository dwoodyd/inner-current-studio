import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Loader2, RefreshCw, ShieldAlert, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { PRICE_DISPLAY } from '@/lib/pricing';
import { toast } from 'sonner';
import { rise, stagger } from '@/lib/motion';

type Stats = {
  total_slots: number;
  slots_claimed: number;
  slots_claimed_sandbox: number;
  founding_members: number;
  total_profiles: number;
  tiers: Record<string, number>;
  applications: Record<string, number>;
  active_subscriptions: Record<string, number>;
  recent_founders: { user_id: string; claimed_at: string; environment: string; display_name: string | null }[];
  recent_applications: { id: string; name: string; email: string; status: string; created_at: string }[];
};

const fmtDate = (s: string) => new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

function priceLabel(id: string) {
  return (PRICE_DISPLAY as Record<string, { amount: string; period: string; label: string }>)[id]?.label ?? id;
}

export default function FoundersDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('founders_dashboard');
      if (error) throw error;
      setStats(data as unknown as Stats);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Could not load founder stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  if (adminLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background px-6">
        <ShieldAlert size={48} className="text-destructive/60" />
        <h1 className="font-heading text-xl text-foreground">Access Denied</h1>
        <button onClick={() => navigate('/')} className="mt-2 text-sm text-primary underline">Go home</button>
      </div>
    );
  }

  const claimed = stats?.slots_claimed ?? 0;
  const total = stats?.total_slots ?? 100;
  const pct = Math.min(100, Math.round((claimed / total) * 100));

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-10 border-b border-border/20 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate('/admin')}
            aria-label="Back to admin"
            className="press -ml-2 min-h-[44px] min-w-[44px] rounded-xl p-2 hover:bg-card/60"
          >
            <ArrowLeft size={20} className="text-foreground/70" />
          </button>
          <div className="flex items-center gap-2">
            <Crown size={20} className="text-primary" />
            <h1 className="font-heading text-lg font-semibold text-foreground">Founders Dashboard</h1>
          </div>
          <button
            onClick={load}
            disabled={loading}
            aria-label="Refresh"
            className="press ml-auto min-h-[44px] min-w-[44px] rounded-xl p-2 hover:bg-card/60"
          >
            <RefreshCw size={16} className={`text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <motion.main
        variants={stagger()}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-2xl space-y-4 px-4 py-6 pb-28"
      >
        {loading && !stats ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
          </div>
        ) : stats ? (
          <>
            {/* Slot meter */}
            <motion.section variants={rise} className="soul-glass rounded-2xl p-5">
              <div className="flex items-baseline justify-between">
                <p className="text-xs uppercase tracking-widest text-muted-foreground/60">Lifetime founder slots</p>
                <p className="font-heading text-2xl text-foreground">{claimed}<span className="text-muted-foreground/50">/{total}</span></p>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-card/60">
                <div className="h-full rounded-full bg-primary/80 transition-[width] duration-700" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground/60">
                {total - claimed} remaining · {stats.slots_claimed_sandbox} test claims (not counted)
              </p>
            </motion.section>

            {/* Headline stats */}
            <motion.section variants={rise} className="grid grid-cols-3 gap-3">
              {[
                { label: 'Founding members', value: stats.founding_members, icon: Crown },
                { label: 'Total accounts', value: stats.total_profiles, icon: Users },
                { label: 'Active subs', value: Object.values(stats.active_subscriptions).reduce((a, b) => a + b, 0), icon: TrendingUp },
              ].map((s) => (
                <div key={s.label} className="soul-glass rounded-2xl p-4 text-center">
                  <s.icon size={18} className="mx-auto mb-2 text-primary/60" />
                  <p className="font-heading text-2xl font-semibold text-foreground">{s.value}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/60">{s.label}</p>
                </div>
              ))}
            </motion.section>

            {/* Plans */}
            <motion.section variants={rise} className="soul-glass space-y-2 rounded-2xl p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground/60">Active plans</p>
              {Object.keys(stats.active_subscriptions).length === 0 ? (
                <p className="text-sm text-muted-foreground/60">No active subscriptions yet.</p>
              ) : (
                Object.entries(stats.active_subscriptions).map(([id, n]) => (
                  <div key={id} className="flex items-center justify-between border-b border-border/10 py-2 last:border-0">
                    <span className="text-sm text-foreground">{priceLabel(id)}</span>
                    <span className="text-sm text-muted-foreground">{n}</span>
                  </div>
                ))
              )}
            </motion.section>

            {/* Tiers */}
            <motion.section variants={rise} className="soul-glass space-y-2 rounded-2xl p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground/60">Accounts by tier</p>
              {Object.entries(stats.tiers).map(([tier, n]) => (
                <div key={tier} className="flex items-center justify-between border-b border-border/10 py-2 last:border-0">
                  <span className="text-sm capitalize text-foreground">{tier.replace(/_/g, ' ')}</span>
                  <span className="text-sm text-muted-foreground">{n}</span>
                </div>
              ))}
            </motion.section>

            {/* Applications */}
            <motion.section variants={rise} className="soul-glass rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-muted-foreground/60">Applications</p>
                <button onClick={() => navigate('/admin/founding')} className="press text-xs text-primary">Review →</button>
              </div>
              <div className="mt-3 flex gap-2">
                {['pending', 'approved', 'rejected'].map((s) => (
                  <div key={s} className="flex-1 rounded-xl bg-card/50 p-3 text-center">
                    <p className="font-heading text-xl text-foreground">{stats.applications[s] ?? 0}</p>
                    <p className="text-[10px] capitalize text-muted-foreground/60">{s}</p>
                  </div>
                ))}
              </div>
              <ul className="mt-3 space-y-1">
                {stats.recent_applications.map((a) => (
                  <li key={a.id} className="flex items-center justify-between text-[12px]">
                    <span className="truncate text-foreground/80">{a.name} · {a.email}</span>
                    <span className="ml-2 shrink-0 text-muted-foreground/60">{fmtDate(a.created_at)}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            {/* Recent founders */}
            <motion.section variants={rise} className="soul-glass rounded-2xl p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground/60">Recent founders</p>
              {stats.recent_founders.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground/60">No lifetime slots claimed yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {stats.recent_founders.map((f) => (
                    <li key={f.user_id + f.claimed_at} className="flex items-center justify-between text-[12px]">
                      <span className="truncate text-foreground/80">
                        {f.display_name || f.user_id.slice(0, 8)}
                        {f.environment !== 'live' && <span className="ml-2 rounded bg-card/60 px-1.5 py-0.5 text-[10px] text-muted-foreground/70">test</span>}
                      </span>
                      <span className="ml-2 shrink-0 text-muted-foreground/60">{fmtDate(f.claimed_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>
          </>
        ) : null}
      </motion.main>
    </div>
  );
}
