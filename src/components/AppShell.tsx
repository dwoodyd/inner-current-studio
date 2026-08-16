import { Link, Outlet, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import BottomNav from './BottomNav';
import OfflineBanner from './OfflineBanner';
import { PaymentTestModeBanner } from './PaymentTestModeBanner';
import { TrialCountdownBanner } from './TrialCountdownBanner';
import { MigrationNoticeModal } from './MigrationNoticeModal';
import InstallPrompt from './InstallPrompt';
import { useAppState } from '@/lib/AppContext';
import { STATE_DEFS } from '@/lib/states';
import { useTheme } from '@/hooks/useTheme';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { QuickState } from '@/lib/types';

const STATE_DOT_CLASS: Record<QuickState, string> = {
  tight: 'bg-soul-warm shadow-[0_0_8px_hsl(var(--soul-warm))]',
  restless: 'bg-soul-gold shadow-[0_0_8px_hsl(var(--soul-gold))]',
  flat: 'bg-muted-foreground shadow-[0_0_8px_hsl(var(--muted-foreground))]',
  open: 'bg-soul-blue shadow-[0_0_8px_hsl(var(--soul-blue))]',
  flowing: 'bg-soul-green shadow-[0_0_8px_hsl(var(--soul-green))]',
};

export default function AppShell() {
  const location = useLocation();
  const { state } = useAppState();
  const { resolved, setMode } = useTheme();
  const hideBottomNav = location.pathname === '/reset/breathwork';
  const rawState = (state.checkIns[0]?.state ?? 'flat') as QuickState;
  const currentState: QuickState = STATE_DEFS[rawState] ? rawState : 'flat';
  const stateLabel = STATE_DEFS[currentState].label;
  const dotClass = STATE_DOT_CLASS[currentState] ?? STATE_DOT_CLASS.flat;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background safe-x">
      <PaymentTestModeBanner />
      <TrialCountdownBanner />
      <OfflineBanner />
      {!hideBottomNav && (
        <>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setMode(resolved === 'dark' ? 'light' : 'dark')}
                  className="fixed right-[3.25rem] top-[max(0.75rem,env(safe-area-inset-top))] z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border/30 bg-card/80 shadow-[0_0_18px_hsl(var(--primary)/0.14)] backdrop-blur-xl transition-transform hover:scale-105"
                  aria-label={resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {resolved === 'dark' ? (
                    <Sun size={16} className="text-primary" />
                  ) : (
                    <Moon size={16} className="text-primary" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" sideOffset={8}>
                {resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/"
                  aria-label={`Your current state: ${stateLabel}. Tap to update check-in.`}
                  className="fixed right-4 top-[max(0.75rem,env(safe-area-inset-top))] z-40 grid h-10 w-10 place-items-center rounded-full border border-border/30 bg-card/80 shadow-[0_0_18px_hsl(var(--primary)/0.14)] backdrop-blur-xl transition-transform hover:scale-105"
                >
                  <span className={`h-2 w-2 rounded-full ${dotClass}`} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="left" sideOffset={8}>
                Your current state: {stateLabel}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
      <main className={`flex-1 overflow-y-auto ${hideBottomNav ? 'pb-0' : 'pb-32'}`}>
        <Outlet />
      </main>
      {!hideBottomNav && <BottomNav />}
      <MigrationNoticeModal />
      <InstallPrompt />
    </div>
  );
}
