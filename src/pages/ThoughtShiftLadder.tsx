import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useAppState } from '@/lib/AppContext';
import type { ChargeType } from '@/lib/types';

const CHARGE_OPTIONS: { value: ChargeType; label: string }[] = [
  { value: 'fearful', label: 'Fearful' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'ashamed', label: 'Ashamed' },
  { value: 'controlling', label: 'Controlling' },
  { value: 'disappointed', label: 'Disappointed' },
  { value: 'defeated', label: 'Defeated' },
  { value: 'scattered', label: 'Scattered' },
];

const ANGLE_PROMPTS = [
  'What is slightly less tight?',
  'What is true without being harsh?',
  'What would a steadier version of you say?',
  'What else might be true?',
  'What angle creates more space?',
];

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } };

export default function ThoughtShiftLadder() {
  const navigate = useNavigate();
  const { saveThoughtShift } = useAppState();
  const [step, setStep] = useState(0);
  const [originalThought, setOriginalThought] = useState('');
  const [chargeType, setChargeType] = useState<ChargeType | null>(null);
  const [angleIdx, setAngleIdx] = useState(0);
  const [softer, setSofter] = useState('');
  const [believable, setBelievable] = useState('');
  const [support, setSupport] = useState('');
  const [done, setDone] = useState(false);

  function finish() {
    if (chargeType) {
      saveThoughtShift({
        originalThought,
        chargeType,
        softerStatement: softer,
        believableStatement: believable,
        supportStatement: support,
      });
    }
    setDone(true);
  }

  const phases = ['Interrupt', 'Soften', 'Reorient'];
  const currentPhase = step <= 1 ? 0 : step <= 2 ? 1 : 2;

  return (
    <div className="mx-auto max-w-lg px-5 pt-8 pb-8 min-h-[80dvh] soul-ambient-gold">
      <button onClick={() => navigate('/reset/quiet')} className="flex items-center gap-1.5 text-muted-foreground text-sm mb-6 active:scale-95 transition-transform">
        <ArrowLeft size={16} /> Quiet the Mind
      </button>

      {!done && (
        <div className="flex items-center gap-3 justify-center mb-8">
          {phases.map((p, i) => (
            <div key={p} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <motion.div
                  className={`w-2 h-2 rounded-full transition-colors ${i <= currentPhase ? 'bg-primary' : 'bg-border/40'}`}
                  animate={i === currentPhase ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className={`text-xs font-medium tracking-wide ${i <= currentPhase ? 'text-primary' : 'text-muted-foreground/40'}`}>{p}</span>
              </div>
              {i < 2 && <div className={`w-8 h-px transition-colors ${i < currentPhase ? 'bg-primary/40' : 'bg-border/20'}`} />}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 0 && !done && (
          <motion.div key="s0" {...fadeUp} className="space-y-6">
            <h1 className="font-heading text-xl font-semibold text-center tracking-tight">Catch the thought</h1>
            <p className="text-sm text-muted-foreground text-center">What thought is looping?</p>
            <textarea value={originalThought} onChange={e => setOriginalThought(e.target.value)}
              placeholder="Write the thought that's loudest…"
              className="soul-textarea h-28" />
            <div className="flex justify-center">
              <button onClick={() => originalThought.trim() && setStep(1)}
                disabled={!originalThought.trim()}
                className="soul-btn-primary">
                Next
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && !done && (
          <motion.div key="s1" {...fadeUp} className="space-y-6">
            <h1 className="font-heading text-xl font-semibold text-center tracking-tight">Name the charge</h1>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {CHARGE_OPTIONS.map((c, i) => (
                <motion.button key={c.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => { setChargeType(c.value); setStep(2); }}
                  className="soul-chip soul-chip-idle">
                  {c.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && !done && (
          <motion.div key="s2" {...fadeUp} className="space-y-6">
            <h1 className="font-heading text-xl font-semibold text-center tracking-tight">Choose a new angle</h1>
            <div className="space-y-2.5">
              {ANGLE_PROMPTS.map((p, i) => (
                <motion.button key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => { setAngleIdx(i); setStep(3); }}
                  className={`soul-glass-elevated w-full text-left text-sm p-4 rounded-2xl active:scale-[0.98] transition-all ${angleIdx === i ? 'ring-1 ring-primary/30' : ''}`}>
                  {p}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && !done && (
          <motion.div key="s3" {...fadeUp} className="space-y-5">
            <h1 className="font-heading text-xl font-semibold text-center tracking-tight">Write the shift</h1>
            <p className="text-xs text-muted-foreground text-center italic font-heading">"{ANGLE_PROMPTS[angleIdx]}"</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block tracking-wide">One softer sentence</label>
                <textarea value={softer} onChange={e => setSofter(e.target.value)} className="soul-textarea h-[72px]" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block tracking-wide">One believable sentence</label>
                <textarea value={believable} onChange={e => setBelievable(e.target.value)} className="soul-textarea h-[72px]" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block tracking-wide">One supporting sentence</label>
                <textarea value={support} onChange={e => setSupport(e.target.value)} className="soul-textarea h-[72px]" />
              </div>
            </div>
            <div className="flex justify-center">
              <button onClick={finish} disabled={!softer.trim()} className="soul-btn-primary">
                Land it
              </button>
            </div>
          </motion.div>
        )}

        {done && (
          <motion.div key="done" {...fadeUp} className="text-center space-y-7 pt-12">
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 14 }} className="soul-completion-ring">
              <Check size={30} className="text-primary" strokeWidth={2} />
            </motion.div>
            <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="font-heading text-2xl font-semibold">One thought shifted.</motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-sm text-muted-foreground">One gentler thought can change the direction.</motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-col gap-3 pt-2">
              <button onClick={() => navigate('/align/momentum')} className="soul-btn-primary">Hold it with Momentum Ring →</button>
              <button onClick={() => navigate('/align/gather')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Save to Gather Flow</button>
              <button onClick={() => navigate('/reset/quiet')} className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors">Back</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
