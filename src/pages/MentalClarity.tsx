import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

const PROMPTS = [
  'What am I replaying?',
  'Is this true, loud, or familiar?',
  'What am I trying to control?',
  'What is the smallest thing I can release right now?',
  'What feels 5% more open?',
];

const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } };

export default function MentalClarity() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<string[]>(Array(PROMPTS.length).fill(''));
  const done = step >= PROMPTS.length;

  function updateResponse(val: string) {
    setResponses(r => { const n = [...r]; n[step] = val; return n; });
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-8 pb-6 min-h-[80dvh] flex flex-col">
      <button onClick={() => navigate('/reset/quiet')} className="flex items-center gap-1.5 text-muted-foreground text-sm mb-6 active:scale-95">
        <ArrowLeft size={16} /> Quiet the Mind
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key={step} {...fadeUp} className="w-full max-w-sm space-y-6 text-center">
              <p className="text-xs text-muted-foreground">{step + 1} / {PROMPTS.length}</p>
              <h2 className="font-heading text-lg text-foreground/90 leading-relaxed">{PROMPTS[step]}</h2>
              <textarea
                value={responses[step]}
                onChange={e => updateResponse(e.target.value)}
                placeholder="Write freely…"
                className="w-full p-3 rounded-xl bg-muted/30 border border-border/30 text-sm resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
              <button
                onClick={() => setStep(s => s + 1)}
                className="px-8 py-3 rounded-full bg-primary/15 text-primary font-medium text-sm active:scale-95"
              >
                {step < PROMPTS.length - 1 ? 'Continue' : 'Finish'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="done" {...fadeUp} className="text-center space-y-5">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
                <Check size={28} className="text-primary" />
              </motion.div>
              <h2 className="font-heading text-xl font-semibold">Clarity doesn't need force.</h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">The mind gets quieter when you stop trying to control it.</p>
              <button onClick={() => navigate('/reset/quiet')} className="text-sm text-primary/80">Back to Quiet the Mind</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
