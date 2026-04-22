import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Feather, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const MONEY_STATES = [
  { value: 'panicked', label: 'Panicked', emoji: '😰', tier: 'low' },
  { value: 'constricted', label: 'Constricted', emoji: '😣', tier: 'low' },
  { value: 'burdened', label: 'Burdened', emoji: '😮‍💨', tier: 'low' },
  { value: 'guarded', label: 'Guarded', emoji: '🛡️', tier: 'mid' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', tier: 'mid' },
  { value: 'open', label: 'Open', emoji: '🙂', tier: 'mid' },
  { value: 'supported', label: 'Supported', emoji: '🤝', tier: 'high' },
  { value: 'receptive', label: 'Receptive', emoji: '✨', tier: 'high' },
  { value: 'abundant', label: 'Abundant', emoji: '🌿', tier: 'high' },
  { value: 'overflowing', label: 'Overflowing', emoji: '💫', tier: 'high' },
] as const;

export default function MoneyState() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selected || !user) return;
    setSaving(true);
    const { error } = await supabase.from('money_states').insert({
      user_id: user.id,
      state: selected,
      note: note.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error('Could not save check-in');
      return;
    }
    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-12 pb-8 space-y-7 safe-top">
      <button onClick={() => navigate('/money')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={18} strokeWidth={1.5} />
        <span className="text-sm">Money Current</span>
      </button>

      <div className="text-center space-y-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">Money State</h1>
        <p className="text-sm text-muted-foreground">How does money feel for you right now?</p>
      </div>

      <AnimatePresence mode="wait">
        {!saved ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {MONEY_STATES.map(({ value, label, emoji, tier }) => {
                const isSelected = selected === value;
                const tierColor = tier === 'low' ? 'border-destructive/30' : tier === 'high' ? 'border-emerald-500/30' : 'border-muted-foreground/20';
                return (
                  <motion.button
                    key={value}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelected(value)}
                    className={`soul-glass-elevated rounded-2xl p-4 text-left transition-all duration-200 border-2 ${
                      isSelected ? 'border-primary bg-primary/5' : `border-transparent hover:${tierColor}`
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    <p className="font-heading text-sm font-medium text-foreground mt-1">{label}</p>
                  </motion.button>
                );
              })}
            </div>

            {selected && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything you want to notice or name? (optional)"
                  maxLength={500}
                  className="w-full soul-glass-elevated rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-heading font-medium text-base hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Check-in'}
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-8">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-emerald-500/10">
              <Check size={28} className="text-emerald-400" />
            </div>
            <h2 className="font-heading text-xl font-semibold text-foreground">Noted</h2>
            <p className="text-sm text-muted-foreground max-w-[260px] mx-auto">
              Awareness is the first shift. You've named where you are.
            </p>
            <div className="mx-auto mt-5 grid max-w-xs gap-2 text-left">
              <button onClick={() => navigate('/money/resistance')} className="soul-glass-elevated rounded-2xl p-4 flex items-center gap-3 hover:bg-muted/10 transition-colors">
                <ShieldCheck size={18} className="text-primary" />
                <span className="text-sm text-foreground">Want to soften this? · 5 min</span>
              </button>
              <button onClick={() => navigate('/money/gather')} className="soul-glass rounded-2xl p-4 flex items-center gap-3 hover:bg-muted/10 transition-colors">
                <Feather size={18} className="text-primary" />
                <span className="text-sm text-foreground">Gather a steadier thought</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
