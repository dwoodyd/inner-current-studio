import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      saveWheel({
        title: 'Relief Wheel',
        centerText: 'Finding relief',
        segments,
        type: 'relief',
        completionStatus: 'complete',
      });
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-20 pb-6 text-center space-y-8">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }}>
          <div className="w-28 h-28 mx-auto rounded-full soul-gradient-violet opacity-80 flex items-center justify-center soul-glow-violet">
            <Heart size={36} className="text-foreground" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
          <h2 className="font-heading text-2xl text-foreground">Relief Found</h2>
          <p className="text-sm text-muted-foreground">You gave yourself permission to soften. That's enough.</p>
        </motion.div>
        <Button onClick={() => navigate('/align')} className="w-full">Return to Align</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/align')} className="text-muted-foreground p-2 -ml-2"><ArrowLeft size={20} /></button>
        <h1 className="font-heading text-lg font-semibold text-foreground">Relief Wheel</h1>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {RELIEF_PROMPTS.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-primary scale-125' : i < step ? 'bg-secondary' : 'bg-muted'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="soul-card space-y-4"
        >
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Step {step + 1} of 6</p>
          <p className="font-heading text-base text-primary italic leading-relaxed">{current.prompt}</p>
          <textarea
            value={current.response}
            onChange={e => update('response', e.target.value)}
            placeholder="Whatever comes…"
            className="w-full bg-transparent border-0 border-b border-border/50 text-foreground text-sm resize-none focus:outline-none focus:border-primary/50 min-h-[70px] placeholder:text-muted-foreground/40"
          />
          <div className="flex flex-wrap gap-1.5">
            {BELIEVABILITY.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => update('believability', value)}
                className={`text-[11px] px-2.5 py-1 rounded-full transition-all ${
                  current.believability === value ? 'bg-primary/20 text-primary ring-1 ring-primary/40' : 'bg-muted/30 text-muted-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <Button onClick={next} className="w-full" disabled={!current.response.trim()}>
        {step === 5 ? <><Check size={16} /> Complete</> : <>Continue <ChevronRight size={16} /></>}
      </Button>
    </div>
  );
}
