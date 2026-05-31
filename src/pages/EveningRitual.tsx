import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Moon } from 'lucide-react';
import { BreathingOrb } from '@/components/onboarding/BreathingOrb';
import { useAppState } from '@/lib/AppContext';
import { useCurrentProgress } from '@/lib/currents/progress';

const SOFTEN_KEY = (d: string) => `innerwake_evening_soften_${d}`;
const today = () => new Date().toISOString().slice(0, 10);

const STEPS = ['exhale', 'reflect', 'close'] as const;
type Step = typeof STEPS[number];

const CLOSING_LINES = [
  "The day is done. You don't have to carry tomorrow.",
  "What you couldn't finish today will be there. Let it rest.",
  "You moved through. That's enough.",
  "The current you returned to is still here. It will hold you while you sleep.",
];

export default function EveningRitual() {
  const navigate = useNavigate();
  const { updateTodayFlow } = useAppState();
  const { recordPractice } = useCurrentProgress('money');
  const [step, setStep] = useState<Step>('exhale');
  const [softened, setSoftened] = useState('');
  const [breathSeconds, setBreathSeconds] = useState(36); // longer exhale cycles

  useEffect(() => {
    try {
      const prior = localStorage.getItem(SOFTEN_KEY(today()));
      if (prior) setSoftened(prior);
    } catch {}
  }, []);

  useEffect(() => {
    if (step !== 'exhale' || breathSeconds <= 0) return;
    const t = setTimeout(() => setBreathSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, breathSeconds]);

  const closingLine = CLOSING_LINES[new Date().getDate() % CLOSING_LINES.length];

  const next = () => {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  };

  const finish = () => {
    try {
      if (softened.trim()) localStorage.setItem(SOFTEN_KEY(today()), softened.trim());
    } catch {}
    updateTodayFlow({ reflectionCompleted: true });
    recordPractice();
    navigate('/');
  };

  return (
    <div className="relative min-h-[100dvh] pb-24">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(265 30% 50% / 0.10), transparent 70%)' }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto max-w-md px-5 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-muted-foreground p-2 -ml-2">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-1.5 text-soul-violet/80">
            <Moon size={14} />
            <span className="text-[11px] uppercase tracking-[0.22em]">Evening Settling</span>
          </div>
          <div className="w-10" />
        </div>

        <div className="flex items-center justify-center gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-500 ${
                STEPS.indexOf(s) <= STEPS.indexOf(step) ? 'w-8 bg-soul-violet/70' : 'w-4 bg-border/40'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'exhale' && (
            <motion.div
              key="exhale"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-col items-center text-center space-y-6 pt-6"
            >
              <BreathingOrb size={220} hue={265} />
              <div className="space-y-2">
                <p className="font-heading text-2xl text-foreground">Exhale the day.</p>
                <p className="text-sm text-muted-foreground italic font-heading max-w-xs">
                  A longer exhale than your inhale. Let the orb pull you down.
                </p>
                <p className="text-[11px] text-muted-foreground/50 pt-2">
                  {breathSeconds > 0 ? `${breathSeconds}s` : 'Ready when you are.'}
                </p>
              </div>
              <button
                onClick={next}
                disabled={breathSeconds > 28}
                className="rounded-2xl px-6 py-3 text-sm bg-soul-violet/15 text-soul-violet border border-soul-violet/20 hover:bg-soul-violet/20 disabled:opacity-30 transition-all"
              >
                {breathSeconds > 28 ? 'Settle in…' : 'Continue →'}
              </button>
            </motion.div>
          )}

          {step === 'reflect' && (
            <motion.div
              key="reflect"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-5 pt-4"
            >
              <div className="text-center space-y-2">
                <p className="font-heading text-xl text-foreground">What softened today?</p>
                <p className="text-xs text-muted-foreground italic font-heading max-w-xs mx-auto">
                  Not what you fixed. Not what you got done. What loosened — even a little.
                </p>
              </div>
              <textarea
                value={softened}
                onChange={(e) => setSoftened(e.target.value.slice(0, 280))}
                placeholder="A small thing. The walk. The conversation. The way I stopped pushing at 3pm…"
                rows={5}
                className="w-full bg-soul-surface rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-soul-violet/30 border border-border/20 resize-none"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground/50">{softened.length} / 280</span>
                <button
                  onClick={next}
                  className="rounded-2xl px-5 py-2.5 text-sm bg-soul-violet/15 text-soul-violet border border-soul-violet/20 hover:bg-soul-violet/20 transition-all flex items-center gap-1.5"
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
                animate={{ scale: [1, 1.04, 1], opacity: [0.85, 1, 0.85] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto h-16 w-16 rounded-full flex items-center justify-center"
                style={{ background: 'radial-gradient(circle at 40% 35%, hsl(265 60% 60% / 0.3), hsl(265 50% 40% / 0.08))' }}
              >
                <Moon size={22} className="text-soul-violet/80" />
              </motion.div>
              <div className="space-y-3 max-w-sm mx-auto">
                <blockquote className="font-heading italic text-lg text-foreground/85 leading-relaxed">
                  "{closingLine}"
                </blockquote>
                {softened.trim() && (
                  <p className="text-xs text-muted-foreground/70 leading-relaxed pt-2">
                    What softened: <span className="text-foreground/70">{softened.trim()}</span>
                  </p>
                )}
              </div>
              <button
                onClick={finish}
                className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm bg-soul-violet text-white hover:bg-soul-violet/90 transition-all"
              >
                <Check size={14} /> Rest now
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
