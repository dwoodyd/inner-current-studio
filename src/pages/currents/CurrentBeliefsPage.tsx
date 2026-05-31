// Standalone Belief Library page for /currents/:slug/beliefs.
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DOMAINS, type DomainKey } from '@/lib/domains';
import { CURRENT_SPECS } from '@/lib/currents/spec';
import BeliefLibrary from '@/components/currents/BeliefLibrary';

export default function CurrentBeliefsPage() {
  const { slug } = useParams<{ slug: DomainKey }>();
  const navigate = useNavigate();

  if (!slug || !(slug in DOMAINS)) {
    return <div className="p-6 text-center text-sm text-muted-foreground">That current doesn\'t exist.</div>;
  }
  const spec = CURRENT_SPECS[slug];

  return (
    <div className="mx-auto max-w-lg px-4 pt-10 pb-12 space-y-6 safe-top">
      <button onClick={() => navigate(`/currents/${slug}`)} className="text-muted-foreground hover:text-foreground text-sm inline-flex items-center gap-1.5">
        <ArrowLeft size={16} /> {spec.shortName}
      </button>
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.22em] text-primary/70">{spec.shortName} Current</p>
        <h1 className="font-heading text-2xl text-foreground tracking-tight">Belief Library</h1>
      </div>
      <BeliefLibrary slug={slug} />
    </div>
  );
}
