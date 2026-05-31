// Today's Belief — deterministic daily pick from a current's belief library.
// Tapping opens the bridge walk in the Belief Library.
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { CURRENT_SPECS } from '@/lib/currents/spec';
import { useCurrentProgress } from '@/lib/currents/progress';
import type { DomainKey } from '@/lib/domains';

const dayOfYear = (d = new Date()) => {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
};

export default function TodayBelief({ slug }: { slug: DomainKey }) {
  const navigate = useNavigate();
  const spec = CURRENT_SPECS[slug];
  const { progress } = useCurrentProgress(slug);

  const landed = new Set([...progress.beliefsLandedAsTrue, ...progress.beliefsLandedAsAlive]);
  const pool = spec.beliefs.filter((b) => !landed.has(b.id));
  const list = pool.length ? pool : spec.beliefs;
  const belief = list[dayOfYear() % list.length];

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg text-foreground tracking-tight">Today's Belief</h2>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Bridge walk</span>
      </div>
      <button
        onClick={() => navigate(`/currents/${slug}/beliefs?focus=${belief.id}`)}
        className="soul-glass-elevated w-full text-left p-4 rounded-2xl hover:bg-muted/10 transition-colors flex items-center gap-3 border border-primary/15"
      >
        <div className="flex-1 space-y-1.5 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70">From</p>
          <p className="text-sm text-foreground italic leading-snug">"{belief.startingThought}"</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70 pt-1">Toward</p>
          <p className="text-sm text-foreground/90 leading-snug">"{belief.endingThought}"</p>
        </div>
        <ChevronRight size={14} className="text-muted-foreground/30 shrink-0" />
      </button>
    </section>
  );
}
