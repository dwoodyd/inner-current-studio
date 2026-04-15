import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, Timer, Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const AFFIRMATIONS = [
  // Original present-tense affirmations
  "I am wealthy and abundant right now.",
  "Money flows to me easily and effortlessly.",
  "I am grateful for the abundance I already have.",
  "Thank you that the contract is signed.",
  "Thank you that I manifested this money so swiftly and easily.",
  "I am a powerful money magnet.",
  "My bank account is growing every single day.",
  "I receive large sums of money regularly.",
  "I am financially free and independent.",
  "Money comes to me from expected and unexpected sources.",
  "I am worthy of all the wealth I desire.",
  "My income exceeds my expenses generously.",
  "I attract lucrative opportunities effortlessly.",
  "I am open and receptive to all the wealth life offers me.",
  "Thank you that my business is thriving beyond expectation.",
  "I have more than enough money for everything I need and want.",
  "Abundance is my birthright and I claim it fully.",
  "I am comfortable and confident with large amounts of money.",
  "Thank you that this deal closed perfectly and easily.",
  "My wealth is constantly increasing.",
  "I manage my money wisely and it multiplies.",
  "I am surrounded by abundance in every area of my life.",
  "Thank you that this payment arrived ahead of schedule.",
  "Money loves me and I love money.",
  "I am aligned with the energy of wealth and success.",
  "Every dollar I spend comes back to me multiplied.",
  "Thank you that I am debt-free and financially secure.",
  "I radiate prosperity and attract it in return.",
  "My net worth reflects my true value.",
  "Thank you that my savings are substantial and growing.",
  "I release all resistance to attracting money right now.",
  "Wealth and abundance are my natural states.",
  "Thank you that I received this windfall so gracefully.",
  "I am at peace with money and it is at peace with me.",
  "My relationship with money is healthy and harmonious.",
  "Thank you that all my financial goals are already met.",
  "I give generously and receive abundantly.",
  "I am living my most abundant life right now.",
  "Money is a tool I use to create a beautiful life.",
  "Thank you that opportunities are pouring in from every direction.",
  // Spoiled affirmations
  "I always get what I want instantly.",
  "Everything always goes my way.",
  "I manifest instantly and effortlessly.",
  "Everything always works out in my favor.",
  "Everyone loves to spoil me with gifts.",
  "I get money when I sleep.",
  "I get things for free just because.",
  "Money is obsessed with me.",
  "I'm a millionaire.",
  "I don't lose money.",
  "Everything I spend comes back to me multiplied.",
  "I receive money simply for existing.",
  "I find money out of nowhere.",
  "People give me money for no reason.",
  "I have unlimited access to money.",
  "I attract $10K easily and effortlessly every day.",
  "I magnetize wealth, it comes to me in perfect timing, from expected and unexpected places.",
  "I deserve abundance, I release scarcity thinking, there's always more than enough for me.",
  "I spend, save, and multiply my money with ease and joy.",
  "I see opportunities everywhere and I take inspired action without fear.",
  "I am a money magnet, wealth follows me wherever I go.",
  "I earn with effortlessness! Money flows to me like water, constant and unstoppable.",
  "I reject struggle! Making money is fun, easy, and exciting. I value myself.",
  "I already have everything I need to manifest wealth.",
  "I thank the Youniverse for my expanding bank accounts, for new streams of income, and for every dollar that comes to me.",
  "I see abundance in every interaction, every decision, every opportunity.",
  "I stopped asking if I can have it, I know it is mine.",
  "I am someone who already has $10K, $50K, $100K, $1M and more.",
];

const DURATIONS = [
  { label: '2 min', seconds: 120 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '20 min', seconds: 1200 },
];

const SPEEDS = [
  { label: 'Relaxed', ms: 6000 },
  { label: 'Steady', ms: 4000 },
  { label: 'Focused', ms: 3000 },
  { label: 'Rapid', ms: 2000 },
];

