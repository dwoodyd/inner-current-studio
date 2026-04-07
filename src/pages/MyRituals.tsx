import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, GripVertical, Trash2, Save, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/lib/AppContext';

const AVAILABLE_STEPS = [
  'Check-in',
  'Stillness Timer',
  'Contrast Reset',
  'Alignment Wheel',
  'Relief Wheel',
  'Momentum Ring',
  'Gather Flow',
  'Future Pages',
  'Imagine If',
  'Overflow Practice',
];

const STEP_DURATIONS: Record<string, number> = {
  'Check-in': 1,
  'Stillness Timer': 5,
  'Contrast Reset': 3,
  'Alignment Wheel': 15,
  'Relief Wheel': 8,
  'Momentum Ring': 2,
  'Gather Flow': 10,
  'Future Pages': 10,
  'Imagine If': 5,
  'Overflow Practice': 5,
};

export default function MyRituals() {
  const navigate = useNavigate();
  const { state, saveCustomRitual } = useAppState();
  const [building, setBuilding] = useState(false);
  const [name, setName] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const addStep = (step: string) => {
    setSteps(prev => [...prev, step]);
    setShowPicker(false);
  };

  const removeStep = (idx: number) => setSteps(prev => prev.filter((_, i) => i !== idx));

  const totalMinutes = steps.reduce((sum, s) => sum + (STEP_DURATIONS[s] || 5), 0);

  const save = () => {
    if (steps.length < 2 || !name.trim()) return;
    saveCustomRitual({ name, steps, durationEstimate: totalMinutes });
    setBuilding(false);
    setName('');
    setSteps([]);
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/profile')} className="text-muted-foreground p-2 -ml-2"><ArrowLeft size={20} /></button>
        <h1 className="font-heading text-lg font-semibold text-foreground">My Rituals</h1>
      </div>

      {!building ? (
        <div className="space-y-3">
          {state.customRituals.length > 0 ? (
            state.customRituals.map((ritual, i) => (
              <motion.div
                key={ritual.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="soul-card space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{ritual.name}</p>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock size={10} /> ~{ritual.durationEstimate}m
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ritual.steps.map((step, j) => (
                    <span key={j} className="text-[10px] bg-muted/30 text-muted-foreground px-2 py-0.5 rounded-full">{step}</span>
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="font-heading text-sm italic text-muted-foreground">"Build a ritual that fits your real life."</p>
            </div>
          )}

          <Button onClick={() => setBuilding(true)} className="w-full"><Plus size={14} /> Build New Ritual</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ritual name…"
            className="w-full bg-transparent border-b border-border/50 text-foreground text-sm py-2 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40"
          />

          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/20 rounded-xl px-3 py-2.5">
                <GripVertical size={12} className="text-muted-foreground/40" />
                <span className="flex-1 text-xs text-foreground">{step}</span>
                <span className="text-[10px] text-muted-foreground">~{STEP_DURATIONS[step] || 5}m</span>
                <button onClick={() => removeStep(i)}><Trash2 size={12} className="text-muted-foreground/40 hover:text-destructive" /></button>
              </div>
            ))}
          </div>

          {showPicker ? (
            <div className="bg-muted/10 rounded-xl p-3 space-y-1">
              {AVAILABLE_STEPS.filter(s => !steps.includes(s) || true).map(step => (
                <button
                  key={step}
                  onClick={() => addStep(step)}
                  className="w-full text-left text-xs text-foreground/80 px-3 py-2 rounded-lg hover:bg-muted/20"
                >
                  <Plus size={10} className="inline mr-2 text-primary/50" />{step}
                </button>
              ))}
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowPicker(true)} className="w-full text-xs"><Plus size={14} /> Add Step</Button>
          )}

          {steps.length > 0 && (
            <p className="text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1">
              <Clock size={10} /> Estimated: ~{totalMinutes} minutes
            </p>
          )}

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => { setBuilding(false); setSteps([]); setName(''); }} className="flex-1">Cancel</Button>
            <Button onClick={save} className="flex-1" disabled={steps.length < 2 || !name.trim()}>
              <Save size={14} /> Save Ritual
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
