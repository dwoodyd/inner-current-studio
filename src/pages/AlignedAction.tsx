import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Check, RefreshCw } from 'lucide-react';

const ACTIONS = [
  'Send the invoice',
  'Review the account calmly',
  'Ask for the support you need',
  'Raise the offer',
  'Apply for the opportunity',
  'Cut the dead expense',
  'Make the pitch',
  'Open the savings account',
  'Negotiate the fee',
  'Follow up on the lead',
  'Set the boundary around unpaid work',
  'Research the investment',
  'Update your pricing',
  'Automate a recurring bill',
  'Track your spending for one week',
  'Schedule the money conversation',
  'Donate from a place of fullness',
  'Celebrate a financial win, no matter the size',
];

const PROMPTS = [
  'What money shift did you just experience?',
  'What aligned step feels ready right now?',
  'What would make this step feel steady instead of forced?',
  'What support do you already have for this?',
];

export default function AlignedAction() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '']);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [committed, setCommitted] = useState(false);

  const updateAnswer = (val: string) => {
    setAnswers(prev => { const n = [...prev]; n[step] = val; return n; });
  };

  const pickRandom = () => {
    const a = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    setSelectedAction(a);
  };

  if (committed) {
    return (
      <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-8 safe-top text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-emerald-500/20">
            <Check size={32} className="text-emerald-400" />
          </div>
        </motion.div>
        <h2 className="font-heading text-2xl font-semibold text-foreground">Action Committed</h2>
        <div className="soul-glass rounded-2xl p-6 space-y-3 text-left">
          <p className="text-sm text-muted-foreground">Your aligned step:</p>
          <p className="text-lg font-heading text-foreground">{selectedAction || answers[1]}</p>
          <p className="text-sm text-muted-foreground mt-4">From steadiness:</p>
          <p className="text-foreground">{answers[2]}</p>
        </div>
        <button onClick={() => navigate('/money')} className="w-full py-3 rounded-2xl bg-soul-gold/20 text-soul-gold font-medium hover:bg-soul-gold/30 transition-colors">
          Return to Money Current
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(42 65% 58% / 0.06), transparent 70%)' }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-6 safe-top">
        <button onClick={() => navigate('/money')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} strokeWidth={1.5} /><span className="text-sm">Money Current</span>
        </button>

        <div className="text-center space-y-2">
          <motion.div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center bg-soul-gold/10"
            animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 5, repeat: Infinity }}>
            <Zap size={24} className="text-soul-gold" />
          </motion.div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Aligned Action</h1>
          <p className="text-sm text-muted-foreground">Turn a money shift into one grounded step.</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 justify-center">
          {PROMPTS.map((_, i) => (
            <div key={i} className={`h-1.5 w-10 rounded-full transition-colors ${i <= step ? 'bg-soul-gold' : 'bg-muted/30'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-4">
            <p className="text-foreground font-heading text-lg">{PROMPTS[step]}</p>

            {step === 1 && (
              <div className="space-y-3">
                <button onClick={pickRandom} className="flex items-center gap-2 text-sm text-soul-gold hover:text-soul-gold/80 transition-colors">
                  <RefreshCw size={14} /> Suggest an action
                </button>
                {selectedAction && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="soul-glass rounded-xl p-3">
                    <p className="text-foreground">{selectedAction}</p>
                  </motion.div>
                )}
              </div>
            )}

            <textarea value={answers[step]} onChange={e => updateAnswer(e.target.value)} rows={3} placeholder="Write freely…"
              className="w-full bg-muted/20 border border-border/30 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-soul-gold/30 resize-none" />
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 rounded-2xl border border-border/30 text-muted-foreground hover:text-foreground transition-colors">
              Back
            </button>
          )}
          <button onClick={() => step < PROMPTS.length - 1 ? setStep(s => s + 1) : setCommitted(true)}
            disabled={!answers[step]?.trim()}
            className="flex-1 py-3 rounded-2xl font-medium transition-all disabled:opacity-30 bg-soul-gold/20 text-soul-gold hover:bg-soul-gold/30">
            {step < PROMPTS.length - 1 ? 'Next' : 'Commit to Action'}
          </button>
        </div>
      </div>
    </div>
  );
}
