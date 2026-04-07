import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wind, Brain, Heart, Zap, Check } from 'lucide-react';
import { useAppState } from '@/lib/AppContext';
import type { ResistanceTrigger, BodyLocation, ClearingMode, ChargeLevel } from '@/lib/types';

const TRIGGERS: { value: ResistanceTrigger; label: string }[] = [
  { value: 'fear', label: 'Fear' },
  { value: 'urgency', label: 'Urgency' },
  { value: 'doubt', label: 'Doubt' },
  { value: 'shame', label: 'Shame' },
  { value: 'disappointment', label: 'Disappointment' },
  { value: 'control', label: 'Control' },
  { value: 'pressure', label: 'Pressure' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'impatience', label: 'Impatience' },
  { value: 'heaviness', label: 'Heaviness' },
  { value: 'mental-noise', label: 'Mental noise' },
  { value: 'emotional-charge', label: 'Emotional charge' },
];

const BODY_LOCATIONS: { value: BodyLocation; label: string }[] = [
  { value: 'thoughts', label: 'Thoughts' },
  { value: 'chest', label: 'Chest' },
  { value: 'throat', label: 'Throat' },
  { value: 'belly', label: 'Belly' },
  { value: 'jaw', label: 'Jaw' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'hands', label: 'Hands' },
  { value: 'everywhere', label: 'Everywhere' },
];

const CLEARING_PATHS: { mode: ClearingMode; icon: typeof Wind; title: string; desc: string }[] = [
  { mode: 'breathe', icon: Wind, title: 'Breathe Through It', desc: 'For activation, overwhelm, or intensity' },
  { mode: 'soften-thought', icon: Brain, title: 'Soften the Thought', desc: 'For mental resistance and loud thoughts' },
  { mode: 'let-it-be', icon: Heart, title: 'Let It Be Here', desc: 'For emotional resistance you\'re fighting' },
  { mode: 'move-energy', icon: Zap, title: 'Move the Energy', desc: 'For body-held tension and tightness' },
];

const CHARGE_LEVELS: { value: ChargeLevel; label: string }[] = [
  { value: 'intense', label: 'Intense' },
  { value: 'active', label: 'Active' },
  { value: 'softening', label: 'Softening' },
  { value: 'lighter', label: 'Lighter' },
  { value: 'open', label: 'Open' },
];

type Phase = 'trigger' | 'body' | 'charge-before' | 'path-select' | 'clearing' | 'charge-after' | 'complete';

const BREATHE_STEPS = [
  'Take a slow, deep breath in through your nose.',
  'Hold gently for a moment.',
  'Exhale slowly through your mouth. Longer than the inhale.',
  'Let your shoulders drop. Soften your jaw.',
  'One more breath. Let the exhale carry what it can.',
  'You do not need to solve this in this breath.',
];

const SOFTEN_PROMPTS = [
  'What thought is loudest right now?',
  'Does it feel true, or just loud?',
  'What feels slightly softer and still honest?',
];

const LET_IT_BE_PROMPTS = [
  'What feeling are you fighting right now?',
  'Can it be here for one moment without argument?',
  'What changes when you stop tightening around it?',
];

const MOVE_ENERGY_STEPS = [
  'Drop your shoulders away from your ears.',
  'Unclench your jaw. Let your tongue rest.',
  'Open your hands. Release any grip.',
  'Take one chest-opening breath — arms wide if you can.',
  'Shake your hands gently for five seconds.',
  'Roll your neck slowly, one direction then the other.',
  'Notice: does your body feel even slightly lighter?',
];

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } };

