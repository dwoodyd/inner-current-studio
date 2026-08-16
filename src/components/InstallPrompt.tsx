import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { PRACTICE_EVENT, hasCompletedFirstPractice } from '@/lib/practiceMilestone';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'iw_install_prompt_dismissed';

function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * Home-screen invitation. Held back until the user has finished their first
 * practice, then shown once — never on first visit, never nagging.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [practiced, setPracticed] = useState(hasCompletedFirstPractice);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return Boolean(localStorage.getItem(DISMISSED_KEY));
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onPractice = () => setPracticed(true);
    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener(PRACTICE_EVENT, onPractice);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener(PRACTICE_EVENT, onPractice);
    };
  }, []);

  const close = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => undefined);
    close();
  };

  const visible = practiced && !dismissed && !!deferred && !isStandalone();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-[0_18px_50px_hsl(var(--background)/0.6)] backdrop-blur-xl sm:mx-auto sm:max-w-sm"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Dismiss"
            className="absolute right-3 top-3 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={16} />
          </button>
          <p className="font-heading text-base text-foreground">Keep this close.</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Add Inner Wake to your home screen so your practice is one tap away.
          </p>
          <button
            type="button"
            onClick={install}
            className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]"
          >
            <Download size={16} /> Add to home screen
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
