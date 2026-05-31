import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { DomainConfig } from '@/lib/domains';
import { recordPracticeFor } from '@/lib/currents/progress';

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
              <h1 className="font-heading text-2xl text-foreground">How are you with this current right now?</h1>
              <p className="text-sm text-muted-foreground">Pick what is most true. There is no wrong answer.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {domain.states.map(s => (
                <button key={s.value} onClick={() => setSelected(s.value)}
                  className={`soul-card flex items-center gap-3 p-4 rounded-2xl transition-all ${selected === s.value ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{s.label}</span>
                </button>
              ))}
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
