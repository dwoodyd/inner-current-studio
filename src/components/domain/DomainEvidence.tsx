import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { DomainConfig } from '@/lib/domains';

interface Entry { id: string; category: string; entry_text: string; created_at: string; }

export default function DomainEvidence({ domain }: { domain: DomainConfig }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [category, setCategory] = useState(domain.evidenceCategories[0]?.value ?? '');
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('domain_evidence').select('*')
      .eq('user_id', user.id).eq('domain', domain.key).order('created_at', { ascending: false });
    if (data) setEntries(data as any);
  };
  useEffect(() => { load(); }, [user, domain.key]);

  const add = async () => {
    if (!text.trim() || !user) return;
    setSaving(true);
    const { error } = await supabase.from('domain_evidence').insert({
      user_id: user.id, domain: domain.key, category, entry_text: text.trim(),
    });
    setSaving(false);
    if (error) { toast.error('Could not save'); return; }
    setText(''); load();
  };

  const remove = async (id: string) => {
    await supabase.from('domain_evidence').delete().eq('id', id);
    load();
  };

  return (
    <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-6 safe-top">
      <button onClick={() => navigate(domain.route)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft size={18} strokeWidth={1.5} /><span className="text-sm">{domain.label}</span>
      </button>
      <div className="text-center space-y-2">
        <h1 className="font-heading text-2xl text-foreground">Evidence Log</h1>
        <p className="text-sm text-muted-foreground">Notice the proof that this current is moving.</p>
      </div>

      <div className="soul-glass-elevated p-4 rounded-2xl space-y-3">
        <div className="flex flex-wrap gap-2">
          {domain.evidenceCategories.map(c => (
            <button key={c.value} onClick={() => setCategory(c.value)}
              className={`px-3 py-1.5 rounded-full text-xs ${category === c.value ? 'bg-primary/20 text-foreground ring-1 ring-primary' : 'bg-muted/30 text-muted-foreground'}`}>
              <span className="mr-1">{c.emoji}</span>{c.label}
            </button>
          ))}
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="What did you notice?"
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 resize-none min-h-[80px] focus:outline-none" />
        <button onClick={add} disabled={saving || !text.trim()} className="w-full bg-primary/15 hover:bg-primary/25 transition py-3 rounded-xl text-sm text-foreground disabled:opacity-40 flex items-center justify-center gap-2">
          <Plus size={14} /> Add evidence
        </button>
      </div>

      <div className="space-y-2">
        {entries.length === 0 && <p className="text-center text-sm text-muted-foreground/60 py-8">Your first piece of evidence is waiting.</p>}
        {entries.map((e, i) => {
          const cat = domain.evidenceCategories.find(c => c.value === e.category);
          return (
            <motion.div key={e.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="soul-card p-4 rounded-2xl flex items-start gap-3">
              <span className="text-xl shrink-0">{cat?.emoji ?? '✨'}</span>
              <div className="flex-1 space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{cat?.label ?? e.category}</p>
                <p className="text-sm text-foreground leading-relaxed">{e.entry_text}</p>
              </div>
              <button onClick={() => remove(e.id)} className="text-muted-foreground/40 hover:text-rose-400 transition"><Trash2 size={14} /></button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
