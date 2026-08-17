import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { DomainConfig } from '@/lib/domains';
import { recordPracticeFor } from '@/lib/currents/progress';
import StateDial from '@/components/StateDial';

export default function DomainStateCheckIn({ domain }: { domain: DomainConfig }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const save = async () => {
    if (!selected || !user) return;
    setSaving(true);
    const { error } = await supabase.from('domain_states').insert({
      user_id: user.id, domain: domain.key, state: selected, note: note || null,
    });
    setSaving(false);
    if (error) { toast.error('Could not save'); return; }
    recordPracticeFor(domain.key);
    setDone(true);
    setTimeout(() => navigate(domain.route), 1400);
  };

  return (
    <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-7 safe-top">
      <button onClick={() => navigate(domain.route)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft size={18} strokeWidth={1.5} /><span className="text-sm">{domain.label}</span>
      </button>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <Check className={domain.accentClass} size={28} />
            </div>
            <p className="text-foreground font-heading text-xl">Noted, gently.</p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="font-heading text-2xl text-foreground">Where are you with this current?</h1>
              <p className="text-sm text-muted-foreground">Move the weight. No word required.</p>
            </div>
            <div className="soul-card rounded-2xl px-5 py-5">
              <StateDial
                steps={domain.states.length}
                value={selected ? domain.states.findIndex(s => s.value === selected) : null}
                onPreview={(i) => setSelected(domain.states[i].value)}
                onCommit={(i) => setSelected(domain.states[i].value)}
                ariaLabel={`Move the weight to where you are with the ${domain.label}`}
                stopLabels={domain.states.map(s => s.label)}
              />
              <div className="mt-1 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                <span aria-hidden="true">closed</span>
                <span aria-hidden="true">open</span>
              </div>
              {selected && (
                <p className="mt-4 text-center font-heading text-lg text-foreground">
                  {domain.states.find(s => s.value === selected)?.label}
                </p>
              )}
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Anything else? (optional)"
              className="w-full soul-card p-4 rounded-2xl bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 resize-none min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/40" />
            <button onClick={save} disabled={!selected || saving} className="w-full soul-glass-elevated py-4 rounded-2xl font-medium text-foreground disabled:opacity-40">
              {saving ? 'Saving…' : 'Save check-in'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
