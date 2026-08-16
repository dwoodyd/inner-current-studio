import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { DomainConfig } from '@/lib/domains';
import { recordPracticeFor } from '@/lib/currents/progress';
import CurrentGlyph from '@/components/CurrentGlyph';

const CHARGE_LEVELS = [
  { value: 'intense', label: 'Intense', dot: 'bg-rose-500' },
  { value: 'active', label: 'Active', dot: 'bg-orange-400' },
  { value: 'softening', label: 'Softening', dot: 'bg-amber-300' },
  { value: 'lighter', label: 'Lighter', dot: 'bg-emerald-300' },
  { value: 'open', label: 'Open', dot: 'bg-sky-300' },
];

type Phase = 'select' | 'body' | 'before' | 'soften' | 'after' | 'done';

export default function DomainResistanceRelease({ domain }: { domain: DomainConfig }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('select');
  const [resistance, setResistance] = useState('');
  const [body, setBody] = useState('');
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');
  const [softened, setSoftened] = useState('');

  const finish = async (afterVal: string) => {
    setAfter(afterVal);
    if (user) {
      const { error } = await supabase.from('domain_resistance').insert({
        user_id: user.id, domain: domain.key,
        resistance_type: resistance, body_sensation: body,
        charge_before: before, charge_after: afterVal,
        softened_thought: softened || null,
      });
      if (error) toast.error('Could not save');
    }
    recordPracticeFor(domain.key);
    setPhase('done');
  };

  return (
    <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-6 safe-top min-h-[100dvh]">
      <button onClick={() => navigate(domain.route)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft size={18} strokeWidth={1.5} /><span className="text-sm">{domain.label}</span>
      </button>

      <AnimatePresence mode="wait">
        {phase === 'select' && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="text-center space-y-2">
              <h1 className="font-heading text-2xl text-foreground">What is in the way?</h1>
              <p className="text-sm text-muted-foreground">Pick what is loud right now.</p>
            </div>
            <div className="space-y-2">
              {domain.resistanceChips.map(c => (
                <button key={c} onClick={() => { setResistance(c); setPhase('body'); }} className="soul-card w-full text-left p-4 rounded-2xl text-sm text-foreground hover:bg-muted/10">{c}</button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'body' && (
          <motion.div key="body" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="text-center space-y-2">
              <h1 className="font-heading text-2xl text-foreground">Where do you feel it?</h1>
              <p className="text-sm text-muted-foreground">Let your body tell you.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {domain.bodyOptions.map(b => (
                <button key={b} onClick={() => { setBody(b); setPhase('before'); }} className="soul-card p-4 rounded-2xl text-sm text-foreground hover:bg-muted/10">{b}</button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'before' && (
          <motion.div key="before" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="text-center space-y-2">
              <h1 className="font-heading text-2xl text-foreground">How charged is it?</h1>
            </div>
            <div className="space-y-2">
              {CHARGE_LEVELS.map(c => (
                <button key={c.value} onClick={() => { setBefore(c.value); setPhase('soften'); }} className="soul-card w-full flex items-center gap-3 p-4 rounded-2xl">
                  <span className={`w-3 h-3 rounded-full ${c.dot}`} /><span className="text-sm text-foreground">{c.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'soften' && (
          <motion.div key="soften" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="text-center space-y-2">
              <h1 className="font-heading text-2xl text-foreground">Soften gently</h1>
              <p className="text-sm text-muted-foreground">Try one of these silently. Or write your own softer version.</p>
            </div>
            <div className="space-y-2">
              {domain.softenPrompts.map(p => (
                <div key={p} className="soul-card p-4 rounded-2xl text-sm text-foreground italic">{p}</div>
              ))}
            </div>
            <textarea value={softened} onChange={e => setSoftened(e.target.value)} placeholder="A softer version of the original thought (optional)…"
              className="w-full soul-card p-4 rounded-2xl bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 resize-none min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/40" />
            <button onClick={() => setPhase('after')} className="w-full soul-glass-elevated py-4 rounded-2xl font-medium text-foreground">Continue</button>
          </motion.div>
        )}

        {phase === 'after' && (
          <motion.div key="after" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="text-center space-y-2">
              <h1 className="font-heading text-2xl text-foreground">How is it now?</h1>
            </div>
            <div className="space-y-2">
              {CHARGE_LEVELS.map(c => (
                <button key={c.value} onClick={() => finish(c.value)} className="soul-card w-full flex items-center gap-3 p-4 rounded-2xl">
                  <span className={`w-3 h-3 rounded-full ${c.dot}`} /><span className="text-sm text-foreground">{c.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-12">
            <div className="flex justify-center"><CurrentGlyph current={domain.key} size={54} className={domain.accentClass} strokeWidth={1.1} /></div>
            <h2 className="font-heading text-2xl text-foreground">Released, gently.</h2>
            <p className="text-sm text-muted-foreground">{before} → {after}</p>
            <div className="flex flex-col gap-2 pt-4">
              <button onClick={() => { setPhase('select'); setResistance(''); setBody(''); setBefore(''); setAfter(''); setSoftened(''); }} className="soul-glass-elevated py-3 rounded-2xl text-foreground">Release another</button>
              <button onClick={() => navigate(domain.route)} className="soul-card py-3 rounded-2xl text-muted-foreground">Done</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
