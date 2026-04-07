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

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
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
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-lg px-4 pt-12 pb-6 space-y-6"
    >
      <motion.div variants={fadeUp} className="text-center space-y-1">
        <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">SoulCurrent</h1>
        <p className="text-xs text-muted-foreground font-light tracking-wide">Return to your inner current</p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <CurrentPulse quickState={quickState || 'flat'} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <QuickCheckIn selected={quickState} onSelect={handleQuickCheckIn} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <TodayFlowCard flow={state.todayFlow} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-medium text-foreground">Quick Launch</h2>
          <QuickLaunchCards />
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <DailyInsight />
      </motion.div>
    </motion.div>
  );
}
