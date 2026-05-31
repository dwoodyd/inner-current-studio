// StageUpOverlay — global celebratory overlay that listens for
// `iw:current-stageup` events fired from progress.ts and shows a
// shareable sigil card with the new stage name.
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Share2 } from 'lucide-react';
import { DOMAINS, type DomainKey } from '@/lib/domains';
import { CURRENT_SPECS } from '@/lib/currents/spec';
import CurrentSigil from '@/components/currents/CurrentSigil';

const STAGE_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: 'Seed', 2: 'Sprout', 3: 'Bloom', 4: 'Resonance',
};
const STAGE_BLESS: Record<1 | 2 | 3 | 4, string> = {
  1: 'You\u2019ve planted it.',
  2: 'Something is reaching for light.',
  3: 'It\u2019s blooming through you.',
  4: 'You and this current have become one frequency.',
};

type Payload = { slug: DomainKey; fromStage: 1|2|3|4; toStage: 1|2|3|4 };

export default function StageUpOverlay() {
  const [event, setEvent] = useState<Payload | null>(null);

  useEffect(() => {
    const onUp = (e: Event) => {
      const d = (e as CustomEvent).detail as Payload;
      if (!d) return;
      setEvent(d);
    };
    window.addEventListener('iw:current-stageup', onUp);
    return () => window.removeEventListener('iw:current-stageup', onUp);
  }, []);

  async function share() {
    if (!event) return;
    const spec = CURRENT_SPECS[event.slug];
    const text = `My ${spec.shortName} current just reached ${STAGE_LABEL[event.toStage]} on Inner Wake.`;
    try {
      if (navigator.share) await navigator.share({ title: 'Inner Wake', text });
      else await navigator.clipboard.writeText(text);
    } catch {}
  }

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-background/85 backdrop-blur-md p-6"
          onClick={() => setEvent(null)}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm w-full soul-glass-elevated rounded-3xl p-7 text-center space-y-5 border border-primary/20"
          >
            <button
              onClick={() => setEvent(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X size={14} />
            </button>

            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 180, damping: 16 }}
              className="flex items-center justify-center gap-2 text-primary"
            >
              <Sparkles size={14} />
              <span className="text-[10px] uppercase tracking-[0.32em]">Stage Up</span>
              <Sparkles size={14} />
            </motion.div>

            {(() => {
              const spec = CURRENT_SPECS[event.slug];
              const d = DOMAINS[event.slug];
              return (
                <>
                  <div className="relative mx-auto" style={{ width: 200, height: 200 }}>
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: `radial-gradient(circle, ${d.glow}, transparent 70%)` }}
                      animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <CurrentSigil base={spec.sigilBase} stage={event.toStage} size={200} glow={d.glow} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-primary/70">{spec.shortName} \u00b7 {STAGE_LABEL[event.toStage]}</p>
                    <h2 className="font-heading text-2xl text-foreground tracking-tight">{STAGE_BLESS[event.toStage]}</h2>
                  </div>
                </>
              );
            })()}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={share}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary text-xs uppercase tracking-[0.18em] hover:bg-primary/25 transition-colors"
              >
                <Share2 size={12} /> Share
              </button>
              <button
                onClick={() => setEvent(null)}
                className="px-4 py-2 rounded-full text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
              >
                Stay with it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
