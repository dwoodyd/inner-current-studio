import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { useAppState } from '@/lib/AppContext';

const DURATION_OPTIONS = [
  { label: '17s', seconds: 17 },
  { label: '30s', seconds: 30 },
  { label: '60s', seconds: 60 },
  { label: '68s', seconds: 68 },
  { label: '90s', seconds: 90 },
];

const COMPLETION_MESSAGES = [
  "Stay here.",
  "Let that settle.",
  "Momentum is building.",
  "You're holding the state.",
  "That was real.",
];

const PHRASES = [
  "I am steady in this moment.",
  "Relief is my natural state.",
  "I let clarity find me.",
  "I am open to what comes.",
  "Momentum carries me forward.",
  "I trust my own current.",
];

export default function MomentumRing() {
  const navigate = useNavigate();
  const { saveMomentumSession } = useAppState();
  const [duration, setDuration] = useState(17);
  const [phrase, setPhrase] = useState(PHRASES[0]);
  const [customPhrase, setCustomPhrase] = useState('');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activePhrase = customPhrase.trim() || phrase;
  const progress = elapsed / duration;

  useEffect(() => {
    if (running && elapsed < duration) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev + 1 >= duration) {
            setRunning(false);
            setCompleted(true);
            saveMomentumSession({ phrase: activePhrase, duration, completed: true });
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, elapsed, duration]);

  const reset = () => { setRunning(false); setElapsed(0); setCompleted(false); };

  const ringRadius = 100;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circumference * (1 - progress);

  if (completed) {
    const msg = COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];
    return (
      <div className="mx-auto max-w-lg px-4 pt-20 pb-6 text-center space-y-8 soul-ambient-gold overflow-hidden">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <div className="soul-completion-ring w-24 h-24">
            <span className="text-2xl">✦</span>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-3">
          <p className="font-heading text-xl text-foreground">{msg}</p>
          <p className="text-xs text-muted-foreground">You held "{activePhrase}" for {duration} seconds.</p>
        </motion.div>
        <div className="space-y-3">
          <button onClick={reset} className="soul-btn-primary w-full">Go Again</button>
          <button onClick={() => navigate('/align')} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-3">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-6 soul-ambient-gold overflow-hidden">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/align')} className="text-muted-foreground p-2 -ml-2 hover:text-foreground transition-colors"><ArrowLeft size={20} /></button>
        <h1 className="font-heading text-lg font-semibold text-foreground">Momentum Ring</h1>
      </div>

      {/* Ring */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full" style={{
              background: `radial-gradient(circle, hsl(42 65% 58% / ${0.04 + progress * 0.08}), transparent 70%)`,
              transition: 'background 1s',
            }} />
          </div>
          <svg width="240" height="240" viewBox="0 0 240 240" className="relative z-10">
            <circle cx="120" cy="120" r={ringRadius} fill="none" stroke="hsl(220 15% 15% / 0.6)" strokeWidth="3" />
            <motion.circle
              cx="120" cy="120" r={ringRadius}
              fill="none"
              stroke="hsl(42 65% 58%)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 120 120)"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-20">
            <p className="font-heading text-sm text-foreground leading-snug">{activePhrase}</p>
            <p className="text-lg font-heading text-primary mt-2">{duration - elapsed}s</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      {!running && elapsed === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Duration */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Duration</p>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.seconds}
                  onClick={() => setDuration(opt.seconds)}
                  className={`flex-1 soul-chip text-xs py-2 ${
                    duration === opt.seconds ? 'soul-chip-active' : 'soul-chip-idle'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Phrase */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Phrase</p>
            <div className="space-y-1.5">
              {PHRASES.map(p => (
                <button
                  key={p}
                  onClick={() => { setPhrase(p); setCustomPhrase(''); }}
                  className={`w-full text-left text-xs px-4 py-2.5 rounded-xl transition-all ${
                    phrase === p && !customPhrase
                      ? 'soul-glass-elevated text-primary border border-primary/10'
                      : 'soul-glass text-muted-foreground hover:text-foreground/70'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <input
              value={customPhrase}
              onChange={e => setCustomPhrase(e.target.value)}
              placeholder="Or write your own…"
              className="w-full soul-glass rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none placeholder:text-muted-foreground/40"
            />
          </div>
        </motion.div>
      )}

      <div className="flex gap-3">
        {running ? (
          <button onClick={() => setRunning(false)} className="soul-btn-primary flex-1 flex items-center justify-center gap-2">
            <Pause size={16} /> Pause
          </button>
        ) : elapsed > 0 ? (
          <>
            <button onClick={() => setRunning(true)} className="soul-btn-primary flex-1 flex items-center justify-center gap-2">
              <Play size={16} /> Resume
            </button>
            <button onClick={reset} className="px-4 py-3 text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw size={16} />
            </button>
          </>
        ) : (
          <button onClick={() => setRunning(true)} className="soul-btn-primary w-full flex items-center justify-center gap-2">
            <Play size={16} /> Begin
          </button>
        )}
      </div>
    </div>
  );
}
