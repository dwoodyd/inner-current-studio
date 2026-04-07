import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface Pack {
  title: string;
  trigger: string;
  loop: string;
  bodyCue: string;
  softer: string;
  quickReset: string;
  journalPrompt: string;
  ritualName: string;
  ritualTo: string;
}

const PACKS: Pack[] = [
  { title: 'Work Tension', trigger: 'Pressure to perform or deliver', loop: '"I\'m not doing enough"', bodyCue: 'Shoulders, jaw', softer: 'I can only do what I can do right now. That is enough for this moment.', quickReset: 'Drop shoulders. Three breaths. Return to one task.', journalPrompt: 'What would this workday feel like if I trusted my pace?', ritualName: 'Contrast Reset', ritualTo: '/reset/contrast' },
  { title: 'Money Stress', trigger: 'Fear around finances or scarcity', loop: '"There\'s never enough"', bodyCue: 'Belly, chest', softer: 'I have navigated tight moments before. I can take one step from here.', quickReset: 'Hand on belly. Exhale. "I am resourceful."', journalPrompt: 'What would change if I felt supported?', ritualName: 'Overflow Practice', ritualTo: '/reflect/overflow' },
  { title: 'Family Pressure', trigger: 'Emotional weight from family dynamics', loop: '"I can\'t say what I really feel"', bodyCue: 'Throat, chest', softer: 'My feelings are valid even when I can\'t voice them.', quickReset: 'Notice the tightness in your throat. Breathe into it.', journalPrompt: 'What boundary would feel like relief, not rejection?', ritualName: 'Resistance Release', ritualTo: '/reset/resistance' },
  { title: 'Relationships', trigger: 'Emotional friction in close connections', loop: '"They don\'t understand me"', bodyCue: 'Chest, throat', softer: 'I can hold my truth without needing them to confirm it.', quickReset: 'Place hand on heart. "I am safe in my own knowing."', journalPrompt: 'What do I actually need here, underneath the frustration?', ritualName: 'Thought Shift Ladder', ritualTo: '/reset/quiet/shift' },
  { title: 'Self-Doubt', trigger: 'Questioning your worth or capability', loop: '"I\'m not good enough for this"', bodyCue: 'Chest, belly', softer: 'I am learning. That is not the same as failing.', quickReset: 'Name one thing you did today that required courage.', journalPrompt: 'What would I do differently if I believed in my capacity?', ritualName: 'Relief Wheel', ritualTo: '/align/relief' },
  { title: 'Comparison', trigger: 'Measuring yourself against others', loop: '"Everyone else is ahead of me"', bodyCue: 'Chest, thoughts', softer: 'Their path has nothing to do with mine. I can\'t see their struggle.', quickReset: 'Close eyes. Return to your own breath for 30 seconds.', journalPrompt: 'What would I create if no one was watching?', ritualName: 'Present Moment Interrupt', ritualTo: '/reset/quiet/present' },
  { title: 'Social Anxiety', trigger: 'Anticipation or recovery from social interaction', loop: '"I said the wrong thing"', bodyCue: 'Belly, hands', softer: 'Most people are too focused on themselves to remember my awkwardness.', quickReset: 'Open your hands. Unclench. "I am allowed to take up space."', journalPrompt: 'What if people actually like me more than I assume?', ritualName: 'Analytical Mind Off-Ramp', ritualTo: '/reset/quiet/offramp' },
  { title: 'Waiting for a Result', trigger: 'Uncertainty about an outcome', loop: '"What if it doesn\'t work out?"', bodyCue: 'Everywhere', softer: 'I cannot control the outcome. I can tend to my state while I wait.', quickReset: 'Three breaths. Name one thing you CAN influence right now.', journalPrompt: 'What would it feel like to trust the timing?', ritualName: 'Stillness Timer', ritualTo: '/reset/stillness' },
];

export default function SituationPacks() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Pack | null>(null);

  return (
    <div className="mx-auto max-w-lg px-4 pt-8 pb-6 space-y-6">
      <button onClick={() => navigate('/reset/quiet')} className="flex items-center gap-1.5 text-muted-foreground text-sm active:scale-95">
        <ArrowLeft size={16} /> Quiet the Mind
      </button>

      <div className="text-center space-y-2">
        <h1 className="font-heading text-xl font-semibold">Situation Packs</h1>
        <p className="text-sm text-muted-foreground">Choose what you're working through.</p>
      </div>

      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            {PACKS.map((p, i) => (
              <motion.button key={p.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => setSelected(p)}
                className="soul-card w-full text-left active:scale-[0.98]">
                <h3 className="font-heading text-sm font-medium">{p.title}</h3>
                <p className="text-xs text-muted-foreground">{p.trigger}</p>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div key="detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <button onClick={() => setSelected(null)} className="text-xs text-muted-foreground hover:text-foreground">← All packs</button>
            <h2 className="font-heading text-xl font-semibold">{selected.title}</h2>

            <div className="soul-card space-y-3">
              <div><span className="text-xs text-muted-foreground">Common trigger</span><p className="text-sm">{selected.trigger}</p></div>
              <div><span className="text-xs text-muted-foreground">Common loop</span><p className="text-sm italic">{selected.loop}</p></div>
              <div><span className="text-xs text-muted-foreground">Body cue</span><p className="text-sm">{selected.bodyCue}</p></div>
            </div>

            <div className="soul-card-raised space-y-2">
              <span className="text-xs text-muted-foreground">Softer angle</span>
              <p className="text-sm text-primary/90">{selected.softer}</p>
            </div>

            <div className="soul-card space-y-2">
              <span className="text-xs text-muted-foreground">Quick reset</span>
              <p className="text-sm">{selected.quickReset}</p>
            </div>

            <div className="soul-card space-y-2">
              <span className="text-xs text-muted-foreground">Journal prompt</span>
              <p className="text-sm italic">{selected.journalPrompt}</p>
            </div>

            <button onClick={() => navigate(selected.ritualTo)}
              className="w-full py-3 rounded-xl bg-primary/15 text-primary font-medium text-sm active:scale-95">
              Try {selected.ritualName} →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
