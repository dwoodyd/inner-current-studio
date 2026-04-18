import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from './BottomNav';
import OfflineBanner from './OfflineBanner';
import { PaymentTestModeBanner } from './PaymentTestModeBanner';

const pageVariants = {
  initial: { opacity: 0, y: 6, willChange: 'transform, opacity' as const },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

export default function AppShell() {
  const location = useLocation();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background safe-x">
      <PaymentTestModeBanner />
      <OfflineBanner />
      <main className="flex-1 overflow-y-auto pb-24">
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
      <BottomNav />
    </div>
  );
}
