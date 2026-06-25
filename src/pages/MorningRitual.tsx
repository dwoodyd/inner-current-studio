import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Sun } from 'lucide-react';
import { BreathingOrb } from '@/components/onboarding/BreathingOrb';
import QuickCheckIn from '@/components/QuickCheckIn';
import { useAppState } from '@/lib/AppContext';
import { useCurrentProgress } from '@/lib/currents/progress';
import type { QuickState, EmotionalState } from '@/lib/types';

const quickToEmotional: Record<QuickState, EmotionalState> = {
  tight: 'tense', restless: 'restless', flat: 'flat', open: 'open', flowing: 'flowing',
};

const INTENTION_KEY = (d: string) => `innerwake_morning_intention_${d}`;
const today = () => new Date().toISOString().slice(0, 10);

const STEPS = ['breath', 'intention', 'state', 'close'] as const;
type Step = typeof STEPS[number];

export default function MorningRitual() {
  const navigate = useNavigate();
  const { addCheckIn, updateTodayFlow, state } = useAppState();
  const { recordPractice } = useCurrentProgress('money');
  const [step, setStep] = useState<Step>('breath');
  const [intention, setIntention] = useState('');
  const [picked, setPicked] = useState<QuickState | undefined>();
  const [breathSeconds, setBreathSeconds] = useState(32); // 4 cycles of 8s

  // Load any prior intention for today
  useEffect(() => {
    try {
      const prior = localStorage.getItem(INTENTION_KEY(today()));
      if (prior) setIntention(prior);
    } catch {}
  }, []);

  // Breath countdown
  useEffect(() => {
    if (step !== 'breath') return;
    if (breathSeconds <= 0) return;
    const t = setTimeout(() => setBreathSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, breathSeconds]);

  const next = () => {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  };

  const finish = () => {
    try {
      if (intention.trim()) localStorage.setItem(INTENTION_KEY(today()), intention.trim());
    } catch {}
    if (picked) addCheckIn(quickToEmotional[picked]);
    updateTodayFlow({ morningRitual: true });
    recordPractice();
    navigate('/');
  };

  return (
    <div className="relative min-h-[100dvh] pb-24">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(42 70% 60% / 0.08), transparent 70%)' }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto max-w-md px-5 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-muted-foreground p-2 -ml-2">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-1.5 text-primary/70">
            <Sun size={14} />
            <span className="text-[11px] uppercase tracking-[0.22em]">Morning Awakening</span>
          </div>
          <div className="w-10" />
        </div>

        {/* progress dots */}
        <div className="flex items-center justify-center gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-500 ${
                STEPS.indexOf(s) <= STEPS.indexOf(step) ? 'w-8 bg-primary/70' : 'w-4 bg-border/40'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'breath' && (
            <motion.div
              key="breath"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-col items-center text-center space-y-6 pt-6"
            >
              <BreathingOrb size={220} />
              <div className="space-y-2 max-w-sm">
                <p className="text-[10px] uppercase tracking-[0.22em] text-primary/70">Step 1 · Breath</p>
                <p className="font-heading text-2xl text-foreground">Before anything.</p>
                <p className="text-sm text-muted-foreground italic font-heading">
                  Three slow breaths. Exhale longer than you inhale. Let the body soften before the day begins.
                </p>
                <p className="text-[11px] text-muted-foreground/50 pt-2">
                  {breathSeconds > 0 ? `${breathSeconds}s` : 'Ready when you are.'}
                </p>
              </div>
              <button
                onClick={next}
                disabled={breathSeconds > 24}
                className="rounded-2xl px-6 py-3 text-sm bg-primary/15 text-primary border border-primary/20 hover:bg-primary/20 disabled:opacity-30 transition-all"
              >
                {breathSeconds > 24 ? 'Settle in…' : 'Continue →'}
              </button>
            </motion.div>
          )}

          {step === 'intention' && (
            <motion.div
              key="intention"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-5 pt-4"
            >
              <div className="text-center space-y-2 max-w-sm mx-auto">
                <p className="text-[10px] uppercase tracking-[0.22em] text-primary/70">Step 2 · Remember</p>
                <p className="font-heading text-xl text-foreground">What is actually true beneath today?</p>
                <p className="text-xs text-muted-foreground italic font-heading">
                  Let the answer come from somewhere deeper than this morning's worry or plan. Something like:
                  <span className="text-foreground/70"> I am held. I begin from this ground.</span>
                </p>
              </div>
              <textarea
                value={intention}
                onChange={(e) => setIntention(e.target.value.slice(0, 140))}
                placeholder="I want to move through today softly…"
                rows={3}
                className="w-full bg-soul-surface rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30 border border-border/20 resize-none"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground/50">{intention.length} / 140</span>
                <button
                  onClick={next}
                  className="rounded-2xl px-5 py-2.5 text-sm bg-primary/15 text-primary border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-1.5"
                >
                  Next <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'state' && (
            <motion.div
              key="state"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-5 pt-4"
            >
              <div className="text-center space-y-2 max-w-sm mx-auto">
                <p className="text-[10px] uppercase tracking-[0.22em] text-primary/70">Step 3 · Ask</p>
                <p className="font-heading text-xl text-foreground">What state do I want to enter this day from?</p>
                <p className="text-xs text-muted-foreground italic font-heading">
                  Choose your current. Name your intention. Carry the ground, not just the words, into your morning.
                </p>
              </div>
              <QuickCheckIn selected={picked} onSelect={setPicked} />
              <div className="flex items-center justify-end">
                <button
                  onClick={next}
                  disabled={!picked}
                  className="rounded-2xl px-5 py-2.5 text-sm bg-primary/15 text-primary border border-primary/20 hover:bg-primary/20 disabled:opacity-30 transition-all flex items-center gap-1.5"
                >
                  Next <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'close' && (
            <motion.div
              key="close"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="text-center space-y-6 pt-6"
            >
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto h-16 w-16 rounded-full soul-glow-gold flex items-center justify-center"
                style={{ background: 'radial-gradient(circle at 40% 35%, hsl(42 70% 60% / 0.3), hsl(42 60% 40% / 0.08))' }}
              >
                <Sun size={22} className="text-primary/70" />
              </motion.div>
              <div className="space-y-3 max-w-sm mx-auto">
                <p className="font-heading text-2xl text-foreground">The ground is set.</p>
                <p className="text-sm text-muted-foreground leading-relaxed font-heading italic">
                  Everything else follows from here.
                </p>
                {intention.trim() && (
                  <blockquote className="font-heading italic text-base text-foreground/80 border-l-2 border-primary/30 pl-4 text-left">
                    "{intention.trim()}"
                  </blockquote>
                )}
              </div>
              <button
                onClick={finish}
                className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                <Check size={14} /> Begin the day
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
