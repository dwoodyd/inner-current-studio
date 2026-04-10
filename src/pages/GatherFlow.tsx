import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Play, Library, Pencil, Trash2, GripVertical, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppState } from '@/lib/AppContext';

const TIERS = ['Relief', 'Opening', 'Steadying', 'Expanding'] as const;

const STARTER_LINES: Record<string, string[]> = {
  Relief: [
    "I don't have to solve everything right now.",
    "Relief is always one true thought away.",
    "I can soften without losing ground.",
  ],
  Opening: [
    "I'm more open than I realize.",
    "Something is shifting, even if I can't see it yet.",
    "There's space here I haven't noticed.",
  ],
  Steadying: [
    "I'm building something real with each return.",
    "Steadiness doesn't require perfection.",
    "I can hold this state a little longer today.",
  ],
  Expanding: [
    "Momentum is building quietly.",
    "I'm becoming more of who I already am.",
    "Clarity arrives when I stop gripping.",
  ],
};

type Tab = 'library' | 'build' | 'play';

export default function GatherFlow() {
  const navigate = useNavigate();
  const { state, saveGatheredSequence } = useAppState();
  const [tab, setTab] = useState<Tab>('library');
  const [buildLines, setBuildLines] = useState<string[]>([]);
  const [newLine, setNewLine] = useState('');
  const [playIndex, setPlayIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState('');

  const addLine = (line: string) => { setBuildLines(prev => [...prev, line]); setNewLine(''); setTab('build'); };
  const removeLine = (idx: number) => setBuildLines(prev => prev.filter((_, i) => i !== idx));

  const saveSequence = () => {
    if (buildLines.length < 2) return;
    saveGatheredSequence({ title: title || 'Untitled Sequence', lines: buildLines, playbackSettings: { speed: 4, mode: 'text' } });
    setBuildLines([]); setTitle(''); setTab('library');
  };

  const startPlay = (lines: string[]) => { setBuildLines(lines); setPlayIndex(0); setPlaying(true); setTab('play'); };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-5 soul-ambient-gold overflow-hidden">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/align')} className="text-muted-foreground p-2 -ml-2 hover:text-foreground transition-colors"><ArrowLeft size={20} /></button>
        <h1 className="font-heading text-lg font-semibold text-foreground">Gather Flow</h1>
      </div>

      {/* Tab bar */}
      <div className="flex rounded-2xl bg-muted/20 p-1 backdrop-blur-sm border border-border/10">
        {(['library', 'build', 'play'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-xs py-2.5 rounded-xl capitalize transition-all ${
              tab === t ? 'bg-card/80 text-foreground shadow-sm backdrop-blur-sm' : 'text-muted-foreground hover:text-foreground/70'
            }`}
          >
            {t === 'library' ? <span className="flex items-center justify-center gap-1.5"><Library size={12} /> Library</span> :
             t === 'build' ? <span className="flex items-center justify-center gap-1.5"><Pencil size={12} /> Build</span> :
             <span className="flex items-center justify-center gap-1.5"><Play size={12} /> Play</span>}
          </button>
        ))}
      </div>

      {/* Library */}
      {tab === 'library' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {state.gatheredSequences.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Saved Sequences</p>
              {state.gatheredSequences.map(seq => (
                <button
                  key={seq.id}
                  onClick={() => startPlay(seq.lines)}
                  className="soul-glass-elevated w-full text-left flex items-center justify-between p-4 rounded-2xl hover:scale-[1.01] active:scale-[0.98] transition-all"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{seq.title}</p>
                    <p className="text-[11px] text-muted-foreground">{seq.lines.length} thoughts</p>
                  </div>
                  <Play size={16} className="text-primary" />
                </button>
              ))}
            </div>
          )}

          {TIERS.map(tier => (
            <div key={tier} className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">{tier}</p>
              {STARTER_LINES[tier].map((line, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => addLine(line)}
                  className="w-full text-left text-xs text-foreground/80 soul-glass rounded-xl px-4 py-3 hover:scale-[1.01] active:scale-[0.98] transition-all"
                >
                  {line}
                  <Plus size={12} className="inline ml-2 text-primary/40" />
                </motion.button>
              ))}
            </div>
          ))}

          {state.gatheredSequences.length === 0 && (
            <div className="text-center py-6">
              <p className="font-heading text-sm italic text-muted-foreground/50">"Collect the thoughts that hold you together."</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Build */}
      {tab === 'build' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Sequence title…"
            className="w-full bg-transparent border-b border-border/30 text-foreground text-sm py-2 focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground/40 transition-colors"
          />

          <div className="space-y-2">
            {buildLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 soul-glass rounded-xl px-3 py-2.5"
              >
                <GripVertical size={12} className="text-muted-foreground/30" />
                <span className="flex-1 text-xs text-foreground">{line}</span>
                <button onClick={() => removeLine(i)}><Trash2 size={12} className="text-muted-foreground/30 hover:text-destructive transition-colors" /></button>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={newLine}
              onChange={e => setNewLine(e.target.value)}
              placeholder="Add a thought…"
              className="flex-1 soul-glass rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none placeholder:text-muted-foreground/40"
              onKeyDown={e => e.key === 'Enter' && newLine.trim() && addLine(newLine)}
            />
            <button onClick={() => newLine.trim() && addLine(newLine)} disabled={!newLine.trim()}
              className="px-3 py-2 text-primary disabled:opacity-30 transition-opacity">
              <Plus size={16} />
            </button>
          </div>

          {/* Picker from starter lines */}
          <details className="group">
            <summary className="text-[10px] uppercase tracking-wider text-muted-foreground/60 cursor-pointer select-none flex items-center gap-1.5 py-1">
              <Library size={10} /> Pick from library
            </summary>
            <div className="mt-2 space-y-3 max-h-[40vh] overflow-y-auto pr-1">
              {TIERS.map(tier => (
                <div key={tier} className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/40">{tier}</p>
                  {STARTER_LINES[tier].map((line, i) => {
                    const alreadyAdded = buildLines.includes(line);
                    return (
                      <button
                        key={i}
                        onClick={() => !alreadyAdded && addLine(line)}
                        disabled={alreadyAdded}
                        className={`w-full text-left text-xs soul-glass rounded-xl px-3 py-2.5 transition-all ${alreadyAdded ? 'opacity-30 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.98] text-foreground/80'}`}
                      >
                        {line}
                        {!alreadyAdded && <Plus size={10} className="inline ml-1.5 text-primary/40" />}
                        {alreadyAdded && <Check size={10} className="inline ml-1.5 text-primary/60" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </details>

          <button onClick={saveSequence} disabled={buildLines.length < 2}
            className="soul-btn-primary w-full">
            Save Sequence ({buildLines.length} thoughts)
          </button>
        </motion.div>
      )}

      {/* Play */}
      {tab === 'play' && buildLines.length > 0 && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={playIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-heading text-xl text-center text-foreground leading-relaxed px-4 max-w-sm"
            >
              {buildLines[playIndex]}
            </motion.p>
          </AnimatePresence>

          <p className="text-[10px] text-muted-foreground/50">{playIndex + 1} / {buildLines.length}</p>

          <div className="flex items-center gap-6">
            <button onClick={() => setPlayIndex(Math.max(0, playIndex - 1))} disabled={playIndex === 0}
              className="text-muted-foreground disabled:opacity-20 transition-opacity">
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => {
                if (playing) { setPlaying(false); } else {
                  setPlaying(true);
                  const interval = setInterval(() => {
                    setPlayIndex(prev => {
                      if (prev >= buildLines.length - 1) { clearInterval(interval); setPlaying(false); return prev; }
                      return prev + 1;
                    });
                  }, 4000);
                }
              }}
              className="w-14 h-14 rounded-full soul-glass-elevated flex items-center justify-center text-primary hover:scale-105 active:scale-95 transition-transform"
            >
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button onClick={() => setPlayIndex(Math.min(buildLines.length - 1, playIndex + 1))} disabled={playIndex === buildLines.length - 1}
              className="text-muted-foreground disabled:opacity-20 transition-opacity">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