export default function MoneyAffirmations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phase, setPhase] = useState<'setup' | 'active' | 'done'>('setup');
  const [duration, setDuration] = useState(DURATIONS[1]);
  const [speed, setSpeed] = useState(SPEEDS[1]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [count, setCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const affirmRef = useRef<ReturnType<typeof setInterval>>();
  const shuffledRef = useRef<string[]>([]);

  const shuffle = useCallback(() => {
    const arr = [...AFFIRMATIONS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    shuffledRef.current = arr;
  }, []);

  const start = useCallback(() => {
    shuffle();
    setTimeLeft(duration.seconds);
    setCount(0);
    setCurrentIndex(0);
    setPaused(false);
    setPhase('active');
  }, [duration, shuffle]);

  // countdown
  useEffect(() => {
    if (phase !== 'active' || paused) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          clearInterval(affirmRef.current);
          setPhase('done');
          // Log session to tracker
          if (user) {
            supabase.from('affirmation_sessions').insert({
              user_id: user.id,
              source: 'auto',
              count: count + 1,
            }).then(() => {});
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, paused, user, count]);

  // affirmation cycling
  useEffect(() => {
    if (phase !== 'active' || paused) return;
    affirmRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % shuffledRef.current.length;
        return next;
      });
      setCount(prev => prev + 1);
    }, speed.ms);
    return () => clearInterval(affirmRef.current);
  }, [phase, paused, speed.ms]);

  const togglePause = () => setPaused(p => !p);
  const reset = () => { clearInterval(timerRef.current); clearInterval(affirmRef.current); setPhase('setup'); };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  useEffect(() => () => { clearInterval(timerRef.current); clearInterval(affirmRef.current); }, []);

  // SETUP
  if (phase === 'setup') {
    return (
      <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-6 safe-top">
        <button onClick={() => navigate('/money')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} strokeWidth={1.5} /><span className="text-sm">Money Current</span>
        </button>

        <div className="text-center space-y-3">
          <motion.div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(42 65% 58% / 0.15), hsl(160 30% 40% / 0.1))' }}
            animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 5, repeat: Infinity }}>
            <span className="text-2xl">✨</span>
          </motion.div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Auto Affirmations</h1>
          <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">Set a timer, absorb powerful money affirmations, and track your count.</p>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2"><Timer size={14} className="text-soul-gold" /> Duration</label>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map(d => (
              <button key={d.seconds} onClick={() => setDuration(d)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${duration.seconds === d.seconds ? 'bg-soul-gold/20 text-soul-gold ring-1 ring-soul-gold/30' : 'soul-glass text-muted-foreground hover:text-foreground'}`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Speed */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2"><Hash size={14} className="text-soul-gold" /> Pace</label>
          <div className="flex flex-wrap gap-2">
            {SPEEDS.map(s => (
              <button key={s.ms} onClick={() => setSpeed(s)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${speed.ms === s.ms ? 'bg-soul-gold/20 text-soul-gold ring-1 ring-soul-gold/30' : 'soul-glass text-muted-foreground hover:text-foreground'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={start} className="w-full py-4 rounded-2xl font-medium text-lg bg-soul-gold/20 text-soul-gold hover:bg-soul-gold/30 transition-colors">
          <Play size={18} className="inline mr-2" />Begin Session
        </button>

        {/* Preview */}
        <div className="soul-glass rounded-2xl p-4 space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sample Affirmations</h3>
          {AFFIRMATIONS.slice(0, 5).map((a, i) => (
            <p key={i} className="text-sm text-muted-foreground/80 italic">"{a}"</p>
          ))}
          <p className="text-xs text-muted-foreground">…and {AFFIRMATIONS.length - 5} more</p>
        </div>
      </div>
    );
  }

  // ACTIVE
  if (phase === 'active') {
    return (
      <div className="relative min-h-[100dvh] flex flex-col">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, hsl(42 65% 58% / 0.06), hsl(160 30% 40% / 0.03), transparent 70%)' }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <div className="relative flex-1 flex flex-col items-center justify-center px-6 space-y-10">
          {/* Timer & Counter */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-heading font-bold text-foreground tabular-nums">{formatTime(timeLeft)}</p>
              <p className="text-xs text-muted-foreground mt-1">remaining</p>
            </div>
            <div className="w-px h-10 bg-border/30" />
            <div className="text-center">
              <p className="text-3xl font-heading font-bold text-soul-gold tabular-nums">{count}</p>
              <p className="text-xs text-muted-foreground mt-1">affirmations</p>
            </div>
          </div>

          {/* Affirmation */}
          <AnimatePresence mode="wait">
            <motion.p key={currentIndex}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="text-center text-xl sm:text-2xl font-heading text-foreground leading-relaxed max-w-md px-4">
              {shuffledRef.current[currentIndex] || AFFIRMATIONS[0]}
            </motion.p>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center gap-6">
            <button onClick={reset} className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw size={18} />
            </button>
            <button onClick={togglePause}
              className="w-16 h-16 rounded-full bg-soul-gold/20 flex items-center justify-center text-soul-gold hover:bg-soul-gold/30 transition-colors">
              {paused ? <Play size={24} /> : <Pause size={24} />}
            </button>
          </div>

          {paused && <p className="text-sm text-soul-gold animate-pulse">Paused</p>}
        </div>
      </div>
    );
  }

  // DONE
  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 space-y-8">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 180, delay: 0.2 }}>
        <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, hsl(42 65% 58% / 0.2), hsl(160 30% 40% / 0.1))' }}>
          <span className="text-4xl">🏆</span>
        </div>
      </motion.div>
      <h2 className="font-heading text-2xl font-semibold text-foreground">Session Complete</h2>
      <div className="soul-glass-elevated rounded-2xl p-6 space-y-4 text-center min-w-[240px]">
        <div>
          <p className="text-4xl font-heading font-bold text-soul-gold">{count}</p>
          <p className="text-sm text-muted-foreground mt-1">affirmations absorbed</p>
        </div>
        <div className="w-full h-px bg-border/20" />
        <div>
          <p className="text-lg font-heading text-foreground">{duration.label}</p>
          <p className="text-xs text-muted-foreground">session duration</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground italic max-w-xs text-center">
        Every affirmation is a seed planted in fertile ground. You are already abundant.
      </p>
      <div className="flex gap-3 w-full max-w-sm">
        <button onClick={start} className="flex-1 py-3 rounded-2xl border border-border/30 text-muted-foreground hover:text-foreground transition-colors">
          Go Again
        </button>
        <button onClick={() => navigate('/money')} className="flex-1 py-3 rounded-2xl bg-soul-gold/20 text-soul-gold font-medium hover:bg-soul-gold/30 transition-colors">
          Done
        </button>
      </div>
    </div>
  );
}
