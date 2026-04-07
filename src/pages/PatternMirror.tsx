import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppState } from '@/lib/AppContext';
import type { EmotionalState } from '@/lib/types';

const STATE_ORDER: EmotionalState[] = ['tense', 'restless', 'flat', 'open', 'flowing'];
const STATE_LABELS: Record<EmotionalState, string> = {
  tense: 'Contracted',
  restless: 'Restless',
  flat: 'Still',
  open: 'Opening',
  flowing: 'Flowing',
};
const STATE_COLORS: Record<EmotionalState, string> = {
  tense: 'bg-soul-dim',
  restless: 'bg-soul-blue',
  flat: 'bg-muted-foreground/30',
  open: 'bg-soul-violet',
  flowing: 'bg-primary',
};

export default function PatternMirror() {
  const navigate = useNavigate();
  const { state } = useAppState();

  const analysis = useMemo(() => {
    const checkIns = state.checkIns;
    if (checkIns.length === 0) return null;

    // Frequency
    const freq: Record<string, number> = {};
    STATE_ORDER.forEach(s => (freq[s] = 0));
    checkIns.forEach(c => { freq[c.state] = (freq[c.state] || 0) + 1; });
    const maxFreq = Math.max(...Object.values(freq), 1);

    // Weekly pattern (last 7 days)
    const now = Date.now();
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekData = dayLabels.map((label, i) => {
      const dayStart = now - (6 - i) * 86400000;
      const dayEnd = dayStart + 86400000;
      const dayCheckins = checkIns.filter(c => {
        const t = new Date(c.createdAt).getTime();
        return t >= dayStart && t < dayEnd;
      });
      const avgPos = dayCheckins.length > 0
        ? dayCheckins.reduce((s, c) => s + STATE_ORDER.indexOf(c.state), 0) / dayCheckins.length
        : -1;
      return { label, avgPos, count: dayCheckins.length };
    });

    // Trend
    const recent5 = checkIns.slice(0, 5).map(c => STATE_ORDER.indexOf(c.state));
    const older5 = checkIns.slice(5, 10).map(c => STATE_ORDER.indexOf(c.state));
    const recentAvg = recent5.length > 0 ? recent5.reduce((a, b) => a + b, 0) / recent5.length : 2;
    const olderAvg = older5.length > 0 ? older5.reduce((a, b) => a + b, 0) / older5.length : 2;
    const trend = recentAvg > olderAvg + 0.3 ? 'rising' : recentAvg < olderAvg - 0.3 ? 'settling' : 'steady';

    // Most common
    const mostCommon = STATE_ORDER.reduce((a, b) => (freq[a] >= freq[b] ? a : b));

    return { freq, maxFreq, weekData, trend, mostCommon, total: checkIns.length };
  }, [state.checkIns]);

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/profile')} className="text-muted-foreground p-2 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-heading text-lg font-semibold text-foreground">Pattern Mirror</h1>
          <p className="text-[10px] text-muted-foreground">Your emotional rhythms, reflected</p>
        </div>
      </div>

      {!analysis ? (
        <div className="text-center py-16 space-y-3">
          <motion.div
            className="mx-auto h-16 w-16 rounded-full bg-muted/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <p className="font-heading text-sm italic text-muted-foreground">
            "Patterns emerge with practice."
          </p>
          <p className="text-xs text-muted-foreground/60">Complete a few check-ins to see your patterns here.</p>
        </div>
      ) : (
        <>
          {/* Trend Banner */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="soul-card-raised text-center space-y-2"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Direction</p>
            <p className="font-heading text-xl text-foreground">
              {analysis.trend === 'rising' && '↑ Rising toward openness'}
              {analysis.trend === 'settling' && '↓ Moving inward'}
              {analysis.trend === 'steady' && '→ Holding steady'}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Based on your last {Math.min(analysis.total, 10)} check-ins
            </p>
          </motion.div>

          {/* State Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="soul-card space-y-4"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Where You've Been</p>
            <div className="space-y-3">
              {STATE_ORDER.map((s, i) => {
                const pct = (analysis.freq[s] / analysis.maxFreq) * 100;
                return (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-[10px] text-muted-foreground w-16 text-right">{STATE_LABELS[s]}</span>
                    <div className="flex-1 h-3 bg-muted/20 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${STATE_COLORS[s]}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(pct, 3)}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 w-6">{analysis.freq[s]}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Weekly Rhythm */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="soul-card space-y-4"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider">7-Day Rhythm</p>
            <div className="flex items-end justify-between gap-1 h-24">
              {analysis.weekData.map((day, i) => {
                const h = day.avgPos >= 0 ? ((day.avgPos + 1) / 5) * 100 : 10;
                const color = day.avgPos >= 3 ? 'bg-primary' : day.avgPos >= 1.5 ? 'bg-soul-violet' : 'bg-soul-dim';
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      className={`w-full max-w-[2rem] rounded-t-md ${day.count > 0 ? color : 'bg-muted/10'}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
                    />
                    <span className="text-[8px] text-muted-foreground/50">{day.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Insight */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-4 space-y-2"
          >
            <p className="font-heading text-sm italic text-muted-foreground leading-relaxed">
              {analysis.mostCommon === 'flowing' && '"You spend a lot of time in flow. You know how to get there."'}
              {analysis.mostCommon === 'open' && '"Openness is your most common state. Trust that."'}
              {analysis.mostCommon === 'flat' && '"Stillness is not stagnation. It can be the calm before clarity."'}
              {analysis.mostCommon === 'restless' && '"Restlessness often carries unspent creative energy."'}
              {analysis.mostCommon === 'tense' && '"Contraction isn\'t failure — it\'s information. You\'re paying attention."'}
            </p>
          </motion.div>
        </>
      )}
    </div>
  );
}
