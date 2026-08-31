import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, Wind, Waves, Sun, Sparkles, Orbit } from 'lucide-react';
import { startSound, stopSound, setVolume, speakText, stopSpeech } from '@/lib/sounds';
import { SOUND_OPTIONS } from '@/lib/sounds';
import { useAppState } from '@/lib/AppContext';

/* ── Exercise definitions ── */
interface BreathExercise {
  id: string;
  name: string;
  description: string;
  icon: typeof Wind;
  iconColor: string;
  gradient: string;
  phases: { label: string; seconds: number }[];
  rounds: number;
  voiceIntro: string;
  voicePhasePrompts: Record<string, string>;
}

const EXERCISES: BreathExercise[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Equal inhale, hold, exhale, hold — calms the nervous system.',
    icon: Wind,
    iconColor: 'text-soul-blue',
    gradient: 'from-soul-blue/15 to-soul-blue/5',
    phases: [
      { label: 'Inhale', seconds: 4 },
      { label: 'Hold', seconds: 4 },
      { label: 'Exhale', seconds: 4 },
      { label: 'Hold', seconds: 4 },
    ],
    rounds: 6,
    voiceIntro: 'Box breathing. Four counts in, hold, four counts out, hold. Let your body settle.',
    voicePhasePrompts: { Inhale: 'Breathe in', Hold: 'Hold gently', Exhale: 'Let it go' },
  },
  {
    id: '478',
    name: '4-7-8 Calming',
    description: 'Deep calm breath — inhale 4, hold 7, exhale 8.',
    icon: Orbit,
    iconColor: 'text-soul-violet',
    gradient: 'from-soul-violet/15 to-soul-violet/5',
    phases: [
      { label: 'Inhale', seconds: 4 },
      { label: 'Hold', seconds: 7 },
      { label: 'Exhale', seconds: 8 },
    ],
    rounds: 4,
    voiceIntro: 'Four seven eight breathing. A deep settling pattern. Breathe in for four, hold for seven, exhale slowly for eight.',
    voicePhasePrompts: { Inhale: 'Breathe in deeply', Hold: 'Hold it here', Exhale: 'Release slowly' },
  },
  {
    id: 'coherent',
    name: 'Coherent Breathing',
    description: 'Simple 5-in, 5-out rhythm for heart-brain coherence.',
    icon: Waves,
    iconColor: 'text-soul-green',
    gradient: 'from-soul-green/15 to-soul-green/5',
    phases: [
      { label: 'Inhale', seconds: 5 },
      { label: 'Exhale', seconds: 5 },
    ],
    rounds: 10,
    voiceIntro: 'Coherent breathing. Five seconds in, five seconds out. A rhythm your body already knows.',
    voicePhasePrompts: { Inhale: 'In', Exhale: 'Out' },
  },
  {
    id: 'energize',
    name: 'Energizing Breath',
    description: 'Quick inhale, brief hold, longer exhale — lifts energy gently.',
    icon: Sun,
    iconColor: 'text-soul-gold',
    gradient: 'from-soul-gold/15 to-soul-gold/5',
    phases: [
      { label: 'Inhale', seconds: 2 },
      { label: 'Hold', seconds: 2 },
      { label: 'Exhale', seconds: 4 },
    ],
    rounds: 8,
    voiceIntro: 'Energizing breath. Quick inhale, brief hold, slow release. Feel the lift.',
    voicePhasePrompts: { Inhale: 'Quick breath in', Hold: 'Hold', Exhale: 'Slowly out' },
  },
  {
    id: 'settle',
    name: 'Settling Breath',
    description: 'Extended exhale pattern — activates rest & digest.',
    icon: Sparkles,
    iconColor: 'text-primary',
    gradient: 'from-primary/15 to-primary/5',
    phases: [
      { label: 'Inhale', seconds: 3 },
      { label: 'Exhale', seconds: 6 },
      { label: 'Rest', seconds: 2 },
    ],
    rounds: 6,
    voiceIntro: 'Settling breath. Short inhale, long exhale, brief rest. Let everything soften.',
    voicePhasePrompts: { Inhale: 'Gently in', Exhale: 'Long release', Rest: 'Just be' },
  },
];

type Screen = 'menu' | 'setup' | 'active' | 'complete';
const BREATHWORK_SESSION_KEY = 'innerwake_breathwork_session';

