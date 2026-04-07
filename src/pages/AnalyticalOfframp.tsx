import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, BrainCircuit } from 'lucide-react';

const HAPPENINGS = ['I\'m replaying', 'I\'m analyzing', 'I\'m trying to fix it', 'I can\'t stop thinking'];
const SUPPORTS = [
  { label: 'Slow the thought', guide: 'Notice the thought. Don\'t chase it. Let it sit. Watch it slow without solving it.' },
  { label: 'Stop feeding the thought', guide: 'You are giving this thought energy by engaging with it. What if you gently withdrew your attention?' },
  { label: 'Return to body', guide: 'Drop your awareness into your body. Feet on the floor. Hands resting. Breath moving. You are here.' },
  { label: 'Pause interpretation', guide: 'Not everything needs meaning right now. Let this moment exist without a conclusion.' },
];

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } };

export default function AnalyticalOfframp() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'what' | 'support' | 'practice' | 'done'>('what');
  const [selected, setSelected] = useState('');
  const [support, setSupport] = useState<typeof SUPPORTS[0] | null>(null);

  return (
    <div className="mx-auto max-w-lg px-5 pt-8 pb-8 min-h-[80dvh] flex flex-col soul-ambient-violet">
      <button onClick={() => navigate('/reset/quiet')} className="flex items-center gap-1.5 text-muted-foreground text-sm mb-6 active:scale-95 transition-transform">
        <ArrowLeft size={16} /> Quiet the Mind
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === 'what' && (
            <motion.div key="what" {...fadeUp} className="space-y-6 w-full">
              <div className="text-center space-y-2">
                <BrainCircuit size={24} className="text-soul-warm mx-auto mb-2" strokeWidth={1.5} />
                <h1 className="font-heading text-xl font-semibold tracking-tight">What's happening?</h1>
              </div>
              <div className="space-y-2.5">
                {HAPPENINGS.map((h, i) => (
                  <motion.button key={h}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => { setSelected(h); setPhase('support'); }}
                    className="soul-glass-elevated w-full text-left text-sm p-4 rounded-2xl active:scale-[0.98] transition-all">{h}</motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'support' && (
            <motion.div key="support" {...fadeUp} className="space-y-6 w-full">
              <h1 className="font-heading text-xl font-semibold text-center tracking-tight">Choose your support</h1>
              <div className="space-y-2.5">
                {SUPPORTS.map((s, i) => (
                  <motion.button key={s.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => { setSupport(s); setPhase('practice'); }}
                    className="soul-glass-elevated w-full text-left text-sm p-4 rounded-2xl active:scale-[0.98] transition-all">{s.label}</motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'practice' && support && (
            <motion.div key="practice" {...fadeUp} className="text-center space-y-10 max-w-[280px]">
              <motion.div
                className="w-20 h-20 rounded-full mx-auto flex items-center justify-center soul-glass-elevated"
                animate={{ scale: [1, 1.05, 1], boxShadow: ['0 0 30px hsl(265 25% 45% / 0.06)', '0 0 50px hsl(265 25% 45% / 0.12)', '0 0 30px hsl(265 25% 45% / 0.06)'] }}
                transition={{ duration: 5, repeat: Infinity }}>
                <motion.div className="w-6 h-6 rounded-full bg-primary/30" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 5, repeat: Infinity, delay: 0.3 }} />
              </motion.div>
              <p className="font-heading text-lg text-foreground/90 leading-relaxed">{support.guide}</p>
              <button onClick={() => setPhase('done')} className="soul-btn-primary">
                I feel it settling
              </button>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" {...fadeUp} className="text-center space-y-6">
              <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 14 }} className="soul-completion-ring">
                <Check size={30} className="text-primary" strokeWidth={2} />
              </motion.div>
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="font-heading text-2xl font-semibold">The mind can rest.</motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-sm text-muted-foreground">You don't need to think your way to peace.</motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-col gap-3 pt-2">
                <button onClick={() => navigate('/reset/stillness')} className="soul-btn-primary">Try Stillness Timer →</button>
                <button onClick={() => navigate('/reset/quiet/present')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Present Moment Interrupt</button>
                <button onClick={() => navigate('/reset/quiet')} className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors">Back</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
