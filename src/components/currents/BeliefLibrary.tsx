// Belief Library — shows beliefs for a Current with bridge/ending,
// lets user mark a belief as Landed (True) or Alive.
// Pipes into the Current's progress (drives Sigil evolution).

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { DomainKey } from '@/lib/domains';
import { CURRENT_SPECS, type Belief } from '@/lib/currents/spec';
import { useCurrentProgress } from '@/lib/currents/progress';

interface Props { slug: DomainKey }

export default function BeliefLibrary({ slug }: Props) {
  const navigate = useNavigate();
  const spec = CURRENT_SPECS[slug];
  const { progress, landBelief } = useCurrentProgress(slug);
  const [params] = useSearchParams();
  const [openId, setOpenId] = useState<string | null>(params.get('focus'));
  useEffect(() => {
    const f = params.get('focus');
    if (f) {
      setOpenId(f);
      setTimeout(() => {
        document.getElementById(`belief-${f}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [params]);

  const landed = (b: Belief): 'true' | 'alive' | null =>
    progress.beliefsLandedAsAlive.includes(b.id) ? 'alive' :
    progress.beliefsLandedAsTrue.includes(b.id) ? 'true' : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg text-foreground tracking-tight">Belief Library</h3>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
          {progress.beliefsLandedAsTrue.length + progress.beliefsLandedAsAlive.length}/{spec.beliefs.length}
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Read the starting thought. Walk the bridge. See where you land today.
        You can run any belief through the full Alignment Wheel for a deeper cycle.
      </p>

      <div className="space-y-2">
        {spec.beliefs.map((b) => {
          const isOpen = openId === b.id;
          const mark = landed(b);
          return (
            <motion.div key={b.id} id={`belief-${b.id}`} layout className="soul-glass rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenId(isOpen ? null : b.id)}
                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/10 transition-colors"
              >
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm text-foreground leading-snug">{b.startingThought}</p>
                  {mark && (
                    <p className={`text-[10px] uppercase tracking-[0.18em] ${mark === 'alive' ? 'text-primary' : 'text-emerald-400/80'}`}>
                      {mark === 'alive' ? 'Alive' : 'True'}
                    </p>
                  )}
                </div>
                <ChevronRight size={14} className={`text-muted-foreground/40 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="px-4 pb-4 space-y-3 border-t border-border/20"
                  >
                    <div className="pt-3 space-y-2">
                      {b.bridgeThoughts.map((bridge, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="mt-1.5 h-1 w-3 rounded-full bg-muted-foreground/30 shrink-0" />
                          <p className="text-sm text-muted-foreground/90 leading-snug italic">{bridge}</p>
                        </div>
                      ))}
                      <div className="flex items-start gap-2 pt-1">
                        <Sparkles size={14} className="text-primary mt-0.5 shrink-0" />
                        <p className="text-sm text-foreground leading-snug">{b.endingThought}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => { landBelief(b.id, 'true'); toast('Captured as True.', { description: b.endingThought }); }}
                        className="text-xs px-3 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Check size={12} /> Lands as True
                      </button>
                      <button
                        onClick={() => { landBelief(b.id, 'alive'); toast('Captured as Alive.', { description: b.endingThought }); }}
                        className="text-xs px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Sparkles size={12} /> Lands as Alive
                      </button>
                      <button
                        onClick={() => navigate(`/align/wheel?seed=${encodeURIComponent(b.startingThought)}&domain=${slug}`)}
                        className="text-xs px-3 py-1.5 rounded-full border border-border/30 bg-muted/10 text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
                      >
                        Open in Alignment Wheel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
