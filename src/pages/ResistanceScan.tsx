import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  { value: 'mental', label: 'Mental resistance', desc: 'Looping thoughts, analysis, trying to figure it out' },
  { value: 'emotional', label: 'Emotional resistance', desc: 'Fighting a feeling, tightening around it' },
  { value: 'body', label: 'Body tension', desc: 'Held in chest, jaw, shoulders, belly' },
  { value: 'control', label: 'Control / expectation', desc: 'Needing it to go a certain way' },
  { value: 'urgency', label: 'Urgency / pressure', desc: 'Feeling rushed or behind' },
  { value: 'looping', label: 'Looping thought', desc: 'Same thought replaying on repeat' },
  { value: 'comparison', label: 'Comparison', desc: 'Measuring against others or an ideal' },
  { value: 'fear', label: 'Fear of outcome', desc: 'Bracing for something unwanted' },
];

const RITUAL_MAP: Record<string, { name: string; to: string }> = {
  mental: { name: 'Thought Shift Ladder', to: '/reset/quiet/shift' },
  emotional: { name: 'Let It Be Here (Resistance Release)', to: '/reset/resistance' },
  body: { name: 'Move the Energy (Resistance Release)', to: '/reset/resistance' },
  control: { name: 'Higher View', to: '/reset/quiet/higher' },
  urgency: { name: 'Present Moment Interrupt', to: '/reset/quiet/present' },
  looping: { name: 'Mental Chatter to Clarity', to: '/reset/quiet/clarity' },
  comparison: { name: 'Contrast Reset', to: '/reset/contrast' },
  fear: { name: 'Soften the Thought (Resistance Release)', to: '/reset/resistance' },
};

const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } };

export default function ResistanceScan() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  const result = selected ? RITUAL_MAP[selected] : null;

  return (
    <div className="mx-auto max-w-lg px-4 pt-8 pb-6 space-y-6">
      <button onClick={() => navigate('/reset/quiet')} className="flex items-center gap-1.5 text-muted-foreground text-sm active:scale-95">
        <ArrowLeft size={16} /> Quiet the Mind
      </button>

      <div className="text-center space-y-2">
        <h1 className="font-heading text-xl font-semibold">Resistance Scan</h1>
        <p className="text-sm text-muted-foreground">What type of resistance is active right now?</p>
      </div>

      <div className="space-y-2">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setSelected(c.value)}
            className={`soul-card w-full text-left transition-all active:scale-[0.98] ${selected === c.value ? 'ring-1 ring-primary/40' : ''}`}
          >
            <h3 className="font-heading text-sm font-medium">{c.label}</h3>
            <p className="text-xs text-muted-foreground">{c.desc}</p>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div {...fadeUp} className="soul-card-raised text-center space-y-3">
            <p className="text-sm text-muted-foreground">Suggested first action</p>
            <h3 className="font-heading text-lg font-medium text-foreground">{result.name}</h3>
            <button
              onClick={() => navigate(result.to)}
              className="px-6 py-2.5 rounded-full bg-primary/15 text-primary font-medium text-sm active:scale-95"
            >
              Start →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
