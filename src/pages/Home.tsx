import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Moon, Sparkles, Sun } from 'lucide-react';
import { useAppState } from '@/lib/AppContext';
import { useTheme } from '@/hooks/useTheme';
import CurrentPulse from '@/components/CurrentPulse';
import QuickCheckIn from '@/components/QuickCheckIn';
import TodayFlowCard from '@/components/TodayFlowCard';
import QuickLaunchCards from '@/components/QuickLaunchCards';
import DailyInsight from '@/components/DailyInsight';
import StateSoundscape from '@/components/StateSoundscape';
import brandLogo from '@/assets/inner-wake-logo.svg';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { DOMAINS, type DomainKey } from '@/lib/domains';
import { useWeeklyDigest } from '@/lib/currents/progress';
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
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const FAVICON_VERSION = '20260531b';
const STATIC_FAVICON = `/inner-wake-logo.svg?v=${FAVICON_VERSION}`;
const STATIC_SHORTCUT_ICON = `/inner-wake-logo.svg?v=${FAVICON_VERSION}`;
const STATIC_APPLE_ICON = `/inner-wake-logo.svg?v=${FAVICON_VERSION}`;
const FAVICON_GLOW_FRAMES = [STATIC_FAVICON];

const ritualRecommendations: Record<QuickState, { title: string; reason: string; route: string; guide: string }> = {
  tight: {
    title: 'Resistance Release',
    reason: 'You’re holding tension — start by giving the body somewhere safe to soften.',
    route: '/reset/resistance',
    guide: 'Current Guide notices contraction patterns best after a body-first release.',
  },
  restless: {
    title: 'Contrast Reset',
    reason: 'You’re scattered — name the contrast, then let one clearer preference emerge.',
    route: '/reset/contrast',
    guide: 'Your recent check-ins can reveal what keeps pulling attention outward.',
  },
  flat: {
    title: 'Stillness Timer',
    reason: 'You’re neutral or low-volume — use quiet presence before trying to shift anything.',
    route: '/reset/stillness',
    guide: 'A steady baseline helps the app learn what “center” feels like for you.',
  },
  open: {
    title: 'Alignment Wheel',
    reason: 'You’re receptive — gather believable words while the door is already open.',
    route: '/align/wheel',
    guide: 'This is a strong moment for affirmation work that does not feel forced.',
  },
  flowing: {
    title: 'Alignment Wheel',
    reason: 'You’re in the current — let one aligned sentence turn into movement.',
    route: '/align/wheel',
    guide: 'When flow appears, the best ritual is often short, embodied repetition.',
  },
};

function ensureHeadLink(selector: string, attributes: Record<string, string>) {
  const existing = document.head.querySelector<HTMLLinkElement>(selector);
  const link = existing ?? document.createElement('link');

  Object.entries(attributes).forEach(([key, value]) => link.setAttribute(key, value));

  if (!existing) {
    document.head.appendChild(link);
  }

  return link;
}

