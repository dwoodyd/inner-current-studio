import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, RotateCcw, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const GOAL = 10000;
const CELLS_PER_ROW = 10;
const ROWS = 10;
const PER_CELL = GOAL / (CELLS_PER_ROW * ROWS); // 100 per cell

const MILESTONES = [
  { at: 1000, note: 'keep going.' },
  { at: 2000, note: '' },
  { at: 3000, note: '' },
  { at: 4000, note: '' },
  { at: 5000, note: "you're halfway." },
  { at: 6000, note: '' },
  { at: 7000, note: '' },
  { at: 8000, note: '' },
  { at: 9000, note: '' },
  { at: 10000, note: "it's done. it's yours." },
];

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const unique = [...new Set(dates)].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (unique[0] !== today && unique[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    const curr = new Date(unique[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (Math.round(diff) === 1) streak++;
    else break;
  }
  return streak;
}

export default function AffirmationTracker() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [manualCount, setManualCount] = useState(0);
  const [affirming, setAffirming] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTotal = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('affirmation_sessions')
      .select('count, created_at')
      .eq('user_id', user.id);
    if (data) {
      const sum = data.reduce((acc, r) => acc + (r.count || 0), 0);
      setTotal(sum);
      const dates = data.map(r => r.created_at.slice(0, 10));
      setStreak(computeStreak(dates));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTotal(); }, [fetchTotal]);

  const saveManualSession = async () => {
    if (!user || manualCount === 0) return;
    await supabase.from('affirmation_sessions').insert({
      user_id: user.id,
      source: 'manual',
      count: manualCount,
      affirmation_text: affirming || null,
    });
    setTotal(prev => prev + manualCount);
    setManualCount(0);
    // Refresh streak
    fetchTotal();
  };

  const filledCells = Math.min(Math.floor(total / PER_CELL), CELLS_PER_ROW * ROWS);
  const progress = Math.min(total / GOAL, 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-soul-gold/30 border-t-soul-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-6 safe-top">
      <button onClick={() => navigate('/money')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={18} strokeWidth={1.5} /><span className="text-sm">Money Current</span>
      </button>

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground">the <span className="text-soul-gold italic">10,000</span> affirmation challenge</h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">saturate your mind · the belief follows.</p>
      </div>

      {/* Daily Streak */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="soul-glass rounded-2xl p-4 flex items-center justify-center gap-4"
      >
        <div className="relative">
          <motion.div
            animate={streak > 0 ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              streak > 0
                ? 'bg-gradient-to-br from-orange-500/20 to-soul-gold/20'
                : 'bg-muted/10'
            }`}
          >
            <Flame size={24} className={streak > 0 ? 'text-orange-400' : 'text-muted-foreground/40'} />
          </motion.div>
        </div>
        <div className="text-left">
          <p className="text-2xl font-heading font-bold text-foreground">
            {streak} <span className="text-sm font-normal text-muted-foreground">{streak === 1 ? 'day' : 'days'}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {streak === 0
              ? 'affirm today to start your streak'
              : streak < 7
                ? 'keep the fire alive'
                : streak < 30
                  ? 'you\'re building momentum ✦'
                  : 'unstoppable. you are the energy. 🔥'}
          </p>
        </div>
      </motion.div>

      {/* I am affirming */}
      <div className="space-y-1">
        <label className="text-sm italic text-muted-foreground">i am affirming:</label>
        <input
          value={affirming}
          onChange={e => setAffirming(e.target.value)}
          placeholder="e.g. I am a money magnet"
          className="w-full bg-transparent border-b border-border/40 pb-2 text-foreground text-sm focus:outline-none focus:border-soul-gold/50 transition-colors"
        />
      </div>

      {/* Grid */}
      <div className="space-y-2">
        {Array.from({ length: ROWS }).map((_, row) => {
          const milestone = MILESTONES[row];
          return (
            <div key={row} className="flex items-center gap-2">
              <div className="flex gap-1.5 flex-1">
                {Array.from({ length: CELLS_PER_ROW }).map((_, col) => {
                  const cellIndex = row * CELLS_PER_ROW + col;
                  const isFilled = cellIndex < filledCells;
                  return (
                    <motion.div
                      key={col}
                      className={`w-full aspect-square rounded-md border transition-all duration-300 ${
                        isFilled
                          ? 'bg-soul-gold/25 border-soul-gold/40'
                          : 'border-border/30 bg-muted/5'
                      }`}
                      initial={false}
                      animate={isFilled ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    />
                  );
                })}
              </div>
              <div className="flex items-center gap-2 min-w-[120px]">
                <span className="text-xs text-soul-gold font-medium">{milestone.at.toLocaleString()}</span>
                <span className="text-soul-gold">✦</span>
                {milestone.note && <span className="text-xs text-muted-foreground italic">{milestone.note}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="soul-glass rounded-2xl p-4 text-center space-y-2">
        <p className="text-3xl font-heading font-bold text-soul-gold">{total.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">total affirmations</p>
        <div className="w-full h-2 bg-muted/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, hsl(42 65% 58%), hsl(42 65% 68%))' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{Math.round(progress * 100)}% complete</p>
      </div>

      {/* Manual counter */}
      <div className="soul-glass-elevated rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-medium text-foreground text-center">Robotic Affirming Counter</h3>
        <p className="text-xs text-muted-foreground text-center">Tap to count each spoken affirmation</p>
        <div className="flex items-center justify-center gap-6">
          <button onClick={() => { navigator.vibrate?.(10); setManualCount(c => Math.max(0, c - 1)); }}
            className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors active:scale-90 transition-transform">
            <Minus size={20} />
          </button>
          <motion.p key={manualCount} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            className="text-4xl font-heading font-bold text-foreground tabular-nums min-w-[80px] text-center">
            {manualCount}
          </motion.p>
          <button onClick={() => { navigator.vibrate?.(20); setManualCount(c => c + 1); }}
            className="w-12 h-12 rounded-full bg-soul-gold/20 flex items-center justify-center text-soul-gold hover:bg-soul-gold/30 active:scale-90 transition-all">
            <Plus size={20} />
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setManualCount(0)}
            className="flex-1 py-3 rounded-xl border border-border/30 text-muted-foreground text-sm hover:text-foreground transition-colors flex items-center justify-center gap-2">
            <RotateCcw size={14} /> Reset
          </button>
          <button onClick={saveManualSession}
            disabled={manualCount === 0}
            className="flex-1 py-3 rounded-xl bg-soul-gold/20 text-soul-gold text-sm font-medium hover:bg-soul-gold/30 transition-colors disabled:opacity-40">
            Save {manualCount > 0 ? `+${manualCount}` : ''}
          </button>
        </div>
      </div>

      {/* Completed */}
      <AnimatePresence>
        {total >= GOAL && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 py-4">
            <p className="text-sm italic text-muted-foreground">completed:</p>
            <p className="text-lg font-heading text-soul-gold">affirm and persist. ✦</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
