import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <div className="mx-auto max-w-lg px-4 pt-20 pb-6 text-center space-y-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-24 h-24 mx-auto rounded-full soul-gradient-gold soul-glow-gold flex items-center justify-center"
        >
          <span className="text-2xl">✦</span>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-3">
          <p className="font-heading text-xl text-foreground">{msg}</p>
          <p className="text-xs text-muted-foreground">You held "{activePhrase}" for {duration} seconds.</p>
        </motion.div>
        <div className="space-y-2">
          <Button onClick={reset} variant="outline" className="w-full">Go Again</Button>
          <Button onClick={() => navigate('/align')} variant="ghost" className="w-full text-muted-foreground">Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/align')} className="text-muted-foreground p-2 -ml-2"><ArrowLeft size={20} /></button>
        <h1 className="font-heading text-lg font-semibold text-foreground">Momentum Ring</h1>
      </div>

      {/* Ring */}
      <div className="flex justify-center">
        <div className="relative">
          <svg width="240" height="240" viewBox="0 0 240 240">
            <circle cx="120" cy="120" r={ringRadius} fill="none" stroke="hsl(220 15% 15%)" strokeWidth="4" />
            <motion.circle
              cx="120" cy="120" r={ringRadius}
              fill="none"
              stroke="hsl(42 65% 58%)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 120 120)"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
            <p className="font-heading text-sm text-foreground leading-snug">{activePhrase}</p>
            <p className="text-lg font-heading text-primary mt-2">{duration - elapsed}s</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      {!running && elapsed === 0 && (
        <div className="space-y-4">
          {/* Duration */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Duration</p>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.seconds}
                  onClick={() => setDuration(opt.seconds)}
                  className={`flex-1 text-xs py-2 rounded-lg transition-all ${
                    duration === opt.seconds ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Phrase */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Phrase</p>
            <div className="space-y-1.5">
              {PHRASES.map(p => (
                <button
                  key={p}
                  onClick={() => { setPhrase(p); setCustomPhrase(''); }}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all ${
                    phrase === p && !customPhrase ? 'bg-primary/15 text-primary' : 'bg-muted/20 text-muted-foreground'
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
              className="w-full bg-muted/20 rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none placeholder:text-muted-foreground/40"
            />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {running ? (
          <Button onClick={() => setRunning(false)} variant="outline" className="flex-1"><Pause size={16} /> Pause</Button>
        ) : elapsed > 0 ? (
          <>
            <Button onClick={() => setRunning(true)} className="flex-1"><Play size={16} /> Resume</Button>
            <Button onClick={reset} variant="ghost"><RotateCcw size={16} /></Button>
          </>
        ) : (
          <Button onClick={() => setRunning(true)} className="w-full"><Play size={16} /> Begin</Button>
        )}
      </div>
    </div>
  );
}
