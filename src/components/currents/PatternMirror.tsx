// Pattern Mirror — weekly recap card for a current.
// Surfaces practice count + most-touched theme using the spec's patternMirrorAngle.
import { useMemo } from 'react';
import { CURRENT_SPECS } from '@/lib/currents/spec';
import { useCurrentProgress } from '@/lib/currents/progress';
import type { DomainKey } from '@/lib/domains';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function PatternMirror({ slug }: { slug: DomainKey }) {
  const spec = CURRENT_SPECS[slug];
  const { progress } = useCurrentProgress(slug);

  const recent = useMemo(() => {
    const last = progress.lastVisitedAt ? new Date(progress.lastVisitedAt).getTime() : 0;
    return last && Date.now() - last < WEEK_MS;
  }, [progress.lastVisitedAt]);

  const allBeliefs = [...progress.beliefsLandedAsTrue, ...progress.beliefsLandedAsAlive];
  if (!recent && allBeliefs.length === 0) return null;

  const themeCounts = new Map<string, number>();
  for (const id of allBeliefs) {
    const b = spec.beliefs.find((x) => x.id === id);
    if (!b) continue;
    for (const t of b.themes) themeCounts.set(t, (themeCounts.get(t) ?? 0) + 1);
  }
  const topTheme = [...themeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'returning';

  const message = spec.patternMirrorAngle
    .replace('{n}', String(progress.practicesCompleted || 0))
    .replace('{theme}', topTheme)
    .replace('{lowState}', 'tight')
    .replace('{highState}', 'open');

  return (
    <section className="space-y-2">
      <h2 className="font-heading text-lg text-foreground tracking-tight">Pattern Mirror</h2>
      <div className="soul-glass rounded-2xl p-4 border border-border/20">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">This week</p>
        <p className="text-sm text-muted-foreground italic leading-relaxed">"{message}"</p>
      </div>
    </section>
  );
}
