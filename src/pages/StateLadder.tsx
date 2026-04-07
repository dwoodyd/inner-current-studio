import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/lib/AppContext';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { EmotionalState } from '@/lib/types';

interface LadderState {
  value: EmotionalState;
  label: string;
  bodyCue: string;
  color: string;
}

const ladder: LadderState[] = [
  { value: 'shut-down', label: 'Shut Down', bodyCue: 'Numb, frozen, disconnected from body', color: 'bg-soul-dim/40' },
  { value: 'raw', label: 'Raw', bodyCue: 'Exposed, tender, easily overwhelmed', color: 'bg-soul-dim/50' },
  { value: 'tense', label: 'Tense', bodyCue: 'Tight shoulders, clenched jaw, shallow breath', color: 'bg-soul-dim/60' },
  { value: 'discouraged', label: 'Discouraged', bodyCue: 'Heavy chest, low energy, sighing', color: 'bg-soul-dim/70' },
  { value: 'scattered', label: 'Scattered', bodyCue: 'Restless hands, racing thoughts, unfocused', color: 'bg-soul-blue/30' },
  { value: 'doubtful', label: 'Doubtful', bodyCue: 'Uncertain posture, hesitant movement', color: 'bg-soul-blue/40' },
  { value: 'restless', label: 'Restless', bodyCue: 'Fidgeting, impatient, wanting change', color: 'bg-soul-blue/50' },
  { value: 'flat', label: 'Flat', bodyCue: 'Neither up nor down, just still', color: 'bg-muted' },
  { value: 'neutral', label: 'Neutral', bodyCue: 'Stable, present, not reaching', color: 'bg-soul-violet/20' },
  { value: 'open', label: 'Open', bodyCue: 'Relaxed shoulders, deeper breathing', color: 'bg-soul-violet/30' },
  { value: 'steady', label: 'Steady', bodyCue: 'Grounded feet, calm center', color: 'bg-soul-violet/40' },
  { value: 'hopeful', label: 'Hopeful', bodyCue: 'Lightness in chest, looking forward', color: 'bg-soul-green/30' },
  { value: 'uplifted', label: 'Uplifted', bodyCue: 'Warm center, soft smile', color: 'bg-soul-green/40' },
  { value: 'clear', label: 'Clear', bodyCue: 'Sharp focus, easy decisions', color: 'bg-soul-gold/30' },
  { value: 'energized', label: 'Energized', bodyCue: 'Full breath, ready for action', color: 'bg-soul-gold/40' },
  { value: 'flowing', label: 'Flowing', bodyCue: 'Effortless movement, joyful ease', color: 'bg-soul-gold/50' },
];

const ritualSuggestions: Record<string, string> = {
  'shut-down': 'Start with a 1-minute Stillness Timer',
  'raw': 'Try a gentle Contrast Reset',
  'tense': 'Use a 30-second body release, then Contrast Reset',
  'discouraged': 'Start with Contrast Reset to name what feels heavy',
  'scattered': 'Try a 3-minute Stillness Timer to center',
  'doubtful': 'Use a Contrast Reset to soften the doubt',
  'restless': 'Try a quick Momentum Ring to channel energy',
  'flat': 'Start with a Stillness Timer, then a Relief Wheel',
  'neutral': 'A good place to begin an Alignment Wheel',
  'open': 'Build on this with a Gather Flow session',
  'steady': 'Lock it in with a Momentum Ring',
  'hopeful': 'Channel this into a Future Pages entry',
  'uplifted': 'Capture this in a Gather Flow sequence',
  'clear': 'Perfect for an Alignment Wheel session',
  'energized': 'Use a Momentum Ring to sustain this',
  'flowing': 'Celebrate with a Future Pages entry',
};

export default function StateLadder() {
  const [selected, setSelected] = useState<number | null>(null);
  const { addCheckIn } = useAppState();
  const navigate = useNavigate();

  const handleSelect = (index: number) => {
    setSelected(index);
    addCheckIn(ladder[index].value);
  };

  const nextState = selected !== null && selected < ladder.length - 1 ? ladder[selected + 1] : null;

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/reset')} className="text-muted-foreground hover:text-foreground" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">State Ladder</h1>
          <p className="text-xs text-muted-foreground">Where are you right now?</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {ladder.map((s, i) => (
          <button
            key={s.value}
            onClick={() => handleSelect(i)}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
              selected === i
                ? 'border border-primary/30 bg-primary/10'
                : 'border border-transparent hover:bg-muted/30'
            }`}
          >
            <div className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
            <div className="flex-1">
              <span className={`text-sm font-medium ${selected === i ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
            </div>
            {selected === i && <ChevronRight size={14} className="text-primary" />}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="soul-card space-y-3">
              <h3 className="font-heading text-base font-medium text-foreground">
                You're at: {ladder[selected].label}
              </h3>
              <p className="text-xs text-muted-foreground">{ladder[selected].bodyCue}</p>

              {nextState && (
                <div className="border-t border-border/30 pt-3 space-y-1">
                  <p className="text-xs text-muted-foreground">Next reachable state:</p>
                  <p className="text-sm font-medium text-primary">{nextState.label}</p>
                  <p className="text-xs text-muted-foreground">{nextState.bodyCue}</p>
                </div>
              )}

              <div className="border-t border-border/30 pt-3">
                <p className="text-xs text-muted-foreground">Suggested ritual:</p>
                <p className="text-sm text-foreground mt-1">{ritualSuggestions[ladder[selected].value]}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
