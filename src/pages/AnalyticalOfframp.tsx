import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

const HAPPENINGS = ['I\'m replaying', 'I\'m analyzing', 'I\'m trying to fix it', 'I can\'t stop thinking'];
const SUPPORTS = [
  { label: 'Slow the thought', guide: 'Notice the thought. Don\'t chase it. Let it sit. Watch it slow without solving it.' },
  { label: 'Stop feeding the thought', guide: 'You are giving this thought energy by engaging with it. What if you gently withdrew your attention?' },
  { label: 'Return to body', guide: 'Drop your awareness into your body. Feet on the floor. Hands resting. Breath moving. You are here.' },
  { label: 'Pause interpretation', guide: 'Not everything needs meaning right now. Let this moment exist without a conclusion.' },
];

const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } };

export default function AnalyticalOfframp() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'what' | 'support' | 'practice' | 'done'>('what');
  const [selected, setSelected] = useState('');
  const [support, setSupport] = useState<typeof SUPPORTS[0] | null>(null);

  return (
    <div className="mx-auto max-w-lg px-4 pt-8 pb-6 min-h-[80dvh] flex flex-col">
      <button onClick={() => navigate('/reset/quiet')} className="flex items-center gap-1.5 text-muted-foreground text-sm mb-6 active:scale-95">
        <ArrowLeft size={16} /> Quiet the Mind
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === 'what' && (
            <motion.div key="what" {...fadeUp} className="space-y-5 w-full">
              <h1 className="font-heading text-xl font-semibold text-center">What\'s happening?</h1>
              <div className="space-y-2">
                {HAPPENINGS.map(h => (
                  <button key={h} onClick={() => { setSelected(h); setPhase('support'); }}
                    className="soul-card w-full text-left text-sm active:scale-[0.98]">{h}</button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'support' && (
            <motion.div key="support" {...fadeUp} className="space-y-5 w-full">
              <h1 className="font-heading text-xl font-semibold text-center">Choose your support</h1>
              <div className="space-y-2">
                {SUPPORTS.map(s => (
                  <button key={s.label} onClick={() => { setSupport(s); setPhase('practice'); }}
                    className="soul-card w-full text-left text-sm active:scale-[0.98]">{s.label}</button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'practice' && support && (
            <motion.div key="practice" {...fadeUp} className="text-center space-y-8 max-w-xs">
              <motion.div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center"
                animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 5, repeat: Infinity }}>
                <div className="w-5 h-5 rounded-full bg-primary/25" />
              </motion.div>
              <p className="font-heading text-base text-foreground/90 leading-relaxed">{support.guide}</p>
              <button onClick={() => setPhase('done')} className="px-8 py-3 rounded-full bg-primary/15 text-primary font-medium text-sm active:scale-95">
                I feel it settling
              </button>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" {...fadeUp} className="text-center space-y-5">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
                <Check size={28} className="text-primary" />
              </motion.div>
              <h2 className="font-heading text-xl font-semibold">The mind can rest.</h2>
              <p className="text-sm text-muted-foreground">You don't need to think your way to peace.</p>
              <div className="flex flex-col gap-2 pt-2">
                <button onClick={() => navigate('/reset/stillness')} className="text-sm text-primary/80">Try Stillness Timer →</button>
                <button onClick={() => navigate('/reset/quiet/present')} className="text-sm text-muted-foreground">Present Moment Interrupt</button>
                <button onClick={() => navigate('/reset/quiet')} className="text-sm text-muted-foreground">Back</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
