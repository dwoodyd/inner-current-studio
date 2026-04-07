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

const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } };

export default function ThoughtShiftLadder() {
  const navigate = useNavigate();
  const { saveThoughtShift } = useAppState();
  const [step, setStep] = useState(0); // 0-4 maps to 5 steps
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
    <div className="mx-auto max-w-lg px-4 pt-8 pb-6 min-h-[80dvh]">
      <button onClick={() => navigate('/reset/quiet')} className="flex items-center gap-1.5 text-muted-foreground text-sm mb-6 active:scale-95">
        <ArrowLeft size={16} /> Quiet the Mind
      </button>

      {!done && (
        <div className="flex items-center gap-2 justify-center mb-6">
          {phases.map((p, i) => (
            <div key={p} className="flex items-center gap-2">
              <span className={`text-xs font-medium ${i <= currentPhase ? 'text-primary' : 'text-muted-foreground/40'}`}>{p}</span>
              {i < 2 && <div className={`w-8 h-px ${i < currentPhase ? 'bg-primary/40' : 'bg-border/30'}`} />}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 0 && !done && (
          <motion.div key="s0" {...fadeUp} className="space-y-5">
            <h1 className="font-heading text-xl font-semibold text-center">Catch the thought</h1>
            <p className="text-sm text-muted-foreground text-center">What thought is looping?</p>
            <textarea value={originalThought} onChange={e => setOriginalThought(e.target.value)}
              placeholder="Write the thought that's loudest…"
              className="w-full p-3 rounded-xl bg-muted/30 border border-border/30 text-sm resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary/40" />
            <div className="flex justify-center">
              <button onClick={() => originalThought.trim() && setStep(1)}
                disabled={!originalThought.trim()}
                className="px-8 py-3 rounded-full bg-primary/15 text-primary font-medium text-sm active:scale-95 disabled:opacity-40">
                Next
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && !done && (
          <motion.div key="s1" {...fadeUp} className="space-y-5">
            <h1 className="font-heading text-xl font-semibold text-center">Name the charge</h1>
            <div className="flex flex-wrap gap-2 justify-center">
              {CHARGE_OPTIONS.map(c => (
                <button key={c.value} onClick={() => { setChargeType(c.value); setStep(2); }}
                  className="px-4 py-2 rounded-full text-sm border border-border/40 text-muted-foreground hover:border-primary/40 active:scale-95">
                  {c.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && !done && (
          <motion.div key="s2" {...fadeUp} className="space-y-5">
            <h1 className="font-heading text-xl font-semibold text-center">Choose a new angle</h1>
            <div className="space-y-2">
              {ANGLE_PROMPTS.map((p, i) => (
                <button key={i} onClick={() => { setAngleIdx(i); setStep(3); }}
                  className={`soul-card w-full text-left text-sm active:scale-[0.98] ${angleIdx === i ? 'ring-1 ring-primary/30' : ''}`}>
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && !done && (
          <motion.div key="s3" {...fadeUp} className="space-y-4">
            <h1 className="font-heading text-xl font-semibold text-center">Write the shift</h1>
            <p className="text-xs text-muted-foreground text-center italic">"{ANGLE_PROMPTS[angleIdx]}"</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">One softer sentence</label>
                <textarea value={softer} onChange={e => setSofter(e.target.value)}
                  className="w-full p-3 rounded-xl bg-muted/30 border border-border/30 text-sm resize-none h-16 focus:outline-none focus:ring-1 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">One believable sentence</label>
                <textarea value={believable} onChange={e => setBelievable(e.target.value)}
                  className="w-full p-3 rounded-xl bg-muted/30 border border-border/30 text-sm resize-none h-16 focus:outline-none focus:ring-1 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">One supporting sentence</label>
                <textarea value={support} onChange={e => setSupport(e.target.value)}
                  className="w-full p-3 rounded-xl bg-muted/30 border border-border/30 text-sm resize-none h-16 focus:outline-none focus:ring-1 focus:ring-primary/40" />
              </div>
            </div>
            <div className="flex justify-center">
              <button onClick={finish} disabled={!softer.trim()}
                className="px-8 py-3 rounded-full bg-primary/15 text-primary font-medium text-sm active:scale-95 disabled:opacity-40">
                Land it
              </button>
            </div>
          </motion.div>
        )}

        {done && (
          <motion.div key="done" {...fadeUp} className="text-center space-y-6 pt-12">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
              <Check size={28} className="text-primary" />
            </motion.div>
            <h2 className="font-heading text-xl font-semibold">One thought shifted.</h2>
            <p className="text-sm text-muted-foreground">One gentler thought can change the direction.</p>
            <div className="flex flex-col gap-2 pt-2">
              <button onClick={() => navigate('/align/momentum')} className="text-sm text-primary/80">Hold it with Momentum Ring →</button>
              <button onClick={() => navigate('/align/gather')} className="text-sm text-muted-foreground">Save to Gather Flow</button>
              <button onClick={() => navigate('/reset/quiet')} className="text-sm text-muted-foreground">Back</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
