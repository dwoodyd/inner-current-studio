import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from './BottomNav';
import OfflineBanner from './OfflineBanner';
import { PaymentTestModeBanner } from './PaymentTestModeBanner';
import { useAppState } from '@/lib/AppContext';

const pageVariants = {
  initial: { opacity: 0, y: 6, willChange: 'transform, opacity' as const },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

export default function AppShell() {
  const location = useLocation();
  const { state } = useAppState();
  const hideBottomNav = location.pathname === '/reset/breathwork';
  const latestState = state.checkIns[0]?.state ?? 'steady';
  const stateLabel = latestState.replace('-', ' ');

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background safe-x">
      <PaymentTestModeBanner />
      <OfflineBanner />
      {!hideBottomNav && (
        <Link
          to="/"
          aria-label={`Current state: ${stateLabel}. Update check-in.`}
          className="fixed right-4 top-[max(0.75rem,env(safe-area-inset-top))] z-40 grid h-9 w-9 place-items-center rounded-full bg-[radial-gradient(circle_at_50%_50%,hsl(var(--muted)),hsl(var(--card))_60%,hsl(var(--background))_100%)] shadow-[0_0_18px_hsl(var(--primary)/0.18)] transition-transform hover:scale-105"
        >
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
          <span className="absolute -bottom-4 right-0 whitespace-nowrap font-heading text-[10px] italic text-muted-foreground/60">{stateLabel}</span>
        </Link>
      )}
      <main className={`flex-1 overflow-y-auto ${hideBottomNav ? 'pb-0' : 'pb-24'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
