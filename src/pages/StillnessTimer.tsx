import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/lib/AppContext';
import { ArrowLeft } from 'lucide-react';

const durations = [
  { label: '1 min', seconds: 60 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
];

const breathPatterns = [
  { label: '4-4-4', inhale: 4, hold: 4, exhale: 4 },
  { label: '4-7-8', inhale: 4, hold: 7, exhale: 8 },
  { label: '5-5', inhale: 5, hold: 0, exhale: 5 },
];

type Phase = 'inhale' | 'hold' | 'exhale';

export default function StillnessTimer() {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedPattern, setSelectedPattern] = useState(breathPatterns[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [phaseTime, setPhaseTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { updateTodayFlow } = useAppState();
  const navigate = useNavigate();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const startTimer = (seconds: number) => {
    setSelectedDuration(seconds);
    setTimeLeft(seconds);
    setIsRunning(true);
    setPhase('inhale');
    setPhaseTime(0);
    setIsComplete(false);
  };

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsRunning(false);
          setIsComplete(true);
          updateTodayFlow({ resetUsed: true });
          return 0;
        }
        return t - 1;
      });

      setPhaseTime(pt => {
        const p = selectedPattern;
        const total = p.inhale + p.hold + p.exhale;
        const next = (pt + 1) % total;
        if (next < p.inhale) setPhase('inhale');
        else if (next < p.inhale + p.hold) setPhase('hold');
        else setPhase('exhale');
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, selectedPattern]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const orbScale = phase === 'inhale' ? 1.2 : phase === 'hold' ? 1.2 : 0.9;
  const phaseLabel = phase === 'inhale' ? 'Breathe in' : phase === 'hold' ? 'Hold' : 'Release';

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => { setIsRunning(false); navigate('/reset'); }} className="text-muted-foreground hover:text-foreground" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">Stillness Timer</h1>
          <p className="text-xs text-muted-foreground">Breathe. Be still. Return.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isRunning && !isComplete && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Duration</p>
              <div className="grid grid-cols-4 gap-2">
                {durations.map(d => (
                  <button
                    key={d.seconds}
                    onClick={() => setSelectedDuration(d.seconds)}
                    className={`rounded-xl py-3 text-sm font-medium transition-all ${
                      selectedDuration === d.seconds
                        ? 'bg-primary/10 border border-primary/30 text-foreground'
                        : 'bg-card border border-border/30 text-muted-foreground'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Breath pattern</p>
              <div className="grid grid-cols-3 gap-2">
                {breathPatterns.map(p => (
                  <button
                    key={p.label}
                    onClick={() => setSelectedPattern(p)}
                    className={`rounded-xl py-3 text-sm font-medium transition-all ${
                      selectedPattern.label === p.label
                        ? 'bg-primary/10 border border-primary/30 text-foreground'
                        : 'bg-card border border-border/30 text-muted-foreground'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => selectedDuration && startTimer(selectedDuration)}
              disabled={!selectedDuration}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground disabled:opacity-30"
            >
              Begin Stillness
            </button>
          </motion.div>
        )}

        {isRunning && (
          <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-8 py-12">
            <div className="relative flex items-center justify-center">
              <motion.div
                className="h-40 w-40 rounded-full bg-primary/10 soul-glow-gold"
                animate={{ scale: orbScale }}
                transition={{ duration: phase === 'hold' ? 0.3 : selectedPattern[phase === 'inhale' ? 'inhale' : 'exhale'], ease: 'easeInOut' }}
              />
              <div className="absolute text-center">
                <p className="font-heading text-lg text-foreground">{phaseLabel}</p>
                <p className="text-2xl font-light text-primary mt-2">{formatTime(timeLeft)}</p>
              </div>
            </div>

            <button
              onClick={() => { setIsRunning(false); setIsComplete(false); setSelectedDuration(null); }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              End early
            </button>
          </motion.div>
        )}

        {isComplete && (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6 py-12 text-center">
            <motion.div
              className="h-20 w-20 rounded-full bg-primary/15 soul-glow-gold"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: 2 }}
            />
            <div className="space-y-2">
              <h2 className="font-heading text-xl font-medium text-foreground">Stillness complete</h2>
              <p className="text-sm text-muted-foreground">Let that settle.</p>
            </div>
            <button onClick={() => navigate('/')} className="text-sm text-primary hover:text-primary/80">
              Return home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
