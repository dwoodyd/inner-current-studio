import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { DomainConfig } from '@/lib/domains';
import { recordPracticeFor } from '@/lib/currents/progress';

interface Opening {
  id?: string; position: number;
  desire: string; why_it_matters: string; desired_feeling: string;
  current_resistance: string; next_aligned_step: string;
}

const empty = (pos: number): Opening => ({
  position: pos, desire: '', why_it_matters: '', desired_feeling: '',
  current_resistance: '', next_aligned_step: '',
});

export default function DomainOpenings({ domain }: { domain: DomainConfig }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<Opening[]>([]);
  const [draft, setDraft] = useState<Opening | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('domain_openings')
        .select('id, domain, desire, why_it_matters, desired_feeling, current_resistance, next_aligned_step, position').eq('user_id', user.id).eq('domain', domain.key).order('position');
      if (data) setItems(data as any);
    })();
  }, [user, domain.key]);

  const save = async () => {
    if (!draft || !user) return;
    setSaving(true);
    const payload = { ...draft, user_id: user.id, domain: domain.key };
    const { data, error } = draft.id
      ? await supabase.from('domain_openings').update(payload).eq('id', draft.id).select().single()
      : await supabase.from('domain_openings').insert(payload).select().single();
    setSaving(false);
    if (error) { toast.error('Could not save'); return; }
    recordPracticeFor(domain.key);
    setItems(prev => {
      const without = prev.filter(p => p.id !== data.id);
      return [...without, data as any].sort((a, b) => a.position - b.position);
    });
    setDraft(null);
  };

  if (draft) {
    return (
      <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-5 safe-top">
        <button onClick={() => setDraft(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft size={18} strokeWidth={1.5} /><span className="text-sm">Back</span>
        </button>
        <h1 className="font-heading text-2xl text-foreground">Opening #{draft.position + 1}</h1>
        {domain.openingFields.map(f => (
          <div key={f.key} className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">{f.label}</label>
            <textarea value={(draft as any)[f.key]} onChange={e => setDraft({ ...draft, [f.key]: e.target.value })} placeholder={f.placeholder}
              className="w-full soul-card p-4 rounded-2xl bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
        ))}
        <button onClick={save} disabled={saving} className="w-full soul-glass-elevated py-4 rounded-2xl font-medium text-foreground disabled:opacity-40">
          {saving ? 'Saving…' : 'Save opening'}
        </button>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-6 safe-top">
      <button onClick={() => navigate(domain.route)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft size={18} strokeWidth={1.5} /><span className="text-sm">{domain.label}</span>
      </button>
      <div className="text-center space-y-2">
        <h1 className="font-heading text-2xl text-foreground">7 Openings</h1>
        <p className="text-sm text-muted-foreground">Define your top desires for this current.</p>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, i) => {
          const existing = items.find(x => x.position === i);
          return (
            <motion.button key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => setDraft(existing ?? empty(i))}
              className="soul-card w-full text-left p-4 rounded-2xl flex items-center gap-3 hover:bg-muted/10">
              <span className={`text-xs font-mono w-6 ${domain.accentClass}`}>{i + 1}</span>
              <span className="flex-1 text-sm text-foreground truncate">{existing?.desire || <span className="text-muted-foreground/50 italic">Empty</span>}</span>
              {existing ? <Pencil size={14} className="text-muted-foreground/50" /> : <Plus size={14} className="text-muted-foreground/50" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
