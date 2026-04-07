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

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

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
    <div className="mx-auto max-w-lg px-4 pt-8 pb-6 min-h-[80dvh]">
      <button onClick={() => navigate('/reset')} className="flex items-center gap-1.5 text-muted-foreground text-sm mb-6 active:scale-95">
        <ArrowLeft size={16} /> Reset
      </button>

      <AnimatePresence mode="wait">
        {phase === 'trigger' && (
          <motion.div key="trigger" {...fadeUp} className="space-y-5">
            <div className="text-center space-y-2">
              <h1 className="font-heading text-2xl font-semibold">What feels resistant right now?</h1>
              <p className="text-sm text-muted-foreground">Choose what's most present.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {TRIGGERS.map(t => (
                <button
                  key={t.value}
                  onClick={() => { setTrigger(t.value); setPhase('body'); }}
                  className={`px-4 py-2 rounded-full text-sm border transition-all active:scale-95 ${
                    trigger === t.value ? 'bg-primary/20 border-primary text-primary' : 'border-border/40 text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'body' && (
          <motion.div key="body" {...fadeUp} className="space-y-5">
            <div className="text-center space-y-2">
              <h1 className="font-heading text-xl font-semibold">Where do you feel it most?</h1>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {BODY_LOCATIONS.map(b => (
                <button
                  key={b.value}
                  onClick={() => { setBody(b.value); setPhase('charge-before'); }}
                  className="px-4 py-2.5 rounded-full text-sm border border-border/40 text-muted-foreground hover:border-primary/40 active:scale-95 transition-all"
                >
                  {b.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'charge-before' && (
          <motion.div key="charge-before" {...fadeUp} className="space-y-5">
            <div className="text-center space-y-2">
              <h1 className="font-heading text-xl font-semibold">How charged does it feel?</h1>
              <p className="text-sm text-muted-foreground">Before we begin clearing.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {CHARGE_LEVELS.map(c => (
                <button
                  key={c.value}
                  onClick={() => { setChargeBefore(c.value); setPhase('path-select'); }}
                  className="px-4 py-2.5 rounded-full text-sm border border-border/40 text-muted-foreground hover:border-primary/40 active:scale-95 transition-all"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'path-select' && (
          <motion.div key="path" {...fadeUp} className="space-y-5">
            <div className="text-center space-y-2">
              <h1 className="font-heading text-xl font-semibold">Choose your clearing path</h1>
            </div>
            <div className="space-y-3">
              {CLEARING_PATHS.map(({ mode, icon: Icon, title, desc }) => (
                <button
                  key={mode}
                  onClick={() => { setClearingMode(mode); setClearingStep(0); setPhase('clearing'); }}
                  className="soul-card w-full text-left flex items-start gap-4 hover:bg-muted/20 active:scale-[0.98] transition-all"
                >
                  <Icon size={20} className="mt-0.5 text-primary" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-heading text-base font-medium">{title}</h3>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'clearing' && (
          <motion.div key="clearing" {...fadeUp} className="space-y-8">
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">{clearingStep + 1} / {maxClearingSteps}</p>
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary/60 rounded-full" initial={{ width: 0 }} animate={{ width: `${((clearingStep + 1) / maxClearingSteps) * 100}%` }} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={clearingStep} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-center min-h-[120px] flex items-center justify-center">
                <p className="font-heading text-lg text-foreground/90 leading-relaxed max-w-xs mx-auto">
                  {clearingSteps[clearingStep]}
                </p>
              </motion.div>
            </AnimatePresence>

            {(clearingMode === 'soften-thought' && clearingStep === 2) && (
              <textarea
                value={softenedText}
                onChange={e => setSoftenedText(e.target.value)}
                placeholder="Write something softer here…"
                className="w-full p-3 rounded-xl bg-muted/30 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none h-20 focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            )}

            <div className="flex justify-center">
              <button
                onClick={advanceClearing}
                className="px-8 py-3 rounded-full bg-primary/15 text-primary font-medium text-sm active:scale-95 transition-all"
              >
                {clearingStep < maxClearingSteps - 1 ? 'Continue' : 'Check in'}
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'charge-after' && (
          <motion.div key="charge-after" {...fadeUp} className="space-y-5">
            <div className="text-center space-y-2">
              <h1 className="font-heading text-xl font-semibold">How does it feel now?</h1>
              <p className="text-sm text-muted-foreground">No pressure. Honest is enough.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {CHARGE_LEVELS.map(c => (
                <button
                  key={c.value}
                  onClick={() => { setChargeAfter(c.value); finish(); }}
                  className="px-4 py-2.5 rounded-full text-sm border border-border/40 text-muted-foreground hover:border-primary/40 active:scale-95 transition-all"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'complete' && (
          <motion.div key="complete" {...fadeUp} className="text-center space-y-6 pt-12">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
              <Check size={28} className="text-primary" />
            </motion.div>
            <div className="space-y-2">
              <h2 className="font-heading text-xl font-semibold">Something softened.</h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">You don't need to fix everything. You just loosened the grip a little.</p>
            </div>
            <div className="flex flex-col gap-2 items-center pt-4">
              <button onClick={() => navigate('/reset/quiet')} className="text-sm text-primary/80 hover:text-primary">Continue to Quiet the Mind →</button>
              <button onClick={() => navigate('/align/relief')} className="text-sm text-muted-foreground hover:text-foreground">Try Relief Wheel</button>
              <button onClick={() => navigate('/reset')} className="text-sm text-muted-foreground hover:text-foreground">Return to Reset</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
