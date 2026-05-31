import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Sparkles, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const CATEGORIES = [
  { label: 'Money already present', emoji: '💰' },
  { label: 'Support already present', emoji: '🤝' },
  { label: 'Assets', emoji: '🏠' },
  { label: 'Skills', emoji: '🎯' },
  { label: 'Opportunities', emoji: '🚪' },
  { label: 'Bills already paid', emoji: '✅' },
  { label: 'Unexpected help', emoji: '🎁' },
  { label: 'Discounts', emoji: '🏷️' },
  { label: 'Gifts', emoji: '💝' },
  { label: 'Ideas', emoji: '💡' },
];

interface EvidenceEntry {
  id: string;
  category: string;
  entry_text: string;
  created_at: string;
}

export default function EvidenceOfSupport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<EvidenceEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [entryText, setEntryText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('evidence_of_support')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setEntries(data);
        setLoading(false);
      });
  }, [user]);

  const saveEntry = async () => {
    if (!user || !selectedCategory || !entryText.trim()) return;
    const { data, error } = await supabase
      .from('evidence_of_support')
      .insert({ user_id: user.id, category: selectedCategory, entry_text: entryText.trim() })
      .select()
      .single();
    if (error) { toast.error('Could not save'); return; }
    setEntries(prev => [data, ...prev]);
    setEntryText('');
    setSelectedCategory(null);
    toast.success('Evidence noted ✨');
  };

  const deleteEntry = async (id: string) => {
    await supabase.from('evidence_of_support').delete().eq('id', id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const grouped = CATEGORIES.map(c => ({
    ...c,
    items: entries.filter(e => e.category === c.label),
  }));

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(42 65% 58% / 0.08), hsl(160 30% 40% / 0.04), transparent 70%)' }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-6 safe-top">
        <button onClick={() => navigate('/money/hub')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} strokeWidth={1.5} />
          <span className="text-sm">Money Current</span>
        </button>

        <div className="text-center space-y-2">
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Evidence of Support
          </h1>
          <p className="text-sm text-muted-foreground max-w-[300px] mx-auto leading-relaxed">
            Notice what's already here. Track the support that surrounds you.
          </p>
        </div>

        {/* Add new */}
        <div className="soul-glass-elevated rounded-2xl p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Add evidence</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.label}
                onClick={() => setSelectedCategory(selectedCategory === c.label ? null : c.label)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  selectedCategory === c.label
                    ? 'bg-soul-gold/20 text-soul-gold border border-soul-gold/30'
                    : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'
                }`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {selectedCategory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-3"
              >
                <textarea
                  value={entryText}
                  onChange={e => setEntryText(e.target.value)}
                  placeholder={`What ${selectedCategory.toLowerCase()} can you notice right now?`}
                  className="w-full bg-muted/10 border border-border/30 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-soul-gold/30"
                  rows={3}
                  maxLength={1000}
                />
                <button
                  onClick={saveEntry}
                  disabled={!entryText.trim()}
                  className="w-full py-2.5 rounded-xl text-sm font-medium bg-soul-gold/15 text-soul-gold hover:bg-soul-gold/25 disabled:opacity-40 transition-all"
                >
                  <Plus size={14} className="inline mr-1" /> Save Evidence
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Entries by category */}
        {!loading && grouped.filter(g => g.items.length > 0).map(g => (
          <div key={g.label} className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {g.emoji} {g.label} <span className="text-muted-foreground/50">({g.items.length})</span>
            </p>
            {g.items.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="soul-glass rounded-xl p-3 flex items-start gap-3 group"
              >
                <Sparkles size={14} className="text-soul-gold/60 mt-0.5 shrink-0" />
                <p className="text-sm text-foreground/80 flex-1">{item.entry_text}</p>
                <button onClick={() => deleteEntry(item.id)} className="opacity-0 group-hover:opacity-60 transition-opacity">
                  <X size={14} className="text-muted-foreground" />
                </button>
              </motion.div>
            ))}
          </div>
        ))}

        {!loading && entries.length === 0 && (
          <div className="text-center py-8">
            <Sparkles size={24} className="text-soul-gold/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground italic">Begin noticing what's already supporting you.</p>
          </div>
        )}
      </div>
    </div>
  );
}
