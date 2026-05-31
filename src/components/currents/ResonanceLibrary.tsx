// ResonanceLibrary — aggregate landed beliefs for a current, grouped by
// "Alive in me" vs "True for me", with the bridge ending each carries.
// Pro-only feature; free users see a soft locked teaser.
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import type { DomainKey } from '@/lib/domains';
import { CURRENT_SPECS } from '@/lib/currents/spec';
import { useCurrentProgress } from '@/lib/currents/progress';
import { useSubscription } from '@/hooks/useSubscription';

export default function ResonanceLibrary({ slug }: { slug: DomainKey }) {
  const spec = CURRENT_SPECS[slug];
  const { progress } = useCurrentProgress(slug);
  const { isPremium } = useSubscription();
  const navigate = useNavigate();

  const trueIds = progress.beliefsLandedAsTrue;
  const aliveIds = progress.beliefsLandedAsAlive;
  const total = trueIds.length + aliveIds.length;

  if (total === 0) return null;

  if (!isPremium) {
    return (
      <section className="space-y-3">
        <h2 className="font-heading text-lg text-foreground tracking-tight">Resonance Library</h2>
        <div className="soul-glass rounded-2xl p-4 border border-border/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
            <Lock size={14} className="text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{total} belief{total === 1 ? '' : 's'} landed</p>
            <p className="text-xs text-muted-foreground">Open the full archive of what\u2019s become true and alive in you with Pro.</p>
          </div>
          <button
            onClick={() => navigate('/profile/subscription')}
            className="text-[11px] uppercase tracking-[0.18em] text-primary hover:underline shrink-0"
          >
            See Pro
          </button>
        </div>
      </section>
    );
  }

  const rows = (ids: string[]) => ids
    .map((id) => spec.beliefs.find((b) => b.id === id))
    .filter(Boolean) as typeof spec.beliefs;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg text-foreground tracking-tight">Resonance Library</h2>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">{total} landed</span>
      </div>

      {aliveIds.length > 0 && (
        <Group label="Alive in me" tone="primary" beliefs={rows(aliveIds)} />
      )}
      {trueIds.length > 0 && (
        <Group label="True for me" tone="muted" beliefs={rows(trueIds)} />
      )}
    </section>
  );
}

function Group({ label, tone, beliefs }: { label: string; tone: 'primary' | 'muted'; beliefs: { id: string; startingThought: string; endingThought: string }[] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles size={11} className={tone === 'primary' ? 'text-primary' : 'text-muted-foreground'} />
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">{label}</p>
      </div>
      <div className="space-y-2">
        {beliefs.map((b: any, i: number) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="soul-glass rounded-2xl p-3.5 border border-border/15"
          >
            <p className="text-xs text-muted-foreground/70 italic line-through decoration-muted-foreground/40">{b.startingThought}</p>
            <p className="text-sm text-foreground mt-1 leading-snug">{b.endingThought}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
