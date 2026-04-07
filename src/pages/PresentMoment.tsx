import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

const STEPS = [
  'What is happening right now?',
  'What am I noticing in my mind?',
  'What am I feeling in my body?',
  'Can I observe this without becoming it?',
  'One slow breath. Let the exhale be longer.',
  'You are here. That is enough.',
];

const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } };

export default function PresentMoment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const done = step >= STEPS.length;

  return (
    <div className="mx-auto max-w-lg px-4 pt-8 pb-6 min-h-[80dvh] flex flex-col">
      <button onClick={() => navigate('/reset/quiet')} className="flex items-center gap-1.5 text-muted-foreground text-sm mb-8 active:scale-95">
        <ArrowLeft size={16} /> Quiet the Mind
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key={step} {...fadeUp} className="text-center space-y-8 max-w-xs">
              <motion.div
                className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-6 h-6 rounded-full bg-primary/30" />
              </motion.div>
              <p className="font-heading text-lg text-foreground/90 leading-relaxed">{STEPS[step]}</p>
              <p className="text-xs text-muted-foreground">{step + 1} / {STEPS.length}</p>
              <button
                onClick={() => setStep(s => s + 1)}
                className="px-8 py-3 rounded-full bg-primary/15 text-primary font-medium text-sm active:scale-95"
              >
                {step < STEPS.length - 1 ? 'Continue' : 'Finish'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="done" {...fadeUp} className="text-center space-y-5">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
                <Check size={28} className="text-primary" />
              </motion.div>
              <h2 className="font-heading text-xl font-semibold">Present. Grounded.</h2>
              <p className="text-sm text-muted-foreground">The noise may return. You know how to pause it.</p>
              <button onClick={() => navigate('/reset/quiet')} className="text-sm text-primary/80 hover:text-primary">Back to Quiet the Mind</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
