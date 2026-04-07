import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/lib/AppContext';

const CATEGORIES = ['money', 'work', 'relationships', 'creativity', 'health', 'home', 'travel', 'opportunities', 'self-trust'];

const PROMPTS: Record<string, string[]> = {
  money: [
    "Imagine if this could become easier than you think.",
    "Imagine if support is already moving toward you.",
    "Imagine if your relationship with money could soften.",
  ],
  work: [
    "Imagine if the next step is lighter than expected.",
    "Imagine if clarity arrives through movement, not pressure.",
    "Imagine if your work could feel like extension, not effort.",
  ],
  relationships: [
    "Imagine if connection could arrive without performing.",
    "Imagine if the right people are already noticing you.",
    "Imagine if warmth is closer than you think.",
  ],
  creativity: [
    "Imagine if your creativity doesn't need permission.",
    "Imagine if the next idea is already forming.",
    "Imagine if play is the doorway, not discipline.",
  ],
  health: [
    "Imagine if your body is doing more right than wrong.",
    "Imagine if healing has its own timeline and it's working.",
    "Imagine if ease is available in this body, today.",
  ],
  home: [
    "Imagine if your space could hold more peace.",
    "Imagine if home is a feeling you can create anywhere.",
    "Imagine if comfort is simpler than you think.",
  ],
  travel: [
    "Imagine if the world is waiting to welcome you.",
    "Imagine if the next adventure is already in motion.",
    "Imagine if distance opens what closeness couldn't.",
  ],
  opportunities: [
    "Imagine if doors are opening you haven't noticed yet.",
    "Imagine if the right timing is already unfolding.",
    "Imagine if readiness is quieter than you expected.",
  ],
  'self-trust': [
    "Imagine if you already know more than you think.",
    "Imagine if your instincts have been right more than wrong.",
    "Imagine if trusting yourself gets easier with practice.",
  ],
};

export default function ImagineIf() {
  const navigate = useNavigate();
  const { saveImagineIfEntry } = useAppState();
  const [category, setCategory] = useState<string | null>(null);
  const [promptIdx, setPromptIdx] = useState(0);
  const [response, setResponse] = useState('');
  const [saved, setSaved] = useState(false);

  const currentPrompts = category ? PROMPTS[category] : [];
  const currentPrompt = currentPrompts[promptIdx] || '';

  const shuffle = () => setPromptIdx(prev => (prev + 1) % currentPrompts.length);

  const save = () => {
    if (!category || !response.trim()) return;
    saveImagineIfEntry({ category, text: `${currentPrompt}\n\n${response}` });
    setSaved(true);
    setTimeout(() => { setResponse(''); setSaved(false); setCategory(null); }, 1500);
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/reflect')} className="text-muted-foreground p-2 -ml-2"><ArrowLeft size={20} /></button>
        <h1 className="font-heading text-lg font-semibold text-foreground">Imagine If</h1>
      </div>

      {!category ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Choose a direction</p>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => { setCategory(cat); setPromptIdx(0); }}
                className="soul-card text-center py-4 capitalize text-xs text-foreground hover:bg-muted/20"
              >
                {cat.replace('-', ' ')}
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={category + promptIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="text-center space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground capitalize">{category.replace('-', ' ')}</p>
              <button onClick={shuffle} className="text-muted-foreground/40 hover:text-muted-foreground"><RefreshCw size={12} /></button>
            </div>

            <p className="font-heading text-lg text-center text-primary italic leading-relaxed px-2">{currentPrompt}</p>

            <textarea
              value={response}
              onChange={e => setResponse(e.target.value)}
              placeholder="Let yourself imagine…"
              className="w-full bg-transparent border-b border-border/50 text-foreground text-sm resize-none focus:outline-none focus:border-primary/50 min-h-[100px] placeholder:text-muted-foreground/30"
              autoFocus
            />

            {saved ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <Heart size={24} className="mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Saved</p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                <Button onClick={save} className="w-full" disabled={!response.trim()}>
                  <Save size={14} /> Save This
                </Button>
                <Button variant="ghost" onClick={() => setCategory(null)} className="w-full text-muted-foreground text-xs">
                  Choose different category
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
