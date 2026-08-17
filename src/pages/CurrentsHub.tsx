import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import { SOON_DOMAINS } from '@/lib/currents/soonDomains';
import { ALL_DOMAIN_KEYS, DOMAINS, type DomainKey, type DomainConfig } from '@/lib/domains';
import { useSubscription } from '@/hooks/useSubscription';
import { useAppState } from '@/lib/AppContext';
import { CURRENT_SPECS } from '@/lib/currents/spec';
import { useCurrentProgress } from '@/lib/currents/progress';
import CurrentSigil from '@/components/currents/CurrentSigil';
import CurrentGlyph from '@/components/CurrentGlyph';
import { FIELD_HUES } from '@/lib/currentField';
import WeeklyDigest from '@/components/currents/WeeklyDigest';

const STAGE_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: 'Seed', 2: 'Sprout', 3: 'Bloom', 4: 'Resonance',
};

const CURRENT_GROUND_NOTES: Record<DomainKey, string> = {
  money: 'The inner posture around money shapes what you\'re able to receive.',
  self: 'The story you carry about who you are shapes every other current.',
  energy: 'The body is not a passenger. It holds the state.',
  relationships: 'The patterns you bring to other people begin long before you speak.',
  health: 'How you inhabit the body shapes what the body is able to hold.',
};

export default function CurrentsHub() {
  const navigate = useNavigate();
  const { isPremium, freeCurrent, status } = useSubscription();
  const { state } = useAppState();
  const localFree = state.onboarding.freeCurrent;
  const isOwner = status === 'owner';

  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(42 65% 58% / 0.06), transparent 70%)' }}
          animate={prefersReducedMotion ? { scale: 1, opacity: 0.5 } : { scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pt-10 pb-10 space-y-6 safe-top sm:pt-12 sm:space-y-7">
        <div className="text-center space-y-3">
          <h1 className="font-heading text-3xl font-semibold text-foreground tracking-tight">Currents</h1>
          <p className="text-sm text-muted-foreground max-w-[340px] mx-auto leading-relaxed">
            Each current is an area of life where the inner ground shapes the outcome. Saturate it, soften it, align it. Your sigils grow as you return.
          </p>
        </div>

        <WeeklyDigest />

        <div className="space-y-3">
          {ALL_DOMAIN_KEYS.map((key, i) => {
            const d = DOMAINS[key];
            const isActiveFocus = !isPremium && (freeCurrent === key || localFree === key);
            const isSoon = SOON_DOMAINS.has(key) && !isOwner;
            // "Coming soon" currents are not openable yet, regardless of subscription —
            // except for the owner, who needs preview access to validate content.
            const isOpen = !isSoon && (key === 'money' || isPremium || isOwner || freeCurrent === key || localFree === key);
            const badge = isSoon
              ? { label: 'Coming soon', tone: 'soon' as const }
              : SOON_DOMAINS.has(key) && isOwner
                ? { label: 'Preview', tone: 'active' as const }
                : isPremium || isOwner
                  ? null
                  : isActiveFocus
                    ? { label: 'Active focus', tone: 'active' as const }
                    : key === 'money'
                      ? null
                      : { label: 'Premium', tone: 'locked' as const };
            return (
              <CurrentCard
                key={key}
                slug={key}
                d={d}
                index={i}
                isOpen={isOpen}
                badge={badge}
                onClick={() => {
                  if (isSoon) return;
                  navigate(`/currents/${key}`);
                }}
              />
            );
          })}
        </div>

        <motion.button
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          onClick={() => navigate('/studios')}
          className="soul-glass w-full text-left p-4 rounded-2xl hover:bg-muted/10 transition-colors flex items-center gap-3 border border-primary/10"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 soul-glow-gold">
            <span className="text-base">✶</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-base text-foreground tracking-tight">Studios</h3>
            <p className="text-xs text-muted-foreground leading-snug">Longer arcs that weave several currents into one sitting.</p>
          </div>
          <ChevronRight size={14} className="text-muted-foreground/30 shrink-0" />
        </motion.button>
      </div>
    </div>
  );
}

interface CardProps {
  slug: DomainKey;
  d: DomainConfig;
  index: number;
  isOpen: boolean;
  badge: { label: string; tone: 'active' | 'locked' | 'soon' } | null;
  onClick: () => void;
}

function CurrentCard({ slug, d, index, isOpen, badge, onClick }: CardProps) {
  const spec = CURRENT_SPECS[slug];
  const { progress, stage } = useCurrentProgress(slug);
  const hasPracticed = progress.practicesCompleted > 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`group flex min-h-[88px] w-full items-center gap-3 rounded-2xl p-3.5 text-left transition-all duration-200 hover:bg-muted/10 active:scale-[0.98] soul-glass-elevated sm:min-h-[100px] sm:gap-4 sm:p-5 ${!isOpen ? 'opacity-70' : ''}`}
      style={{
        // Each current carries its own hue — the same hue the whole screen
        // takes on once you step inside it.
        borderColor: `hsl(${FIELD_HUES[slug].h} ${FIELD_HUES[slug].s}% 58% / 0.22)`,
        backgroundImage: `linear-gradient(135deg, hsl(${FIELD_HUES[slug].h} ${FIELD_HUES[slug].s}% 55% / 0.10), transparent 62%)`,
      }}
    >
      <div className="shrink-0 relative" style={{ width: 60, height: 60 }}>
        <CurrentSigil base={spec.sigilBase} stage={stage} size={60} glow={d.glow} />
      </div>
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <CurrentGlyph current={slug} size={18} className={d.accentClass} />
          <h3 className="font-heading text-lg font-medium text-foreground tracking-tight">{d.label}</h3>
          {badge && (
            <span className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] font-medium ${
              badge.tone === 'active'
                ? 'border border-primary/25 bg-primary/10 text-primary'
                : badge.tone === 'soon'
                  ? 'border border-soul-gold/25 bg-soul-gold/10 text-soul-gold/90'
                  : 'border border-border/30 bg-muted/40 text-muted-foreground'
            }`}>
              {badge.label}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-1">{d.tagline}</p>
        <p className="text-[11px] text-muted-foreground/55 italic font-heading leading-snug line-clamp-2">{CURRENT_GROUND_NOTES[slug]}</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
          {hasPracticed
            ? `${STAGE_LABEL[stage]} · ${progress.practicesCompleted} practice${progress.practicesCompleted === 1 ? '' : 's'}`
            : 'Untouched · ready to begin'}
        </p>
      </div>
      <ChevronRight size={16} className="text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground/60 transition-colors" />
    </motion.button>
  );
}
