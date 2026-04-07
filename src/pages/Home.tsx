import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '@/lib/AppContext';
import CurrentPulse from '@/components/CurrentPulse';
import QuickCheckIn from '@/components/QuickCheckIn';
import TodayFlowCard from '@/components/TodayFlowCard';
import QuickLaunchCards from '@/components/QuickLaunchCards';
import DailyInsight from '@/components/DailyInsight';
import type { QuickState, EmotionalState } from '@/lib/types';

const quickToEmotional: Record<QuickState, EmotionalState> = {
  tight: 'tense',
  restless: 'restless',
  flat: 'flat',
  open: 'open',
  flowing: 'flowing',
};

export default function Home() {
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
    <div className="mx-auto max-w-lg px-4 pt-12 pb-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-1"
      >
        <h1 className="font-heading text-2xl font-semibold text-foreground">SoulCurrent</h1>
        <p className="text-xs text-muted-foreground font-light">Return to your inner current</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <CurrentPulse quickState={quickState || 'flat'} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <QuickCheckIn selected={quickState} onSelect={handleQuickCheckIn} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <TodayFlowCard flow={state.todayFlow} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-medium text-foreground">Quick Launch</h2>
          <QuickLaunchCards />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <DailyInsight />
      </motion.div>
    </div>
  );
}
