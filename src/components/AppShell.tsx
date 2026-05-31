import { Link, Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import OfflineBanner from './OfflineBanner';
import { PaymentTestModeBanner } from './PaymentTestModeBanner';
import { TrialCountdownBanner } from './TrialCountdownBanner';
import { MigrationNoticeModal } from './MigrationNoticeModal';
import { useAppState } from '@/lib/AppContext';

export default function AppShell() {
  const location = useLocation();
  const { state } = useAppState();
  const hideBottomNav = location.pathname === '/reset/breathwork';
  const latestState = state.checkIns[0]?.state ?? 'steady';
  const stateLabel = latestState.replace('-', ' ');

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background safe-x">
      <PaymentTestModeBanner />
      <TrialCountdownBanner />
      <OfflineBanner />
      {!hideBottomNav && (
        <Link
          to="/"
          aria-label={`Current state: ${stateLabel}. Update check-in.`}
          className="fixed right-4 top-[max(0.75rem,env(safe-area-inset-top))] z-40 grid h-10 w-10 place-items-center rounded-full border border-border/30 bg-card/80 shadow-[0_0_18px_hsl(var(--primary)/0.14)] backdrop-blur-xl transition-transform hover:scale-105"
        >
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
        </Link>
      )}
      <main className={`flex-1 overflow-y-auto ${hideBottomNav ? 'pb-0' : 'pb-32'}`}>
        <Outlet />
      </main>
      {!hideBottomNav && <BottomNav />}
      <MigrationNoticeModal />
    </div>
  );
}
