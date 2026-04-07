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

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } };

export default function PresentMoment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const done = step >= STEPS.length;

  return (
    <div className="mx-auto max-w-lg px-5 pt-8 pb-8 min-h-[80dvh] flex flex-col soul-ambient-violet">
      <button onClick={() => navigate('/reset/quiet')} className="flex items-center gap-1.5 text-muted-foreground text-sm mb-8 active:scale-95 transition-transform">
        <ArrowLeft size={16} /> Quiet the Mind
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key={step} {...fadeUp} className="text-center space-y-10 max-w-[280px]">
              <motion.div
                className="w-24 h-24 rounded-full mx-auto flex items-center justify-center soul-glass-elevated"
                animate={{ scale: [1, 1.06, 1], boxShadow: ['0 0 30px hsl(42 65% 58% / 0.06)', '0 0 50px hsl(42 65% 58% / 0.12)', '0 0 30px hsl(42 65% 58% / 0.06)'] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.div
                  className="w-7 h-7 rounded-full bg-primary/35"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                />
              </motion.div>
              <p className="font-heading text-xl text-foreground/90 leading-relaxed">{STEPS[step]}</p>
              <p className="text-xs text-muted-foreground tracking-wide">{step + 1} / {STEPS.length}</p>
              <button onClick={() => setStep(s => s + 1)} className="soul-btn-primary">
                {step < STEPS.length - 1 ? 'Continue' : 'Finish'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="done" {...fadeUp} className="text-center space-y-6">
              <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 14 }} className="soul-completion-ring">
                <Check size={30} className="text-primary" strokeWidth={2} />
              </motion.div>
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="font-heading text-2xl font-semibold">Present. Grounded.</motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-sm text-muted-foreground max-w-xs mx-auto">The noise may return. You know how to pause it.</motion.p>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} onClick={() => navigate('/reset/quiet')} className="text-sm text-primary/80 hover:text-primary transition-colors">Back to Quiet the Mind</motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
