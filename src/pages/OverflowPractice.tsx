import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/lib/AppContext';

const MODES = [
  { mode: 'money', resource: '$2,000 to direct freely today' },
  { mode: 'time', resource: '3 free hours to spend however you want' },
  { mode: 'support', resource: 'One unexpected supportive opportunity arrives' },
  { mode: 'opportunity', resource: 'A door opens that you didn\'t expect' },
  { mode: 'creativity', resource: 'An overflow of creative energy today' },
  { mode: 'energy', resource: 'A deep, sustained energy that carries you' },
];

const STEPS = [
  { key: 'entry', question: 'What would you choose?' },
  { key: 'feeling', question: 'Why does it matter to you?' },
  { key: 'resistance', question: 'What would it feel like to receive this?' },
];

export default function OverflowPractice() {
  const navigate = useNavigate();
  const { saveOverflowEntry } = useAppState();
  const [selectedMode, setSelectedMode] = useState<typeof MODES[0] | null>(null);
  const [step, setStep] = useState(0);
  const [entry, setEntry] = useState('');
  const [feeling, setFeeling] = useState('');
  const [resistance, setResistance] = useState('');
  const [done, setDone] = useState(false);

  const currentValues = [entry, feeling, resistance];
  const setters = [setEntry, setFeeling, setResistance];

  const next = () => {
    if (step < 2) setStep(step + 1);
    else {
      saveOverflowEntry({
        mode: selectedMode!.mode,
        resourceAmount: selectedMode!.resource,
        entryText: entry,
        feelingText: feeling,
        resistanceNote: resistance,
      });
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-20 pb-6 text-center space-y-6">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-heading text-xl text-foreground">
          You practiced receiving.
        </motion.p>
        <p className="text-sm text-muted-foreground">That's a real shift, even in imagination.</p>
        <Button onClick={() => navigate('/reflect')} className="w-full">Return to Reflect</Button>
      </div>
    );
  }

  if (!selectedMode) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/reflect')} className="text-muted-foreground p-2 -ml-2"><ArrowLeft size={20} /></button>
          <h1 className="font-heading text-lg font-semibold text-foreground">Overflow Practice</h1>
        </div>
        <p className="text-sm text-muted-foreground">Today, imagine an overflow of…</p>
        <div className="space-y-2">
          {MODES.map(({ mode, resource }, i) => (
            <motion.button
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setSelectedMode({ mode, resource })}
              className="soul-card w-full text-left flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-foreground capitalize">{mode}</p>
                <p className="text-[11px] text-muted-foreground">{resource}</p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground" />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => setSelectedMode(null)} className="text-muted-foreground p-2 -ml-2"><ArrowLeft size={20} /></button>
        <h1 className="font-heading text-lg font-semibold text-foreground">Overflow Practice</h1>
      </div>

      <div className="soul-card-raised text-center space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Today's overflow</p>
        <p className="font-heading text-base text-primary">{selectedMode.resource}</p>
      </div>

      <div className="flex justify-center gap-2">
        {STEPS.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-primary scale-125' : i < step ? 'bg-secondary' : 'bg-muted'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
          <p className="font-heading text-base text-foreground">{STEPS[step].question}</p>
          <textarea
            value={currentValues[step]}
            onChange={e => setters[step](e.target.value)}
            placeholder="Write freely…"
            className="w-full bg-transparent border-b border-border/50 text-foreground text-sm resize-none focus:outline-none focus:border-primary/50 min-h-[90px] placeholder:text-muted-foreground/30"
            autoFocus
          />
        </motion.div>
      </AnimatePresence>

      <Button onClick={next} className="w-full" disabled={!currentValues[step].trim()}>
        {step === 2 ? <><Save size={14} /> Complete</> : <>Continue <ChevronRight size={14} /></>}
      </Button>
    </div>
  );
}
