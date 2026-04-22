import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe2, X } from 'lucide-react';

const DISMISSED_KEY = 'innerwake_environment_notice_dismissed';

function cameFromLovable() {
  try {
    return /lovable\.app|lovableproject\.com/.test(document.referrer);
  } catch {
    return false;
  }
}

export function EnvironmentRedirectNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isLiveDomain = window.location.hostname.includes('innerwake.live');
    const dismissed = sessionStorage.getItem(DISMISSED_KEY) === '1';
    setVisible(isLiveDomain && cameFromLovable() && !dismissed);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed left-4 right-4 top-4 z-[80] mx-auto max-w-lg rounded-2xl border border-primary/30 bg-card/95 p-4 shadow-2xl backdrop-blur safe-top">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Globe2 size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-base text-foreground">You’re on the live app now.</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            You may have left a Lovable preview session, so your preview login will not carry over here.
          </p>
          <Link
            to="/auth"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-transform active:scale-[0.98]"
          >
            Continue to sign-in <ArrowRight size={14} />
          </Link>
        </div>
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem(DISMISSED_KEY, '1');
            setVisible(false);
          }}
          className="rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Dismiss environment notice"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}