import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Loader2, Mail, ShieldAlert, X, MessageSquare, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from 'sonner';

type AppRow = {
  id: string;
  user_id: string | null;
  email: string;
  name: string;
  current_focus: string | null;
  why: string;
  practice_context: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_at: string | null;
  notes: string | null;
  created_at: string;
};

const STATUS_FILTERS = ['pending', 'approved', 'rejected', 'all'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function FoundingApplications() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [rows, setRows] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [busy, setBusy] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('founding_member_applications')
        .select('id, user_id, name, email, current_focus, practice_context, why, status, notes, reviewed_at, reviewed_by, created_at, updated_at')
        .order('created_at', { ascending: false });
      if (filter !== 'all') query = query.eq('status', filter);
      const { data, error } = await query;
      if (error) throw error;
      setRows((data ?? []) as AppRow[]);
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not load applications.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (isAdmin) fetchRows();
  }, [isAdmin, fetchRows]);

  const review = async (row: AppRow, status: 'approved' | 'rejected') => {
    setBusy(row.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('founding_member_applications')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id ?? null,
          notes: noteDraft[row.id] ?? row.notes ?? null,
        })
        .eq('id', row.id);
      if (error) throw error;
      toast.success(`Marked ${status}.`);
      fetchRows();
    } catch (e: any) {
      toast.error(e?.message ?? 'Update failed.');
    } finally {
      setBusy(null);
    }
  };

  if (adminLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background gap-4 px-6">
        <ShieldAlert size={48} className="text-destructive/60" />
        <h1 className="font-heading text-xl text-foreground">Access denied</h1>
        <button onClick={() => navigate('/')} className="text-sm text-primary underline">Go home</button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border/20">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
          <button onClick={() => navigate('/admin')} className="p-2 -ml-2 rounded-xl hover:bg-card/60 transition-colors">
            <ArrowLeft size={20} className="text-foreground/70" />
          </button>
          <h1 className="font-heading text-lg font-semibold text-foreground">Founding Applications</h1>
          <button
            onClick={fetchRows}
            disabled={loading}
            className="ml-auto p-2 rounded-xl hover:bg-card/60 transition-colors"
          >
            <RefreshCw size={16} className={`text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-28">
        <div className="flex gap-2 overflow-x-auto">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition-colors ${
                filter === f
                  ? 'border-primary/40 bg-primary/15 text-foreground'
                  : 'border-border/30 bg-card/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
          </div>
        ) : rows.length === 0 ? (
          <div className="soul-glass rounded-2xl px-5 py-12 text-center text-sm text-muted-foreground">
            No applications {filter !== 'all' ? `in "${filter}"` : 'yet'}.
          </div>
        ) : (
          <AnimatePresence>
            {rows.map((row, i) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="soul-glass rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-heading text-base text-foreground truncate">{row.name}</p>
                    <a
                      href={`mailto:${row.email}`}
                      className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
                    >
                      <Mail size={11} /> {row.email}
                    </a>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
                      {new Date(row.created_at).toLocaleString()}
                      {row.current_focus ? ` · Focus: ${row.current_focus}` : ''}
                    </p>
                  </div>
                  <StatusBadge status={row.status} />
                </div>

                <div className="space-y-2 text-sm">
                  <Block label="Why now">{row.why}</Block>
                  {row.practice_context && <Block label="Practice context">{row.practice_context}</Block>}
                  {row.notes && <Block label="Review notes">{row.notes}</Block>}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    <MessageSquare size={10} /> Add note (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={noteDraft[row.id] ?? ''}
                    onChange={(e) => setNoteDraft({ ...noteDraft, [row.id]: e.target.value })}
                    className="iw-input resize-none text-xs"
                    placeholder="Internal note saved with the decision"
                  />
                </div>

                {row.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => review(row, 'approved')}
                      disabled={busy === row.id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/15 px-3 py-2 text-xs text-primary hover:bg-primary/25 disabled:opacity-50"
                    >
                      {busy === row.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      Approve
                    </button>
                    <button
                      onClick={() => review(row, 'rejected')}
                      disabled={busy === row.id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/30 bg-card/40 px-3 py-2 text-xs text-muted-foreground hover:bg-card/60 disabled:opacity-50"
                    >
                      <X size={12} />
                      Reject
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">{children}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: AppRow['status'] }) {
  const map = {
    pending: 'border-amber-400/30 bg-amber-400/10 text-amber-300/90',
    approved: 'border-primary/30 bg-primary/15 text-primary',
    rejected: 'border-border/30 bg-muted/30 text-muted-foreground',
  } as const;
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] ${map[status]}`}>
      {status}
    </span>
  );
}
