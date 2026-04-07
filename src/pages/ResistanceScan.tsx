import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scan } from 'lucide-react';

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

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } };

export default function ResistanceScan() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  const result = selected ? RITUAL_MAP[selected] : null;

  return (
    <div className="mx-auto max-w-lg px-5 pt-8 pb-8 space-y-7 soul-ambient-violet">
      <button onClick={() => navigate('/reset/quiet')} className="flex items-center gap-1.5 text-muted-foreground text-sm active:scale-95 transition-transform">
        <ArrowLeft size={16} /> Quiet the Mind
      </button>

      <div className="text-center space-y-3">
        <Scan size={22} className="text-soul-violet mx-auto" strokeWidth={1.5} />
        <h1 className="font-heading text-xl font-semibold tracking-tight">Resistance Scan</h1>
        <p className="text-sm text-muted-foreground">What type of resistance is active right now?</p>
      </div>

      <div className="space-y-2.5">
        {CATEGORIES.map((c, i) => (
          <motion.button
            key={c.value}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setSelected(c.value)}
            className={`soul-glass-elevated w-full text-left p-4 rounded-2xl transition-all active:scale-[0.98] ${selected === c.value ? 'ring-1 ring-primary/30' : ''}`}
          >
            <h3 className="font-heading text-sm font-medium tracking-tight">{c.label}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div {...fadeUp} className="soul-card-raised text-center space-y-4 py-6">
            <p className="text-xs text-muted-foreground tracking-wide uppercase">Suggested first action</p>
            <h3 className="font-heading text-lg font-medium text-foreground">{result.name}</h3>
            <button onClick={() => navigate(result.to)} className="soul-btn-primary">
              Start →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
