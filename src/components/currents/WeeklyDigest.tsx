// WeeklyDigest — at the top of the Currents hub, a small living recap:
// total practices, top streak, and a gentle nudge toward the least-touched current.
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, ArrowRight } from 'lucide-react';
import { ALL_DOMAIN_KEYS, DOMAINS, type DomainKey } from '@/lib/domains';
import { useWeeklyDigest } from '@/lib/currents/progress';
import { CURRENT_SPECS } from '@/lib/currents/spec';
import { SOON_DOMAINS } from '@/lib/currents/soonDomains';
import { useSubscription } from '@/hooks/useSubscription';
import { useAppState } from '@/lib/AppContext';

export default function WeeklyDigest() {
  const navigate = useNavigate();
  const { isPremium, freeCurrent } = useSubscription();
  const { state } = useAppState();
  const localFree = state.onboarding.freeCurrent;

  // Never nudge into a Current that's still "Coming soon" — the gate must hold
  // from every entry point, including this digest.
  const rawAvailable: DomainKey[] = isPremium
    ? [...ALL_DOMAIN_KEYS]
    : ['money', (freeCurrent || localFree || 'self') as DomainKey].filter((v, i, a) => a.indexOf(v) === i) as DomainKey[];
  const available = rawAvailable.filter((k) => !SOON_DOMAINS.has(k));

  const digest = useWeeklyDigest(available);
  if (digest.totalPracticesThisWeek === 0 && !digest.leastTouched) return null;

  const nudgeSlug = digest.leastTouched;
  const nudgeSpec = nudgeSlug ? CURRENT_SPECS[nudgeSlug] : null;
  const nudgeDomain = nudgeSlug ? DOMAINS[nudgeSlug] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="soul-glass-elevated rounded-2xl p-4 border border-primary/15 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.24em] text-primary/70">This week</p>
        {digest.topStreak && digest.topStreak.streak > 1 && (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-primary">
            <Flame size={11} /> {digest.topStreak.streak}-day streak
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-heading text-3xl text-foreground tracking-tight">{digest.totalPracticesThisWeek}</span>
        <span className="text-xs text-muted-foreground">practice{digest.totalPracticesThisWeek === 1 ? '' : 's'} across {digest.activeCurrents.length || 0} current{digest.activeCurrents.length === 1 ? '' : 's'}</span>
      </div>

      {nudgeSlug && nudgeSpec && nudgeDomain && (
        <button
          onClick={() => navigate(`/currents/${nudgeSlug}`)}
          className="w-full text-left flex items-center gap-3 pt-1 group"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
               style={{ background: `radial-gradient(circle, ${nudgeDomain.glow}, transparent 70%)` }}>
            <CurrentGlyph current={nudgeSlug} size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Gentle nudge</p>
            <p className="text-sm text-foreground truncate">Your {nudgeSpec.shortName} current is asking for a moment.</p>
          </div>
          <ArrowRight size={14} className="text-muted-foreground/40 group-hover:text-foreground transition-colors shrink-0" />
        </button>
      )}
    </motion.div>
  );
}
