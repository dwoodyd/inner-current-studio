import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, ChevronRight, Check, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Opening {
  id?: string;
  desire: string;
  why_it_matters: string;
  desired_feeling: string;
  current_resistance: string;
  next_aligned_step: string;
  position: number;
}

const EMPTY_OPENING: Omit<Opening, 'position'> = {
  desire: '', why_it_matters: '', desired_feeling: '', current_resistance: '', next_aligned_step: '',
};

const FIELDS = [
  { key: 'desire', label: 'The desire', placeholder: 'What do you want?' },
  { key: 'why_it_matters', label: 'Why it matters', placeholder: 'Why does this matter to you?' },
  { key: 'desired_feeling', label: 'Desired feeling', placeholder: 'How would having this feel?' },
  { key: 'current_resistance', label: 'Current resistance', placeholder: 'What resistance comes up?' },
  { key: 'next_aligned_step', label: 'Next aligned step', placeholder: 'One thing you could do toward this' },
] as const;

export default function MoneyOpenings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Omit<Opening, 'position'>>(EMPTY_OPENING);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('money_openings')
      .select('id, desire, why_it_matters, desired_feeling, current_resistance, next_aligned_step, position')
      .eq('user_id', user.id)
      .order('position', { ascending: true })
      .then(({ data }) => {
        if (data) setOpenings(data.map((d) => ({
          id: d.id,
          desire: d.desire,
          why_it_matters: d.why_it_matters,
          desired_feeling: d.desired_feeling,
          current_resistance: d.current_resistance,
          next_aligned_step: d.next_aligned_step,
          position: d.position,
        })));
        setLoading(false);
      });
  }, [user]);

  const startNew = () => {
    if (openings.length >= 7) {
      toast('You already have 7 openings — the maximum.');
      return;
    }
    setDraft(EMPTY_OPENING);
    setEditing(openings.length);
  };

  const startEdit = (idx: number) => {
    const o = openings[idx];
    setDraft({ desire: o.desire, why_it_matters: o.why_it_matters, desired_feeling: o.desired_feeling, current_resistance: o.current_resistance, next_aligned_step: o.next_aligned_step });
    setEditing(idx);
  };

  const handleSave = async () => {
    if (!user || !draft.desire.trim()) return;
    setSaving(true);
    const isNew = editing !== null && editing >= openings.length;
    const payload = {
      user_id: user.id,
      desire: draft.desire.trim(),
      why_it_matters: draft.why_it_matters.trim(),
      desired_feeling: draft.desired_feeling.trim(),
      current_resistance: draft.current_resistance.trim(),
      next_aligned_step: draft.next_aligned_step.trim(),
      position: editing ?? 0,
    };

    if (isNew) {
      const { data, error } = await supabase.from('money_openings').insert(payload).select().single();
      if (error) { toast.error('Could not save'); setSaving(false); return; }
      setOpenings([...openings, { ...payload, id: data.id }]);
    } else {
      const existing = openings[editing!];
      const { error } = await supabase.from('money_openings').update(payload).eq('id', existing.id!);
      if (error) { toast.error('Could not update'); setSaving(false); return; }
      const updated = [...openings];
      updated[editing!] = { ...payload, id: existing.id };
      setOpenings(updated);
    }

    setSaving(false);
    setEditing(null);
    toast.success('Opening saved');
  };

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="h-10 w-10 rounded-full animate-pulse bg-primary/10" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-12 pb-8 space-y-7 safe-top">
      <button onClick={() => navigate('/money/hub')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={18} strokeWidth={1.5} />
        <span className="text-sm">Money Current</span>
      </button>

      <div className="text-center space-y-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">7 Money Openings</h1>
        <p className="text-sm text-muted-foreground">Define your top seven money desires with clarity and intention.</p>
      </div>

      <AnimatePresence mode="wait">
        {editing !== null ? (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <p className="text-center font-heading text-base font-medium text-foreground">
              Opening #{(editing ?? 0) + 1}
            </p>
            {FIELDS.map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">{label}</label>
                <textarea
                  value={(draft as any)[key] || ''}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  placeholder={placeholder}
                  maxLength={500}
                  className="w-full soul-glass-elevated rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none h-20 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 py-3 rounded-xl soul-glass-elevated text-sm font-medium text-foreground">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !draft.desire.trim()}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-medium text-base disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Opening'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {openings.map((o, i) => (
              <motion.button
                key={o.id || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => startEdit(i)}
                className="soul-glass-elevated w-full text-left flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/10 transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-heading text-sm font-semibold text-primary">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-sm font-medium text-foreground truncate">{o.desire || 'Untitled'}</p>
                  {o.desired_feeling && <p className="text-xs text-muted-foreground truncate">{o.desired_feeling}</p>}
                </div>
                <Pencil size={14} className="text-muted-foreground/30 group-hover:text-muted-foreground/60 shrink-0" />
              </motion.button>
            ))}

            {openings.length < 7 && (
              <button
                onClick={startNew}
                className="w-full py-3 rounded-xl border-2 border-dashed border-muted-foreground/20 text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Opening #{openings.length + 1}
              </button>
            )}

            {openings.length === 7 && (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-emerald-500/10 mb-2">
                  <Check size={20} className="text-emerald-400" />
                </div>
                <p className="text-sm text-muted-foreground">All 7 openings defined. You're clear on what you want.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
