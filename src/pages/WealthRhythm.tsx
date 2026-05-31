import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Star, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const LEVELS = [
  { name: 'Opening', min: 0, color: 'text-zinc-400' },
  { name: 'Softening', min: 5, color: 'text-blue-400' },
  { name: 'Receiving', min: 15, color: 'text-emerald-400' },
  { name: 'Circulating', min: 30, color: 'text-soul-gold' },
  { name: 'Overflow', min: 50, color: 'text-amber-400' },
  { name: 'Magnetic', min: 80, color: 'text-purple-400' },
  { name: 'Wealth Current', min: 120, color: 'text-rose-400' },
];

const MILESTONES = [
  { count: 1, label: 'First Money Check-In' },
  { count: 5, label: 'Consistent Returner' },
  { count: 10, label: 'Resistance Releaser' },
  { count: 25, label: 'Abundance Builder' },
  { count: 50, label: 'Current Master' },
  { count: 100, label: 'Wealth Alchemist' },
];

export default function WealthRhythm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalActions: 0, streak: 0, thisWeek: 0 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const tables = ['money_states', 'current_deposits', 'money_openings', 'overflow_spending', 'evidence_of_support', 'money_resistance', 'payment_shifts'] as const;
      let total = 0;
      let thisWeek = 0;
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);

      for (const t of tables) {
        const { count } = await supabase.from(t).select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        total += count || 0;
        const { count: wc } = await supabase.from(t).select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', weekAgo.toISOString());
        thisWeek += wc || 0;
      }

      // Simple streak: count consecutive days with at least one money_states entry
      const { data: states } = await supabase.from('money_states').select('created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(60);
      let streak = 0;
      if (states && states.length > 0) {
        const days = new Set(states.map(s => s.created_at.split('T')[0]));
        const today = new Date();
        for (let i = 0; i < 60; i++) {
          const d = new Date(today); d.setDate(d.getDate() - i);
          const key = d.toISOString().split('T')[0];
          if (days.has(key)) streak++;
          else break;
        }
      }

      setStats({ totalActions: total, streak, thisWeek });
    };
    load();
  }, [user]);

  const currentLevel = [...LEVELS].reverse().find(l => stats.totalActions >= l.min) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.min > stats.totalActions);
  const progress = nextLevel ? ((stats.totalActions - (currentLevel?.min || 0)) / (nextLevel.min - (currentLevel?.min || 0))) * 100 : 100;

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(42 65% 58% / 0.08), hsl(280 40% 50% / 0.04), transparent 70%)' }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-6 safe-top">
        <button onClick={() => navigate('/money/hub')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} strokeWidth={1.5} /><span className="text-sm">Money Current</span>
        </button>

        <div className="text-center space-y-3">
          <motion.div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-soul-gold/10"
            animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 6, repeat: Infinity }}>
            <Trophy size={28} className="text-soul-gold" />
          </motion.div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Wealth Rhythm</h1>
          <p className="text-sm text-muted-foreground">Track your money practice momentum.</p>
        </div>

        {/* Current Level */}
        <div className="soul-glass-elevated rounded-2xl p-6 text-center space-y-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Level</p>
          <h2 className={`font-heading text-3xl font-bold ${currentLevel.color}`}>{currentLevel.name}</h2>
          {nextLevel && (
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                <motion.div className="h-full bg-soul-gold rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }} />
              </div>
              <p className="text-xs text-muted-foreground">{stats.totalActions} / {nextLevel.min} to <span className={nextLevel.color}>{nextLevel.name}</span></p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: TrendingUp, label: 'Total Actions', value: stats.totalActions },
            { icon: Calendar, label: 'Day Streak', value: stats.streak },
            { icon: Star, label: 'This Week', value: stats.thisWeek },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="soul-glass rounded-2xl p-4 text-center space-y-2">
              <Icon size={18} className="text-soul-gold mx-auto" />
              <p className="text-xl font-heading font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          <h3 className="font-heading text-lg font-medium text-foreground">Milestones</h3>
          {MILESTONES.map(m => {
            const unlocked = stats.totalActions >= m.count;
            return (
              <div key={m.count} className={`soul-glass flex items-center gap-3 p-4 rounded-2xl transition-opacity ${unlocked ? '' : 'opacity-40'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${unlocked ? 'bg-soul-gold/20' : 'bg-muted/20'}`}>
                  {unlocked ? <Star size={16} className="text-soul-gold" /> : <span className="text-xs text-muted-foreground">{m.count}</span>}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.count} actions</p>
                </div>
                {unlocked && <Check size={16} className="ml-auto text-emerald-400" />}
              </div>
            );
          })}
        </div>

        {/* Levels Guide */}
        <div className="soul-glass rounded-2xl p-4 space-y-2">
          <h3 className="text-sm font-medium text-foreground">All Levels</h3>
          {LEVELS.map(l => (
            <div key={l.name} className="flex items-center gap-3 text-sm">
              <span className={`${l.color} font-medium w-28`}>{l.name}</span>
              <span className="text-muted-foreground">{l.min}+ actions</span>
              {currentLevel.name === l.name && <span className="text-xs bg-soul-gold/20 text-soul-gold px-2 py-0.5 rounded-full ml-auto">You</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Check({ size, className }: { size: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
