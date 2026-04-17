import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DomainConfig } from '@/lib/domains';

const DURATIONS = [
  { label: '3 min', seconds: 180 },
  { label: '7 min', seconds: 420 },
  { label: '15 min', seconds: 900 },
  { label: '30 min', seconds: 1800 },
];
const SPEEDS = [
  { label: 'Slow', ms: 6000 },
  { label: 'Medium', ms: 4000 },
  { label: 'Fast', ms: 2500 },
];

export default function DomainAffirmations({ domain }: { domain: DomainConfig }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phase, setPhase] = useState<'setup' | 'active' | 'done'>('setup');
  const [duration, setDuration] = useState(DURATIONS[1]);
  const [speed, setSpeed] = useState(SPEEDS[1]);
  const [voice, setVoice] = useState(true);
  const [list, setList] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const tickRef = useRef<number | null>(null);
  const cycleRef = useRef<number | null>(null);

  const shuffle = useCallback(() => [...domain.affirmations].sort(() => Math.random() - 0.5), [domain.affirmations]);

  const start = () => {
    setList(shuffle());
    setIdx(0); setCount(0); setTimeLeft(duration.seconds); setPaused(false);
    setPhase('active');
  };

  useEffect(() => {
    if (phase !== 'active' || paused) return;
    tickRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          window.clearInterval(tickRef.current!);
          window.clearInterval(cycleRef.current!);
          window.speechSynthesis?.cancel();
          if (user) {
            supabase.from('affirmation_sessions').insert({
              user_id: user.id, count, source: `${domain.key}-saturation`,
              affirmation_text: `${domain.label} session`,
            });
          }
          setPhase('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (tickRef.current) window.clearInterval(tickRef.current); };
  }, [phase, paused, count, user, domain]);

  useEffect(() => {
    if (phase !== 'active' || paused) return;
    const cycle = () => {
      setIdx(i => {
        const next = (i + 1) % list.length;
        setCount(c => c + 1);
        if (voice) {
          const utter = new SpeechSynthesisUtterance(list[next]);
          utter.rate = 0.9; utter.pitch = 1; utter.volume = 0.85;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utter);
        }
        return next;
      });
    };
    cycleRef.current = window.setInterval(cycle, speed.ms);
    return () => { if (cycleRef.current) window.clearInterval(cycleRef.current); };
  }, [phase, paused, speed, list, voice]);

  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="relative min-h-[100dvh]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: `radial-gradient(circle, ${domain.glow}, transparent 70%)` }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 safe-top">
        <button onClick={() => { window.speechSynthesis?.cancel(); navigate(domain.route); }} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft size={18} strokeWidth={1.5} /><span className="text-sm">{domain.label}</span>
        </button>

        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="text-center space-y-2">
                <h1 className="font-heading text-2xl text-foreground">Affirmations Saturation</h1>
                <p className="text-sm text-muted-foreground">Let {domain.label.toLowerCase()} affirmations soak in.</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Duration</p>
                <div className="grid grid-cols-2 gap-2">
                  {DURATIONS.map(d => (
                    <button key={d.label} onClick={() => setDuration(d)}
                      className={`soul-card py-3 rounded-xl text-sm ${duration.label === d.label ? 'ring-2 ring-primary' : ''}`}>{d.label}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Pace</p>
                <div className="grid grid-cols-3 gap-2">
                  {SPEEDS.map(s => (
                    <button key={s.label} onClick={() => setSpeed(s)}
                      className={`soul-card py-3 rounded-xl text-sm ${speed.label === s.label ? 'ring-2 ring-primary' : ''}`}>{s.label}</button>
                  ))}
                </div>
              </div>

              <button onClick={() => setVoice(v => !v)} className="soul-card w-full flex items-center justify-between p-4 rounded-xl">
                <span className="text-sm text-foreground">Voice readout</span>
                {voice ? <Volume2 size={18} className={domain.accentClass} /> : <VolumeX size={18} className="text-muted-foreground" />}
              </button>

              <button onClick={start} className="w-full soul-glass-elevated py-4 rounded-2xl font-medium text-foreground">Begin</button>
            </motion.div>
          )}

          {phase === 'active' && (
            <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 pt-8 text-center">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatTime(timeLeft)}</span>
                <span>{count} absorbed</span>
              </div>
              <div className="min-h-[200px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="font-heading text-2xl sm:text-3xl text-foreground leading-relaxed px-4">
                    {list[idx]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => { setPhase('setup'); window.speechSynthesis?.cancel(); }} className="soul-card p-4 rounded-full"><RotateCcw size={20} className="text-muted-foreground" /></button>
                <button onClick={() => setPaused(p => !p)} className="soul-glass-elevated p-5 rounded-full">
                  {paused ? <Play size={24} className={domain.accentClass} /> : <Pause size={24} className={domain.accentClass} />}
                </button>
                <button onClick={() => setVoice(v => !v)} className="soul-card p-4 rounded-full">
                  {voice ? <Volume2 size={20} className={domain.accentClass} /> : <VolumeX size={20} className="text-muted-foreground" />}
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 pt-12">
              <div className="text-5xl">{domain.emoji}</div>
              <h2 className="font-heading text-2xl text-foreground">{count} affirmations absorbed</h2>
              <p className="text-sm text-muted-foreground">Let them keep working in you.</p>
              <div className="flex flex-col gap-2 pt-4">
                <button onClick={() => setPhase('setup')} className="soul-glass-elevated py-3 rounded-2xl text-foreground">Another session</button>
                <button onClick={() => navigate(domain.route)} className="soul-card py-3 rounded-2xl text-muted-foreground">Done for now</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