export default function Home() {
  const navigate = useNavigate();
  const { state, addCheckIn } = useAppState();
  const { resolved, setMode } = useTheme();
  const { user } = useAuth();
  const { freeCurrent } = useSubscription();
  const digest = useWeeklyDigest();

  const featuredCurrent = useMemo<DomainKey>(() => {
    const accountAgeMs = user?.created_at ? Date.now() - new Date(user.created_at).getTime() : 0;
    const isNew = accountAgeMs > 0 && accountAgeMs < 30 * 24 * 60 * 60 * 1000;
    const localFree = state.onboarding.freeCurrent as DomainKey | undefined;
    if (isNew) {
      return (freeCurrent as DomainKey) || localFree || digest.topCurrent || 'money';
    }
    return digest.topCurrent || (freeCurrent as DomainKey) || localFree || 'money';
  }, [user?.created_at, freeCurrent, state.onboarding.freeCurrent, digest.topCurrent]);

  const featured = DOMAINS[featuredCurrent];

  // Derive last persisted state from most recent check-in.
  // Reactively syncs after cloud-state loads — no longer defaults to "flat" forever.
  const persistedQuickState = useMemo<QuickState | undefined>(() => {
    const last = state.checkIns[0];
    if (!last) return undefined;
    return Object.entries(quickToEmotional).find(([, v]) => v === last.state)?.[0] as QuickState | undefined;
  }, [state.checkIns]);

  const [quickState, setQuickState] = useState<QuickState | undefined>(persistedQuickState);

  // Keep local picker in sync when cloud check-ins arrive after first render.
  useEffect(() => {
    if (!quickState && persistedQuickState) setQuickState(persistedQuickState);
  }, [persistedQuickState, quickState]);

  const handleQuickCheckIn = (qs: QuickState) => {
    setQuickState(qs);
    addCheckIn(quickToEmotional[qs]);
  };

  const recommendation = ritualRecommendations[quickState || 'flat'];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const faviconLink = ensureHeadLink('link[data-runtime-favicon="true"]', {
      rel: 'icon',
      type: 'image/svg+xml',
      href: STATIC_FAVICON,
      'data-runtime-favicon': 'true',
    });

    ensureHeadLink('link[data-runtime-shortcut-icon="true"]', {
      rel: 'shortcut icon',
      type: 'image/svg+xml',
      href: STATIC_SHORTCUT_ICON,
      'data-runtime-shortcut-icon': 'true',
    });

    ensureHeadLink('link[data-runtime-apple-touch-icon="true"]', {
      rel: 'apple-touch-icon',
      href: STATIC_APPLE_ICON,
      'data-runtime-apple-touch-icon': 'true',
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      faviconLink.href = STATIC_FAVICON;
      return () => {
        faviconLink.href = STATIC_FAVICON;
      };
    }

    const timeouts = FAVICON_GLOW_FRAMES.map((href, index) =>
      window.setTimeout(() => {
        faviconLink.href = href;
      }, index * 150)
    );

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
      faviconLink.href = STATIC_FAVICON;
    };
  }, []);

  return (
    <div className="relative">
      {/* Ambient background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(42 65% 58% / 0.06), transparent 70%)' }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 -right-32 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(265 25% 45% / 0.04), transparent 70%)' }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-lg px-4 pt-8 pb-6 space-y-4 safe-top sm:space-y-6 sm:pt-12"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="relative text-center space-y-1.5 sm:space-y-2">
          <button
            onClick={() => setMode(resolved === 'dark' ? 'light' : 'dark')}
            className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-border/20 bg-card/50 backdrop-blur-md transition-all duration-200 hover:bg-card/80 active:scale-95"
            aria-label={resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {resolved === 'dark' ? (
              <Sun size={16} className="text-primary" />
            ) : (
              <Moon size={16} className="text-primary" />
            )}
          </button>
          <motion.div
            className="mx-auto mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full soul-glow-gold sm:mb-3 sm:h-20 sm:w-20"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <video
              src="/orb-beta.mp4"
              autoPlay
              loop
              muted
              playsInline
              disablePictureInPicture
              preload="auto"
              aria-hidden="true"
              className="h-full w-full object-cover rounded-full"
            />
          </motion.div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Inner Wake</h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-light tracking-wide font-heading italic">Wake the inner current</p>
        </motion.div>

        {/* Pulse */}
        <motion.div variants={fadeUp} className="soul-glass-elevated rounded-2xl p-3 soul-ambient-gold sm:p-5">
          <CurrentPulse quickState={quickState || 'flat'} />
        </motion.div>

        {/* Check-in */}
        <motion.div variants={fadeUp}>
          <QuickCheckIn selected={quickState} onSelect={handleQuickCheckIn} />
        </motion.div>

        {/* Recommended now — surfaced immediately after check-in */}
        <motion.div variants={fadeUp}>
          <button
            onClick={() => navigate(recommendation.route)}
            className="group relative w-full overflow-hidden rounded-2xl p-4 text-left transition-all duration-200 hover:bg-muted/10 active:scale-[0.98] soul-glass-elevated soul-glow-gold border border-primary/20 sm:p-5"
          >
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full"
              style={{ background: 'radial-gradient(circle, hsl(42 70% 60% / 0.18), transparent 70%)' }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles size={16} />
                  <span className="text-[11px] uppercase tracking-[0.18em]">Recommended now</span>
                </div>
                <h2 className="font-heading text-xl font-medium text-foreground sm:text-2xl">{recommendation.title}</h2>
                <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{recommendation.reason}</p>
                <p className="text-[11px] leading-relaxed text-muted-foreground/70 italic">{recommendation.guide}</p>
              </div>
              <ArrowRight size={18} className="mt-1 shrink-0 text-primary/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>
        </motion.div>

        {/* State-matched soundscape (Wave A audio UI) */}
        <motion.div variants={fadeUp}>
          <StateSoundscape state={quickState || 'flat'} />
        </motion.div>


        {/* Daily Rituals — Morning Awakening & Evening Settling */}
        <motion.div variants={fadeUp} className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-heading text-lg font-medium text-foreground">Daily Rituals</h2>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
              {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                to: '/ritual/morning', icon: Sun, label: 'Morning Awakening',
                hint: 'Breath, intention, state.',
                accent: new Date().getHours() < 12,
                bg: 'linear-gradient(135deg, hsl(42 70% 60% / 0.10), hsl(42 60% 50% / 0.04))',
                ring: 'border-primary/20',
                iconClass: 'text-primary',
              },
              {
                to: '/ritual/evening', icon: Moon, label: 'Evening Settling',
                hint: 'Exhale, soften, close.',
                accent: new Date().getHours() >= 18,
                bg: 'linear-gradient(135deg, hsl(265 50% 55% / 0.10), hsl(265 40% 40% / 0.04))',
                ring: 'border-soul-violet/20',
                iconClass: 'text-soul-violet',
              },
            ].map(({ to, icon: Icon, label, hint, accent, bg, ring, iconClass }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                style={{ background: bg }}
                className={`group rounded-2xl border ${ring} p-4 text-left transition-all duration-200 hover:brightness-110 active:scale-[0.98] ${accent ? 'soul-glow-gold' : ''}`}
              >
                <Icon size={18} className={`${iconClass} mb-2`} strokeWidth={1.5} />
                <p className="font-heading text-sm text-foreground">{label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Today's Flow */}
        <motion.div variants={fadeUp} className="soul-glass-elevated rounded-2xl p-5">
          <TodayFlowCard flow={state.todayFlow} />
        </motion.div>

        {/* Quick Launch */}
        <motion.div variants={fadeUp}>
          <div className="space-y-3">
            <h2 className="font-heading text-lg font-medium text-foreground">Quick Launch</h2>
            <QuickLaunchCards />
          </div>
        </motion.div>

        {/* Featured Current */}
        <motion.div variants={fadeUp}>
          <button
            onClick={() => navigate(`/currents/${featured.key}`)}
            className="group w-full rounded-2xl p-4 text-left transition-all duration-200 hover:bg-muted/10 active:scale-[0.98] soul-glass-elevated sm:p-5"
            style={{ background: featured.gradient }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{featured.emoji}</span>
                  <h2 className="font-heading text-lg font-medium text-foreground">{featured.label}</h2>
                </div>
                <p className="text-xs text-muted-foreground">{featured.tagline}</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
            </div>
          </button>
        </motion.div>

        {/* Daily Insight */}
        <motion.div variants={fadeUp} className="soul-glass rounded-2xl p-4 soul-ambient-violet sm:p-5">
          <DailyInsight />
        </motion.div>
      </motion.div>
    </div>
  );
}
