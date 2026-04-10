import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export default function OfflineBanner() {
  const online = useOnlineStatus();

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 bg-muted/95 backdrop-blur-sm border-b border-border/30 px-4 py-2.5 safe-top"
        >
          <WifiOff size={14} className="text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground">
            You're offline — changes will sync when you reconnect
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
