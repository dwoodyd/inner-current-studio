import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Play, Library, Pencil, Trash2, GripVertical, Pause, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useAppState } from '@/lib/AppContext';
import { PlaybackSettings, type PlaybackConfig } from '@/components/gather/PlaybackSettings';
import { startSound, stopSound, speakText, stopSpeech, setVolume } from '@/lib/sounds';

const TIERS = ['Relief', 'Opening', 'Receiving', 'Overflow'] as const;

const STARTER_LINES: Record<string, string[]> = {
  Relief: [
    "I don't have to figure out every dollar right now.",
    "Money stress doesn't define my worth.",
    "I can soften around money without ignoring it.",
    "It's safe to breathe and release financial tension.",
  ],
  Opening: [
    "I'm more supported than my fear suggests.",
    "Money is beginning to feel lighter in my body.",
    "I can hold space for abundance without forcing it.",
    "Something is shifting in my relationship with money.",
  ],
  Receiving: [
    "I am learning to receive without guilt.",
    "Money flows to me in ways I can't always predict.",
    "I deserve to be compensated fully and easily.",
    "Receiving is not selfish — it's alignment.",
  ],
  Overflow: [
    "There is always more where this came from.",
    "I circulate money with ease and trust.",
    "Abundance is my natural state of being.",
    "I am a magnet for financial well-being.",
  ],
};

type Tab = 'library' | 'build' | 'play';

