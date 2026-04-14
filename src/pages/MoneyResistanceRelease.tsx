import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const RESISTANCE_CHIPS = [
  'not enough', 'fear of bills', 'guilt receiving', 'fear of losing money',
  'fear of success', 'fear of judgment', 'not worthy', 'too late',
  "I'll mess it up", 'I have to work harder',
];

const BODY_OPTIONS = ['chest', 'throat', 'belly', 'jaw', 'shoulders', 'thoughts', 'everywhere'];

const CHARGE_LEVELS = ['intense', 'active', 'softening', 'lighter', 'open'];

const SOFTEN_PROMPTS = [
  "What if this belief isn't the whole truth?",
  "What would someone who feels safe with money think here?",
  "Can I let this thought soften, just a little?",
  "What if receiving is allowed?",
];

type Phase = 'select' | 'body' | 'charge-before' | 'soften' | 'charge-after' | 'complete';

export default function MoneyResistanceRelease() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('select');
  const [resistance, setResistance] = useState('');
  const [body, setBody] = useState('');
  const [chargeBefore, setChargeBefore] = useState('');
  const [chargeAfter, setChargeAfter] = useState('');
  const [softenedThought, setSoftenedThought] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);

  const finish = async () => {
    if (!user) return;
    await supabase.from('money_resistance').insert({
      user_id: user.id,
      resistance_type: resistance,
      body_sensation: body,
      charge_before: chargeBefore,
      charge_after: chargeAfter,
      softened_thought: softenedThought || null,
    });
    setPhase('complete');
    toast.success('Resistance softened 🌿');
  };

  const chargeColor = (level: string) => {
    const map: Record<string, string> = {
      intense: 'bg-red-500/20 text-red-400 border-red-500/30',
      active: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      softening: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      lighter: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      open: 'bg-soul-gold/20 text-soul-gold border-soul-gold/30',
    };
    return map[level] || 'bg-muted/20 text-muted-foreground';
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(42 65% 58% / 0.06), hsl(280 30% 40% / 0.04), transparent 70%)' }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-6 safe-top">
        <button onClick={() => navigate('/money')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} strokeWidth={1.5} />
          <span className="text-sm">Money Current</span>
        </button>

        <div className="text-center space-y-2">
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Money Resistance Release
          </h1>
          <p className="text-sm text-muted-foreground max-w-[300px] mx-auto leading-relaxed">
            Name it. Feel it. Soften it. Let it move.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Phase: Select resistance */}
          {phase === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">What money resistance is present?</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {RESISTANCE_CHIPS.map(r => (
                  <button
                    key={r}
                    onClick={() => { setResistance(r); setPhase('body'); }}
                    className="px-3 py-2 rounded-full text-sm bg-muted/20 text-muted-foreground hover:bg-soul-gold/15 hover:text-soul-gold transition-all border border-transparent hover:border-soul-gold/20"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase: Body */}
          {phase === 'body' && (
            <motion.div key="body" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">Where do you feel "<span className="text-soul-gold">{resistance}</span>" in your body?</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {BODY_OPTIONS.map(b => (
                  <button
                    key={b}
                    onClick={() => { setBody(b); setPhase('charge-before'); }}
                    className="px-3 py-2 rounded-full text-sm bg-muted/20 text-muted-foreground hover:bg-muted/30 transition-all capitalize"
                  >
                    {b}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase: Charge before */}
          {phase === 'charge-before' && (
            <motion.div key="charge-before" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">How charged does this feel right now?</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {CHARGE_LEVELS.map(c => (
                  <button
                    key={c}
                    onClick={() => { setChargeBefore(c); setPhase('soften'); }}
                    className={`px-4 py-2 rounded-full text-sm border transition-all capitalize ${chargeColor(c)}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase: Soften */}
          {phase === 'soften' && (
            <motion.div key="soften" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <div className="soul-glass-elevated rounded-2xl p-5 text-center space-y-3">
                <p className="text-sm text-muted-foreground italic">"{SOFTEN_PROMPTS[promptIndex]}"</p>
                <button
                  onClick={() => setPromptIndex((promptIndex + 1) % SOFTEN_PROMPTS.length)}
                  className="text-xs text-soul-gold/60 hover:text-soul-gold transition-colors"
                >
                  Next prompt →
                </button>
              </div>
              <textarea
                value={softenedThought}
                onChange={e => setSoftenedThought(e.target.value)}
                placeholder="Write a softer thought here (optional)..."
                className="w-full bg-muted/10 border border-border/30 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-soul-gold/30"
                rows={3}
                maxLength={500}
              />
              <button
                onClick={() => setPhase('charge-after')}
                className="w-full py-3 rounded-xl text-sm font-medium bg-soul-gold/15 text-soul-gold hover:bg-soul-gold/25 transition-all"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* Phase: Charge after */}
          {phase === 'charge-after' && (
            <motion.div key="charge-after" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">How does the charge feel now?</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {CHARGE_LEVELS.map(c => (
                  <button
                    key={c}
                    onClick={() => { setChargeAfter(c); finish(); }}
                    className={`px-4 py-2 rounded-full text-sm border transition-all capitalize ${chargeColor(c)}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase: Complete */}
          {phase === 'complete' && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
                <Check size={28} className="text-emerald-400" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-foreground">Resistance Softened</h2>
              <p className="text-sm text-muted-foreground">
                You moved from <span className="text-foreground capitalize">{chargeBefore}</span> to{' '}
                <span className="text-soul-gold capitalize">{chargeAfter}</span>.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <button onClick={() => { setPhase('select'); setResistance(''); setBody(''); setChargeBefore(''); setChargeAfter(''); setSoftenedThought(''); }} className="px-4 py-2 rounded-xl text-sm bg-muted/20 text-muted-foreground hover:bg-muted/30 transition-all">
                  Release Another
                </button>
                <button onClick={() => navigate('/money')} className="px-4 py-2 rounded-xl text-sm bg-soul-gold/15 text-soul-gold hover:bg-soul-gold/25 transition-all">
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
