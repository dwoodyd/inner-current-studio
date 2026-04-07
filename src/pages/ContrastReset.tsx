import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/lib/AppContext';
import { ArrowLeft, Check } from 'lucide-react';

const fastModes = [
  { label: '30-second reset', time: 30 },
  { label: '2-minute guided', time: 120 },
  { label: "I'm spiraling", time: 60 },
  { label: "I'm stuck", time: 60 },
  { label: "I'm overthinking", time: 45 },
  { label: "I'm emotionally flat", time: 90 },
];

const reframeSuggestions = [
  "What if this is less fixed than it feels right now?",
  "What if there's a version of this that feels lighter?",
  "What if you don't need to solve this to feel better?",
  "What if relief is already starting to move toward you?",
];

type Step = 'mode' | 'focused-on' | 'whats-tight' | 'whats-better' | 'reframe' | 'complete';

export default function ContrastReset() {
  const [step, setStep] = useState<Step>('mode');
  const [focusedOn, setFocusedOn] = useState('');
  const [tight, setTight] = useState('');
  const [better, setBetter] = useState('');
  const [selectedReframe, setSelectedReframe] = useState('');
  const { updateTodayFlow } = useAppState();
  const navigate = useNavigate();

  const handleComplete = () => {
    updateTodayFlow({ resetUsed: true });
    setStep('complete');
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/reset')} className="text-muted-foreground hover:text-foreground" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">Contrast Reset</h1>
          <p className="text-xs text-muted-foreground">Redirect what feels tight</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'mode' && (
          <motion.div key="mode" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            <p className="text-sm text-muted-foreground">Choose your entry point:</p>
            <div className="grid grid-cols-2 gap-2.5">
              {fastModes.map(m => (
                <button
                  key={m.label}
                  onClick={() => setStep('focused-on')}
                  className="soul-card text-left text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                  {m.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'focused-on' && (
          <motion.div key="focused" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <h2 className="font-heading text-lg text-foreground">I'm focused on…</h2>
            <textarea
              value={focusedOn}
              onChange={e => setFocusedOn(e.target.value)}
              placeholder="What's taking up space right now?"
              className="w-full min-h-[100px] rounded-xl bg-card border border-border/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
              autoFocus
            />
            <button
              onClick={() => setStep('whats-tight')}
              disabled={!focusedOn.trim()}
              className="w-full rounded-2xl bg-primary py-3.5 text-sm font-medium text-primary-foreground disabled:opacity-30"
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === 'whats-tight' && (
          <motion.div key="tight" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <h2 className="font-heading text-lg text-foreground">What feels tight or unwanted here?</h2>
            <textarea
              value={tight}
              onChange={e => setTight(e.target.value)}
              placeholder="Name the resistance, the friction, the weight…"
              className="w-full min-h-[100px] rounded-xl bg-card border border-border/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
              autoFocus
            />
            <button
              onClick={() => setStep('whats-better')}
              disabled={!tight.trim()}
              className="w-full rounded-2xl bg-primary py-3.5 text-sm font-medium text-primary-foreground disabled:opacity-30"
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === 'whats-better' && (
          <motion.div key="better" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <h2 className="font-heading text-lg text-foreground">What would feel better, truer, or more supportive?</h2>
            <textarea
              value={better}
              onChange={e => setBetter(e.target.value)}
              placeholder="Even something small…"
              className="w-full min-h-[100px] rounded-xl bg-card border border-border/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
              autoFocus
            />
            <button
              onClick={() => setStep('reframe')}
              disabled={!better.trim()}
              className="w-full rounded-2xl bg-primary py-3.5 text-sm font-medium text-primary-foreground disabled:opacity-30"
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === 'reframe' && (
          <motion.div key="reframe" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <h2 className="font-heading text-lg text-foreground">Try one of these on:</h2>
            <div className="space-y-2.5">
              {reframeSuggestions.map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedReframe(r)}
                  className={`w-full rounded-xl border px-4 py-3.5 text-left text-sm transition-all ${
                    selectedReframe === r
                      ? 'border-primary/40 bg-primary/10 text-foreground'
                      : 'border-border/40 bg-card text-muted-foreground'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              onClick={handleComplete}
              className="w-full rounded-2xl bg-primary py-3.5 text-sm font-medium text-primary-foreground"
            >
              Complete Reset
            </button>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-12">
            <motion.div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 soul-glow-gold"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: 2 }}
            >
              <Check size={24} className="text-primary" />
            </motion.div>
            <div className="space-y-2">
              <h2 className="font-heading text-xl font-medium text-foreground">Reset complete</h2>
              <p className="text-sm text-muted-foreground">A small shift counts. You redirected your attention.</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-primary hover:text-primary/80"
            >
              Return home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
