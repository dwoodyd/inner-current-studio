import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';

const PROMPTS = [
  'What am I replaying?',
  'Is this true, loud, or familiar?',
  'What am I trying to control?',
  'What is the smallest thing I can release right now?',
  'What feels 5% more open?',
];

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } };

export default function MentalClarity() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<string[]>(Array(PROMPTS.length).fill(''));
  const done = step >= PROMPTS.length;

  function updateResponse(val: string) {
    setResponses(r => { const n = [...r]; n[step] = val; return n; });
  }

  return (
    <div className="mx-auto max-w-lg px-5 pt-8 pb-8 min-h-[80dvh] flex flex-col soul-ambient-gold">
      <button onClick={() => navigate('/reset/quiet')} className="flex items-center gap-1.5 text-muted-foreground text-sm mb-6 active:scale-95 transition-transform">
        <ArrowLeft size={16} /> Quiet the Mind
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key={step} {...fadeUp} className="w-full max-w-sm space-y-7 text-center">
              <div className="space-y-2">
                <Sparkles size={20} className="text-soul-green mx-auto" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground tracking-wide">{step + 1} / {PROMPTS.length}</p>
              </div>
              <h2 className="font-heading text-xl text-foreground/90 leading-relaxed">{PROMPTS[step]}</h2>
              <textarea
                value={responses[step]}
                onChange={e => updateResponse(e.target.value)}
                placeholder="Write freely…"
                className="soul-textarea h-28"
              />
              <button onClick={() => setStep(s => s + 1)} className="soul-btn-primary">
                {step < PROMPTS.length - 1 ? 'Continue' : 'Finish'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="done" {...fadeUp} className="text-center space-y-6">
              <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 14 }} className="soul-completion-ring">
                <Check size={30} className="text-primary" strokeWidth={2} />
              </motion.div>
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="font-heading text-2xl font-semibold">Clarity doesn't need force.</motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-sm text-muted-foreground max-w-xs mx-auto">The mind gets quieter when you stop trying to control it.</motion.p>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} onClick={() => navigate('/reset/quiet')} className="text-sm text-primary/80 hover:text-primary transition-colors">Back to Quiet the Mind</motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