export default function Breathwork() {
  const navigate = useNavigate();
  const { updateTodayFlow } = useAppState();
  const [screen, setScreen] = useState<Screen>('menu');
  const [exercise, setExercise] = useState<BreathExercise | null>(null);

  // Settings
  const [voiceGuided, setVoiceGuided] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState('bowl');
  const [volume, setVolumeState] = useState(0.35);

  // Active session state
  const [round, setRound] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [paused, setPaused] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => () => { stopSound(); stopSpeech(); }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BREATHWORK_SESSION_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        screen: Screen; exerciseId: string; voiceGuided: boolean; soundEnabled: boolean;
        selectedSound: string; volume: number; round: number; phaseIdx: number; phaseTimer: number;
      };
      const restored = EXERCISES.find(item => item.id === saved.exerciseId);
      if (!restored) return;
      setExercise(restored);
      setVoiceGuided(saved.voiceGuided);
      setSoundEnabled(saved.soundEnabled);
      setSelectedSound(saved.selectedSound);
      setVolumeState(saved.volume);
      setRound(saved.round);
      setPhaseIdx(saved.phaseIdx);
      setPhaseTimer(Math.max(1, saved.phaseTimer));
      setPaused(true);
      setScreen(saved.screen === 'active' ? 'active' : 'setup');
    } catch {
      localStorage.removeItem(BREATHWORK_SESSION_KEY);
    }
  }, []);

  useEffect(() => {
    if (!exercise || screen === 'menu' || screen === 'complete') return;
    try {
      localStorage.setItem(BREATHWORK_SESSION_KEY, JSON.stringify({
        screen, exerciseId: exercise.id, voiceGuided, soundEnabled, selectedSound,
        volume, round, phaseIdx, phaseTimer, paused, updatedAt: new Date().toISOString(),
      }));
    } catch {}
  }, [screen, exercise, voiceGuided, soundEnabled, selectedSound, volume, round, phaseIdx, phaseTimer, paused]);

  const totalRoundTime = exercise ? exercise.phases.reduce((a, p) => a + p.seconds, 0) : 0;

  const startSession = useCallback(() => {
    if (!exercise) return;
    setRound(0);
    setPhaseIdx(0);
    setPhaseTimer(exercise.phases[0].seconds);
    setPaused(false);
    setScreen('active');
    if (soundEnabled) startSound(selectedSound, volume);
    if (voiceGuided) speakText(exercise.voiceIntro, 0.85);
  }, [exercise, soundEnabled, selectedSound, volume, voiceGuided]);

  // Tick
  useEffect(() => {
    if (screen !== 'active' || paused || !exercise) return;
    tickRef.current = setInterval(() => {
      setPhaseTimer(prev => {
        if (prev <= 1) {
          // Move to next phase or round
          setPhaseIdx(pi => {
            const nextPi = pi + 1;
            if (nextPi >= exercise.phases.length) {
              // Next round
              setRound(r => {
                if (r + 1 >= exercise.rounds) {
                  // Done
                  clearInterval(tickRef.current);
                  stopSound();
                  localStorage.removeItem(BREATHWORK_SESSION_KEY);
                  updateTodayFlow({ resetUsed: true });
                  setScreen('complete');
                  if (voiceGuided) speakText('Well done. Take a moment to notice how you feel.', 0.8);
                  return r;
                }
                return r + 1;
              });
              // Reset to first phase
              const firstPhase = exercise.phases[0];
              if (voiceGuided) {
                const prompt = exercise.voicePhasePrompts[firstPhase.label];
                if (prompt) speakText(prompt, 0.9);
              }
              setPhaseTimer(firstPhase.seconds);
              return 0;
            }
            const nextPhase = exercise.phases[nextPi];
            if (voiceGuided) {
              const prompt = exercise.voicePhasePrompts[nextPhase.label];
              if (prompt) speakText(prompt, 0.9);
            }
            setPhaseTimer(nextPhase.seconds);
            return nextPi;
          });
          return 0; // Will be overwritten by setPhaseTimer above
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [screen, paused, exercise, voiceGuided]);

  useEffect(() => {
    if (soundEnabled && screen === 'active') setVolume(volume);
  }, [volume, soundEnabled, screen]);

  const togglePause = () => {
    setPaused(p => !p);
    if (!paused) { stopSpeech(); }
  };

  const stopSession = () => {
    clearInterval(tickRef.current);
    stopSound();
    stopSpeech();
    localStorage.removeItem(BREATHWORK_SESSION_KEY);
    setScreen('menu');
  };

  const currentPhase = exercise?.phases[phaseIdx];
  const phaseProgress = currentPhase ? 1 - phaseTimer / currentPhase.seconds : 0;

  // Orb scale based on phase
  const orbScale = currentPhase?.label === 'Inhale'
    ? 1 + phaseProgress * 0.4
    : currentPhase?.label === 'Exhale'
    ? 1.4 - phaseProgress * 0.4
    : 1.2; // Hold / Rest

  return (
    <div className={`${screen === 'active' ? 'min-h-[100dvh] max-w-none px-6 pt-8 bg-[radial-gradient(circle_at_50%_35%,hsl(var(--primary)/0.10),transparent_60%),hsl(var(--background))]' : 'mx-auto max-w-lg px-4 pt-6'} pb-6 space-y-5 soul-ambient-gold overflow-hidden`}>
      {/* Header */}
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <button onClick={() => screen === 'menu' ? navigate('/reset') : stopSession()} className="text-muted-foreground p-2 -ml-2 hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-heading text-lg font-semibold text-foreground">Breathwork</h1>
      </div>

      {/* Menu */}
      {screen === 'menu' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Guided breathing exercises to settle, energize, or reset your state.
          </p>
          {EXERCISES.map(ex => {
            const Icon = ex.icon;
            return (
              <motion.button
                key={ex.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => { setExercise(ex); setScreen('setup'); }}
                className="soul-glass-elevated w-full text-left flex items-center gap-4 p-4 rounded-2xl transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98] group"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${ex.gradient} flex items-center justify-center shrink-0`}>
                  <Icon size={20} strokeWidth={1.5} className={ex.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-base font-medium text-foreground">{ex.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ex.description}</p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* Setup */}
      {screen === 'setup' && exercise && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="soul-glass rounded-2xl p-5 text-center space-y-2">
            <h2 className="font-heading text-xl text-foreground">{exercise.name}</h2>
            <p className="text-xs text-muted-foreground">{exercise.description}</p>
            <div className="flex justify-center gap-3 pt-2">
              {exercise.phases.map((p, i) => (
                <div key={i} className="text-center">
                  <p className="text-lg font-heading text-foreground">{p.seconds}s</p>
                  <p className="text-[10px] text-muted-foreground/60">{p.label}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/40 pt-1">{exercise.rounds} rounds · ~{Math.round(totalRoundTime * exercise.rounds / 60)} min</p>
          </div>

          {/* Settings */}
          <div className="soul-glass rounded-2xl p-4 space-y-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Session Options</p>

            <label className="flex items-center justify-between">
              <span className="text-xs text-foreground">Voice guidance</span>
              <button onClick={() => setVoiceGuided(!voiceGuided)}
                className={`w-10 h-5 rounded-full transition-colors duration-200 ${voiceGuided ? 'bg-primary' : 'bg-muted/40'} relative`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform duration-200 ${voiceGuided ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </label>

            <label className="flex items-center justify-between">
              <span className="text-xs text-foreground">Background sound</span>
              <button onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-10 h-5 rounded-full transition-colors duration-200 ${soundEnabled ? 'bg-primary' : 'bg-muted/40'} relative`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform duration-200 ${soundEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </label>

            {soundEnabled && (
              <div className="space-y-2 pl-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-wrap gap-1.5">
                  {SOUND_OPTIONS.map(s => (
                    <button key={s.id} onClick={() => setSelectedSound(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] transition-all duration-200 ${
                        selectedSound === s.id
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'soul-glass text-muted-foreground hover:text-foreground/70'
                      }`}>
                      {s.name}
                    </button>
                  ))}
                </div>
                <input type="range" aria-label="Ambient volume" min={0} max={100} value={volume * 100}
                  onChange={e => setVolumeState(Number(e.target.value) / 100)}
                  className="w-full h-1 accent-primary bg-muted/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
              </div>
            )}
          </div>

          <button onClick={startSession} className="soul-btn-primary w-full">
            Begin {exercise.name}
          </button>
        </motion.div>
      )}

      {/* Active */}
      {screen === 'active' && exercise && currentPhase && (
        <div className="mx-auto flex min-h-[78vh] max-w-lg flex-col items-center justify-center space-y-8">
          <div className="w-full space-y-2 text-center">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/50">
              Round {round + 1} of {exercise.rounds}
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className="h-full rounded-full bg-primary transition-transform duration-700 origin-left"
                style={{ transform: `scaleX(${(round + phaseProgress / exercise.phases.length + phaseIdx / exercise.phases.length) / exercise.rounds})` }}
              />
            </div>
          </div>

          {/* Breathing orb */}
          <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
            <div className="absolute inset-0 rounded-full border border-primary/10" />
            <motion.div
              animate={{ scale: orbScale }}
              transition={{ duration: currentPhase.seconds * 0.9, ease: 'easeInOut' }}
              className="w-36 h-36 rounded-full"
              style={{
                background: 'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.72), hsl(var(--primary) / 0.32) 52%, hsl(var(--background)) 95%)',
                boxShadow: '0 0 80px hsl(var(--primary) / 0.28)',
              }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${phaseIdx}-${round}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center space-y-1"
            >
              <p className="font-heading text-3xl text-foreground">{currentPhase.label}</p>
              <p className="text-3xl font-heading text-primary">{phaseTimer}</p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/45">Stay with the shape</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-6">
            <button onClick={stopSession} className="text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw size={20} />
            </button>
            <button onClick={togglePause}
              className="w-14 h-14 rounded-full soul-glass-elevated flex items-center justify-center text-primary hover:scale-105 active:scale-95 transition-transform duration-200">
              {paused ? <Play size={20} /> : <Pause size={20} />}
            </button>
          </div>
        </div>
      )}

      {/* Complete */}
      {screen === 'complete' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles size={32} className="text-primary" />
          </div>
          <h2 className="font-heading text-xl text-foreground">Session Complete</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Take a moment to notice how your body feels. The calm you've created stays with you.
          </p>
          <div className="flex gap-3">
            <button onClick={() => { setScreen('setup'); }} className="soul-glass rounded-xl px-5 py-2.5 text-xs text-foreground">
              Repeat
            </button>
            <button onClick={() => setScreen('menu')} className="soul-btn-primary px-5 py-2.5 text-xs">
              Back to exercises
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
