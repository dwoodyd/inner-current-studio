import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAppState } from '@/lib/AppContext';
import CurrentPulse from '@/components/CurrentPulse';
import QuickCheckIn from '@/components/QuickCheckIn';
import TodayFlowCard from '@/components/TodayFlowCard';
import QuickLaunchCards from '@/components/QuickLaunchCards';
import DailyInsight from '@/components/DailyInsight';
import brandLogo from '@/assets/inner-wake-logo.png';
import type { QuickState, EmotionalState } from '@/lib/types';

const quickToEmotional: Record<QuickState, EmotionalState> = {
  tight: 'tense',
  restless: 'restless',
  flat: 'flat',
  open: 'open',
  flowing: 'flowing',
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Home() {
  const navigate = useNavigate();
  const { state, addCheckIn } = useAppState();
  const [quickState, setQuickState] = useState<QuickState | undefined>(
    state.checkIns.length > 0
      ? (Object.entries(quickToEmotional).find(([, v]) => v === state.checkIns[0]?.state)?.[0] as QuickState)
      : undefined
  );

  const handleQuickCheckIn = (qs: QuickState) => {
    setQuickState(qs);
    addCheckIn(quickToEmotional[qs]);
  };

  return (
    <div className="relative">
      {/* Ambient background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(42 65% 58% / 0.06), transparent 70%)' }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 -right-32 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(265 25% 45% / 0.04), transparent 70%)' }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-lg px-4 pt-12 pb-6 space-y-6 safe-top"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="text-center space-y-2">
          <motion.div
            className="mx-auto h-20 w-20 rounded-2xl mb-3 flex items-center justify-center overflow-hidden"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img src={brandLogo} alt="Inner Wake" className="h-full w-full object-cover rounded-2xl" />
          </motion.div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Inner Wake</h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-light tracking-wide font-heading italic">Wake the inner current</p>
        </motion.div>

        {/* Pulse */}
        <motion.div variants={fadeUp} className="soul-glass-elevated rounded-2xl p-5 soul-ambient-gold">
          <CurrentPulse quickState={quickState || 'flat'} />
        </motion.div>

        {/* Check-in */}
        <motion.div variants={fadeUp}>
          <QuickCheckIn selected={quickState} onSelect={handleQuickCheckIn} />
        </motion.div>

        {/* Today's Flow */}
        <motion.div variants={fadeUp} className="soul-glass-elevated rounded-2xl p-5">
          <TodayFlowCard flow={state.todayFlow} />
        </motion.div>

        {/* Quick Launch */}
        <motion.div variants={fadeUp}>
          <div className="space-y-3">
            <h2 className="font-heading text-lg font-medium text-foreground">Quick Launch</h2>
            <QuickLaunchCards />
          </div>
        </motion.div>

        {/* Money Current */}
        <motion.div variants={fadeUp}>
          <button
            onClick={() => navigate('/money')}
            className="w-full soul-glass-elevated rounded-2xl p-5 text-left group hover:bg-muted/10 active:scale-[0.98] transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, hsl(42 65% 58% / 0.06), hsl(160 30% 40% / 0.04))' }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <h2 className="font-heading text-lg font-medium text-foreground">Money Current</h2>
                </div>
                <p className="text-xs text-muted-foreground">Release resistance. Rehearse receiving.</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
            </div>
          </button>
        </motion.div>

        {/* Daily Insight */}
        <motion.div variants={fadeUp} className="soul-glass rounded-2xl p-5 soul-ambient-violet">
          <DailyInsight />
        </motion.div>
      </motion.div>
    </div>
  );
}
