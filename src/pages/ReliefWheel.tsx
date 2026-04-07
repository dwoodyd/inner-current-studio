import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ChevronRight, Check } from 'lucide-react';
import { useAppState } from '@/lib/AppContext';
import type { BelievabilityLevel, WheelSegment } from '@/lib/types';

const RELIEF_PROMPTS = [
  "What feels most present for you right now? Just name it gently.",
  "What would bring the smallest amount of relief?",
  "What do you know is okay, even right now?",
  "What softness is available, even if small?",
  "What truth can you rest in without forcing anything?",
  "What would feel like enough for right now?",
];

const BELIEVABILITY: { value: BelievabilityLevel; label: string }[] = [
  { value: 'forced', label: 'Forced' },
  { value: 'possible', label: 'Possible' },
  { value: 'believable', label: 'Believable' },
  { value: 'true', label: 'True' },
  { value: 'alive', label: 'Alive' },
];

export default function ReliefWheel() {
  const navigate = useNavigate();
  const { saveWheel } = useAppState();
  const [step, setStep] = useState(0);
  const [segments, setSegments] = useState<WheelSegment[]>(
    RELIEF_PROMPTS.map((prompt, i) => ({ index: i, prompt, response: '', believability: 'possible' }))
  );
  const [done, setDone] = useState(false);

  const current = segments[step];

  const update = useCallback((field: keyof WheelSegment, value: string | BelievabilityLevel) => {
    setSegments(prev => prev.map((s, i) => i === step ? { ...s, [field]: value } : s));
  }, [step]);

  const next = () => {
    if (step < 5) setStep(step + 1);
    else {
      saveWheel({ title: 'Relief Wheel', centerText: 'Finding relief', segments, type: 'relief', completionStatus: 'complete' });
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-20 pb-6 text-center space-y-8 soul-ambient-violet overflow-hidden">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <div className="soul-completion-ring w-28 h-28" style={{
            background: 'linear-gradient(135deg, hsl(265 25% 45% / 0.12), hsl(265 25% 45% / 0.06))',
            borderColor: 'hsl(265 25% 45% / 0.15)',
            boxShadow: '0 0 40px hsl(265 25% 45% / 0.1), 0 0 80px hsl(265 25% 45% / 0.04)',
          }}>
            <Heart size={36} className="text-soul-violet" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
          <h2 className="font-heading text-2xl text-foreground">Relief Found</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">You gave yourself permission to soften. That's enough.</p>
        </motion.div>
        <button onClick={() => navigate('/align')} className="soul-btn-primary w-full">Return to Align</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-6 soul-ambient-violet overflow-hidden">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/align')} className="text-muted-foreground p-2 -ml-2 hover:text-foreground transition-colors"><ArrowLeft size={20} /></button>
        <h1 className="font-heading text-lg font-semibold text-foreground">Relief Wheel</h1>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {RELIEF_PROMPTS.map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: i === step ? 1.3 : 1 }}
            className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-soul-violet' : i < step ? 'bg-soul-violet/40' : 'bg-muted'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="soul-glass-elevated rounded-2xl p-5 space-y-4"
        >
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Step {step + 1} of 6</p>
          <p className="font-heading text-base text-soul-violet italic leading-relaxed">{current.prompt}</p>
          <textarea
            value={current.response}
            onChange={e => update('response', e.target.value)}
            placeholder="Whatever comes…"
            className="soul-textarea min-h-[70px]"
          />
          <div className="flex flex-wrap gap-1.5">
            {BELIEVABILITY.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => update('believability', value)}
                className={`soul-chip text-[11px] px-3 py-1.5 ${
                  current.believability === value ? 'soul-chip-active' : 'soul-chip-idle'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <button onClick={next} disabled={!current.response.trim()} className="soul-btn-primary w-full flex items-center justify-center gap-2">
        {step === 5 ? <><Check size={16} /> Complete</> : <>Continue <ChevronRight size={16} /></>}
      </button>
    </div>
  );
}
