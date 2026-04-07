import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/lib/AppContext';
import type { VibeCheck } from '@/lib/types';

const TEMPLATES = [
  'My ideal ordinary day',
  'The version of me I\'m becoming',
  'A day that felt aligned',
  'When relief became real',
  'The moment I felt supported',
  'Blank page',
];

const GUIDED_PROMPTS = [
  "What does this version of you notice?",
  "What feels different in your body?",
  "What is no longer heavy here?",
  "What does steadiness make possible?",
  "What feels simple now that used to feel hard?",
];

const VIBE_OPTIONS: { value: VibeCheck; label: string; emoji: string }[] = [
  { value: 'expansive', label: 'Expansive', emoji: '✦' },
  { value: 'mixed', label: 'Mixed', emoji: '◐' },
  { value: 'heavy', label: 'Heavy', emoji: '◆' },
];

export default function FuturePages() {
  const navigate = useNavigate();
  const { saveFuturePage } = useAppState();
  const [phase, setPhase] = useState<'template' | 'write' | 'vibe'>('template');
  const [template, setTemplate] = useState('');
  const [content, setContent] = useState('');
  const [promptIdx, setPromptIdx] = useState(0);
  const [vibeCheck, setVibeCheck] = useState<VibeCheck | null>(null);

  const selectTemplate = (t: string) => { setTemplate(t); setPhase('write'); };

  const finish = () => setPhase('vibe');

  const save = () => {
    saveFuturePage({ title: template, template, content, vibeCheck: vibeCheck || undefined });
    navigate('/reflect');
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/reflect')} className="text-muted-foreground p-2 -ml-2"><ArrowLeft size={20} /></button>
        <h1 className="font-heading text-lg font-semibold text-foreground">Future Pages</h1>
      </div>

      {phase === 'template' && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Choose a starting point</p>
          {TEMPLATES.map((t, i) => (
            <motion.button
              key={t}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => selectTemplate(t)}
              className="soul-card w-full text-left flex items-center justify-between"
            >
              <span className="text-sm text-foreground">{t}</span>
              <ChevronRight size={14} className="text-muted-foreground" />
            </motion.button>
          ))}
        </div>
      )}

      {phase === 'write' && (
        <div className="space-y-4">
          <div className="soul-card-raised space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Template</p>
            <p className="font-heading text-base text-primary">{template}</p>
          </div>

          {template !== 'Blank page' && (
            <div className="bg-muted/20 rounded-xl px-4 py-3 space-y-2">
              <p className="font-heading text-sm italic text-primary/80">{GUIDED_PROMPTS[promptIdx]}</p>
              {promptIdx < GUIDED_PROMPTS.length - 1 && (
                <button onClick={() => setPromptIdx(promptIdx + 1)} className="text-[10px] text-primary/50 hover:text-primary">
                  Next prompt →
                </button>
              )}
            </div>
          )}

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Begin writing…"
            className="w-full bg-transparent text-foreground text-sm resize-none focus:outline-none min-h-[200px] leading-relaxed placeholder:text-muted-foreground/30"
            autoFocus
          />

          <Button onClick={finish} className="w-full" disabled={content.trim().length < 10}>
            <Save size={14} /> Finish & Check In
          </Button>
        </div>
      )}

      {phase === 'vibe' && (
        <div className="space-y-6 text-center pt-8">
          <p className="font-heading text-lg text-foreground">How does that feel?</p>
          <div className="flex justify-center gap-4">
            {VIBE_OPTIONS.map(({ value, label, emoji }) => (
              <button
                key={value}
                onClick={() => setVibeCheck(value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                  vibeCheck === value ? 'bg-primary/15 ring-1 ring-primary/30' : 'bg-muted/20'
                }`}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs text-foreground">{label}</span>
              </button>
            ))}
          </div>

          {vibeCheck === 'heavy' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="soul-card text-left space-y-2">
              <p className="text-xs text-muted-foreground">That's okay. Consider:</p>
              <button onClick={() => navigate('/align/relief')} className="text-xs text-primary hover:underline block">→ Try a Relief Wheel</button>
              <button onClick={() => navigate('/reset/contrast')} className="text-xs text-primary hover:underline block">→ Quick Contrast Reset</button>
              <p className="text-[10px] text-muted-foreground/60">Or try a shorter entry next time.</p>
            </motion.div>
          )}

          <Button onClick={save} className="w-full" disabled={!vibeCheck}>Save Page</Button>
        </div>
      )}
    </div>
  );
}