export default function MoneyGatherFlow() {
  const navigate = useNavigate();
  const { state, saveGatheredSequence } = useAppState();
  const [tab, setTab] = useState<Tab>('library');
  const [buildLines, setBuildLines] = useState<string[]>([]);
  const [newLine, setNewLine] = useState('');
  const [playIndex, setPlayIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const [playbackConfig, setPlaybackConfig] = useState<PlaybackConfig>({
    voiceEnabled: false,
    soundEnabled: false,
    selectedSound: 'rain',
    volume: 0.4,
  });
  const speakingRef = useRef(false);
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      stopSound();
      stopSpeech();
    };
  }, []);

  useEffect(() => { setVolume(playbackConfig.volume); }, [playbackConfig.volume]);

  useEffect(() => {
    if (tab === 'play' && playbackConfig.soundEnabled) startSound(playbackConfig.selectedSound);
    else stopSound();
  }, [tab, playbackConfig.soundEnabled, playbackConfig.selectedSound]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setBreathPhase(p => p === 'in' ? 'out' : 'in'), 4000);
    return () => clearInterval(id);
  }, [playing]);

  const addLine = useCallback((line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    setBuildLines(prev => [...prev, trimmed]);
    setNewLine('');
  }, []);

  const removeLine = useCallback((i: number) => {
    setBuildLines(prev => prev.filter((_, idx) => idx !== i));
  }, []);

  const save = useCallback(() => {
    if (buildLines.length < 2 || !title.trim()) return;
    saveGatheredSequence({
      title: title.trim(),
      lines: buildLines,
      playbackSettings: { speed: 1, mode: 'text', ...playbackConfig },
    });
    setBuildLines([]);
    setTitle('');
    setTab('library');
  }, [buildLines, title, playbackConfig, saveGatheredSequence]);

  const startPlay = useCallback((lines: string[]) => {
    setBuildLines(lines);
    setPlayIndex(0);
    setPlaying(true);
    setTab('play');
  }, []);

  useEffect(() => {
    if (!playing || buildLines.length === 0) return;
    intervalRef.current = setInterval(() => {
      setPlayIndex(prev => {
        const next = prev + 1;
        if (next >= buildLines.length) { setPlaying(false); clearInterval(intervalRef.current); return prev; }
        return next;
      });
    }, 6000);
    return () => clearInterval(intervalRef.current);
  }, [playing, buildLines.length]);

  useEffect(() => {
    if (playing && playbackConfig.voiceEnabled && buildLines[playIndex]) {
      speakText(buildLines[playIndex]);
    }
  }, [playIndex, playing, playbackConfig.voiceEnabled, buildLines]);

  const togglePlay = useCallback(() => {
    if (playing) { clearInterval(intervalRef.current); stopSpeech(); }
    setPlaying(p => !p);
  }, [playing]);

  const moneySequences = state.gatheredSequences.filter(s => s.title.toLowerCase().includes('money') || s.title.toLowerCase().includes('wealth') || s.title.toLowerCase().includes('abundance'));

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(42 65% 58% / 0.08), hsl(160 30% 40% / 0.04), transparent 70%)' }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-6 safe-top">
        <button onClick={() => navigate('/money/hub')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} strokeWidth={1.5} />
          <span className="text-sm">Money Current</span>
        </button>

        <div className="text-center space-y-2">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Money Gather Flow</h1>
          <p className="text-sm text-muted-foreground">Build and absorb money-supportive thought sequences.</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 justify-center">
          {(['library', 'build', 'play'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? 'bg-soul-gold/20 text-soul-gold' : 'text-muted-foreground hover:text-foreground'}`}>
              {t === 'library' ? <Library size={16} className="inline mr-1" /> : t === 'build' ? <Pencil size={16} className="inline mr-1" /> : <Play size={16} className="inline mr-1" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* LIBRARY */}
        {tab === 'library' && (
          <div className="space-y-4">
            {moneySequences.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">Your Money Sequences</h3>
                {moneySequences.map(seq => (
                  <button key={seq.id} onClick={() => startPlay(seq.lines)}
                    className="soul-glass w-full text-left p-4 rounded-2xl hover:bg-muted/10 transition-all">
                    <h4 className="font-medium text-foreground">{seq.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{seq.lines.length} lines</p>
                  </button>
                ))}
              </div>
            )}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Starter Lines by Tier</h3>
              {TIERS.map(tier => (
                <div key={tier} className="space-y-1">
                  <h4 className="text-xs font-medium text-soul-gold">{tier}</h4>
                  {STARTER_LINES[tier].map((line, i) => (
                    <button key={i} onClick={() => { setBuildLines(prev => [...prev, line]); setTab('build'); }}
                      className="soul-glass w-full text-left p-3 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {line}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BUILD */}
        {tab === 'build' && (
          <div className="space-y-4">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Sequence title (e.g. Money Abundance Flow)"
              className="w-full bg-muted/20 border border-border/30 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-soul-gold/30" />
            
            <Reorder.Group axis="y" values={buildLines} onReorder={setBuildLines} className="space-y-2">
              {buildLines.map((line, i) => (
                <Reorder.Item key={line + i} value={line}
                  className="soul-glass flex items-center gap-2 p-3 rounded-xl cursor-grab active:cursor-grabbing">
                  <GripVertical size={14} className="text-muted-foreground/40 shrink-0" />
                  <span className="flex-1 text-sm text-foreground">{line}</span>
                  <button onClick={() => removeLine(i)}><Trash2 size={14} className="text-muted-foreground/40 hover:text-destructive" /></button>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            <div className="flex gap-2">
              <input value={newLine} onChange={e => setNewLine(e.target.value)} placeholder="Add a money thought…"
                onKeyDown={e => e.key === 'Enter' && addLine(newLine)}
                className="flex-1 bg-muted/20 border border-border/30 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-soul-gold/30" />
              <button onClick={() => addLine(newLine)} className="p-3 rounded-xl bg-soul-gold/20 text-soul-gold hover:bg-soul-gold/30 transition-colors">
                <Plus size={18} />
              </button>
            </div>

            <PlaybackSettings config={playbackConfig} onChange={setPlaybackConfig} />

            <button onClick={save} disabled={buildLines.length < 2 || !title.trim()}
              className="w-full py-3 rounded-2xl font-medium transition-all disabled:opacity-30 bg-soul-gold/20 text-soul-gold hover:bg-soul-gold/30">
              <Check size={16} className="inline mr-2" />Save Sequence
            </button>
          </div>
        )}

        {/* PLAY */}
        {tab === 'play' && buildLines.length > 0 && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
            <motion.div
              className="w-28 h-28 rounded-full"
              style={{ background: 'radial-gradient(circle at 40% 35%, hsl(42 65% 58% / 0.25), hsl(160 30% 40% / 0.1))' }}
              animate={{ scale: breathPhase === 'in' ? 1.15 : 0.95 }}
              transition={{ duration: 4, ease: 'easeInOut' }}
            />
            <AnimatePresence mode="wait">
              <motion.p key={playIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="text-center text-lg font-heading text-foreground max-w-sm leading-relaxed px-4">
                {buildLines[playIndex]}
              </motion.p>
            </AnimatePresence>
            <p className="text-xs text-muted-foreground">{playIndex + 1} / {buildLines.length}</p>
            <div className="flex items-center gap-6">
              <button onClick={() => setPlayIndex(p => Math.max(0, p - 1))}><ChevronLeft size={22} className="text-muted-foreground hover:text-foreground" /></button>
              <button onClick={togglePlay} className="w-14 h-14 rounded-full bg-soul-gold/20 flex items-center justify-center text-soul-gold hover:bg-soul-gold/30 transition-colors">
                {playing ? <Pause size={22} /> : <Play size={22} />}
              </button>
              <button onClick={() => setPlayIndex(p => Math.min(buildLines.length - 1, p + 1))}><ChevronRight size={22} className="text-muted-foreground hover:text-foreground" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
