import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useAppState } from '@/lib/AppContext';

export default function OfflineBanner() {
  const online = useOnlineStatus();
  const { pendingSyncCount } = useAppState();
  const [justSynced, setJustSynced] = useState(false);
  const prevPending = useRef(pendingSyncCount);
  const hideTimer = useRef<number | null>(null);

  // Flash a brief "synced" pill when the queue drains while online.
  useEffect(() => {
    if (online && prevPending.current > 0 && pendingSyncCount === 0) {
      setJustSynced(true);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setJustSynced(false), 2200);
    }
    prevPending.current = pendingSyncCount;
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [pendingSyncCount, online]);

  const syncing = online && pendingSyncCount > 0;
  const visible = !online || syncing || justSynced;

  let icon = <WifiOff size={14} className="text-muted-foreground" />;
  let label = "You're offline — your check-ins and timers keep working and will sync when you reconnect";
  if (!online && pendingSyncCount > 0) {
    label = `You're offline — ${pendingSyncCount} change${pendingSyncCount === 1 ? '' : 's'} will sync when you reconnect`;
  } else if (syncing) {
    icon = <RefreshCw size={14} className="text-muted-foreground animate-spin" />;
    label = `Syncing ${pendingSyncCount} change${pendingSyncCount === 1 ? '' : 's'}…`;
  } else if (justSynced) {
    icon = <Check size={14} className="text-primary" />;
    label = 'All changes synced';
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 bg-muted/95 backdrop-blur-sm border-b border-border/30 px-4 py-2.5 safe-top"
          role="status"
          aria-live="polite"
        >
          {icon}
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
