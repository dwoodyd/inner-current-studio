import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Clock, Target, BarChart3 } from 'lucide-react';
import { useAppState } from '@/lib/AppContext';

export default function CurrentInsights() {
  const navigate = useNavigate();
  const { state } = useAppState();

  const insights = useMemo(() => {
    const totalCheckIns = state.checkIns.length;
    const totalWheels = state.wheels.filter(w => w.completionStatus === 'complete').length;
    const totalMomentum = state.momentumSessions.filter(m => m.completed).length;
    const totalPages = state.futurePages.length;
    const totalReturns = state.todayFlow.returnCount;

    // Most common state
    const stateCounts: Record<string, number> = {};
    state.checkIns.forEach(c => { stateCounts[c.state] = (stateCounts[c.state] || 0) + 1; });
    const topState = Object.entries(stateCounts).sort((a, b) => b[1] - a[1])[0];

    // State distribution for last 7 check-ins
    const recent = state.checkIns.slice(0, 7);
    const stateIndex = (s: string) => {
      const ladder = ['shut-down','raw','tense','discouraged','scattered','doubtful','restless','flat','neutral','open','steady','hopeful','uplifted','clear','energized','flowing'];
      return ladder.indexOf(s);
    };
    const avgState = recent.length > 0
      ? recent.reduce((sum, c) => sum + stateIndex(c.state), 0) / recent.length
      : 0;

    const cards: { icon: typeof TrendingUp; title: string; value: string; detail: string }[] = [
      { icon: TrendingUp, title: 'Returns Today', value: String(totalReturns), detail: 'Each return builds the pattern.' },
      { icon: BarChart3, title: 'Completed Rituals', value: String(totalWheels + totalMomentum), detail: `${totalWheels} wheels · ${totalMomentum} momentum sessions` },
      { icon: Target, title: 'Most Common State', value: topState ? topState[0].replace('-', ' ') : '—', detail: topState ? `${topState[1]} check-ins` : 'Check in to see patterns.' },
      { icon: Clock, title: 'Average Position', value: avgState > 0 ? avgState.toFixed(1) : '—', detail: avgState > 8 ? 'You tend toward openness.' : avgState > 4 ? 'You often start mid-range. That\'s honest.' : 'Low starts mean big shifts are possible.' },
    ];

    const narratives: string[] = [];
    if (totalCheckIns > 3 && topState) narratives.push(`Your most common starting state this week was ${topState[0].replace('-', ' ')}.`);
    if (totalWheels > 0) narratives.push('Alignment Wheels are building your shift capacity.');
    if (totalMomentum > 2) narratives.push('Momentum sessions are extending your hold time.');
    if (totalPages > 0) narratives.push('Your reflective writing is creating new inner ground.');
    if (totalReturns > 3) narratives.push('Returning often is more powerful than staying long.');
    if (narratives.length === 0) narratives.push('Keep checking in. Patterns emerge with consistency.');

    return { cards, narratives };
  }, [state]);

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/profile')} className="text-muted-foreground p-2 -ml-2"><ArrowLeft size={20} /></button>
        <h1 className="font-heading text-lg font-semibold text-foreground">Current Insights</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {insights.cards.map(({ icon: Icon, title, value, detail }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="soul-card space-y-2"
          >
            <Icon size={16} className="text-primary" />
            <p className="text-lg font-heading font-semibold text-foreground capitalize">{value}</p>
            <p className="text-[10px] text-muted-foreground">{title}</p>
            <p className="text-[10px] text-muted-foreground/60">{detail}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Weekly Reflections</p>
        {insights.narratives.map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-muted/15 rounded-xl px-4 py-3"
          >
            <p className="text-xs text-foreground/80 leading-relaxed">{n}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