export default function ResistanceRelease() {
  const navigate = useNavigate();
  const { saveResistanceEntry } = useAppState();
  const [phase, setPhase] = useState<Phase>('trigger');
  const [trigger, setTrigger] = useState<ResistanceTrigger | null>(null);
  const [body, setBody] = useState<BodyLocation | null>(null);
  const [chargeBefore, setChargeBefore] = useState<ChargeLevel | null>(null);
  const [chargeAfter, setChargeAfter] = useState<ChargeLevel | null>(null);
  const [clearingMode, setClearingMode] = useState<ClearingMode | null>(null);
  const [clearingStep, setClearingStep] = useState(0);
  const [softenedText, setSoftenedText] = useState('');

  const clearingSteps = clearingMode === 'breathe' ? BREATHE_STEPS
    : clearingMode === 'soften-thought' ? SOFTEN_PROMPTS
    : clearingMode === 'let-it-be' ? LET_IT_BE_PROMPTS
    : MOVE_ENERGY_STEPS;

  const maxClearingSteps = clearingSteps.length;

  function advanceClearing() {
    if (clearingStep < maxClearingSteps - 1) {
      setClearingStep(s => s + 1);
    } else {
      setPhase('charge-after');
    }
  }

  function finish() {
    if (trigger && body && chargeBefore && chargeAfter && clearingMode) {
      saveResistanceEntry({
        triggerType: trigger,
        bodyLocation: body,
        chargeBefore,
        chargeAfter,
        clearingMode,
        softenedStatement: softenedText || undefined,
      });
    }
    setPhase('complete');
  }

  return (
    <div className="mx-auto max-w-lg px-5 pt-8 pb-8 min-h-[80dvh] soul-ambient-gold">
      <button onClick={() => navigate('/reset')} className="flex items-center gap-1.5 text-muted-foreground text-sm mb-8 active:scale-95 transition-transform">
        <ArrowLeft size={16} /> Reset
      </button>

      <AnimatePresence mode="wait">
        {phase === 'trigger' && (
          <motion.div key="trigger" {...fadeUp} className="space-y-6">
            <div className="text-center space-y-3">
              <motion.div
                className="w-14 h-14 rounded-full mx-auto flex items-center justify-center soul-glass-elevated"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-4 h-4 rounded-full bg-primary/40" />
              </motion.div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">What feels resistant right now?</h1>
              <p className="text-sm text-muted-foreground">Choose what's most present.</p>
            </div>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {TRIGGERS.map((t, i) => (
                <motion.button
                  key={t.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  onClick={() => { setTrigger(t.value); setPhase('body'); }}
                  className={`soul-chip ${trigger === t.value ? 'soul-chip-active' : 'soul-chip-idle'}`}
                >
                  {t.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'body' && (
          <motion.div key="body" {...fadeUp} className="space-y-6">
            <div className="text-center space-y-3">
              <h1 className="font-heading text-xl font-semibold tracking-tight">Where do you feel it most?</h1>
              <p className="text-sm text-muted-foreground">Let your attention find it.</p>
            </div>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {BODY_LOCATIONS.map((b, i) => (
                <motion.button
                  key={b.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => { setBody(b.value); setPhase('charge-before'); }}
                  className="soul-chip soul-chip-idle"
                >
                  {b.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'charge-before' && (
          <motion.div key="charge-before" {...fadeUp} className="space-y-6">
            <div className="text-center space-y-3">
              <h1 className="font-heading text-xl font-semibold tracking-tight">How charged does it feel?</h1>
              <p className="text-sm text-muted-foreground">Before we begin clearing.</p>
            </div>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {CHARGE_LEVELS.map((c, i) => (
                <motion.button
                  key={c.value}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { setChargeBefore(c.value); setPhase('path-select'); }}
                  className="soul-chip soul-chip-idle"
                >
                  {c.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'path-select' && (
          <motion.div key="path" {...fadeUp} className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="font-heading text-xl font-semibold tracking-tight">Choose your clearing path</h1>
            </div>
            <div className="space-y-3">
              {CLEARING_PATHS.map(({ mode, icon: Icon, title, desc }, i) => (
                <motion.button
                  key={mode}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => { setClearingMode(mode); setClearingStep(0); setPhase('clearing'); }}
                  className="soul-glass-elevated w-full text-left flex items-start gap-4 p-5 rounded-2xl hover:bg-muted/10 active:scale-[0.98] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-medium tracking-tight">{title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'clearing' && (
          <motion.div key="clearing" {...fadeUp} className="space-y-8 soul-ambient-violet">
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground tracking-wide">{clearingStep + 1} / {maxClearingSteps}</p>
              <div className="soul-progress-bar">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, hsl(var(--primary) / 0.5), hsl(var(--primary) / 0.8))' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${((clearingStep + 1) / maxClearingSteps) * 100}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            <div className="min-h-[160px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={clearingStep}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center"
                >
                  <p className="font-heading text-xl text-foreground/90 leading-relaxed max-w-[280px] mx-auto">
                    {clearingSteps[clearingStep]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {(clearingMode === 'soften-thought' && clearingStep === 2) && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <textarea
                  value={softenedText}
                  onChange={e => setSoftenedText(e.target.value)}
                  placeholder="Write something softer here…"
                  className="soul-textarea h-24"
                />
              </motion.div>
            )}

            <div className="flex justify-center">
              <button onClick={advanceClearing} className="soul-btn-primary">
                {clearingStep < maxClearingSteps - 1 ? 'Continue' : 'Check in'}
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'charge-after' && (
          <motion.div key="charge-after" {...fadeUp} className="space-y-6">
            <div className="text-center space-y-3">
              <h1 className="font-heading text-xl font-semibold tracking-tight">How does it feel now?</h1>
              <p className="text-sm text-muted-foreground">No pressure. Honest is enough.</p>
            </div>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {CHARGE_LEVELS.map((c, i) => (
                <motion.button
                  key={c.value}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { setChargeAfter(c.value); finish(); }}
                  className="soul-chip soul-chip-idle"
                >
                  {c.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'complete' && (
          <motion.div key="complete" {...fadeUp} className="text-center space-y-7 pt-12">
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 14 }}
              className="soul-completion-ring"
            >
              <Check size={30} className="text-primary" strokeWidth={2} />
            </motion.div>
            <div className="space-y-2">
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-heading text-2xl font-semibold"
              >
                Something softened.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed"
              >
                You don't need to fix everything. You just loosened the grip a little.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3 items-center pt-4"
            >
              <button onClick={() => navigate('/reset/quiet')} className="soul-btn-primary">Continue to Quiet the Mind →</button>
              <button onClick={() => navigate('/align/relief')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Try Relief Wheel</button>
              <button onClick={() => navigate('/reset')} className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors">Return to Reset</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
