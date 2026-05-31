// CurrentLayout — the shared spec page: hero + sigil + state check
// + belief library link + guided sequences list + recent work.
// Used by all five Currents at /currents/:slug.

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, BookOpen, Sparkles, MessageCircle } from 'lucide-react';
import { DOMAINS, type DomainKey } from '@/lib/domains';
import { CURRENT_SPECS } from '@/lib/currents/spec';
import { useCurrentProgress } from '@/lib/currents/progress';
import CurrentSigil from '@/components/currents/CurrentSigil';
import TodayBelief from '@/components/currents/TodayBelief';
import PatternMirror from '@/components/currents/PatternMirror';
import ResonanceLibrary from '@/components/currents/ResonanceLibrary';
import ResonanceCardExport from '@/components/currents/ResonanceCardExport';
import AmbientPlayer from '@/components/currents/AmbientPlayer';
import { useSubscription } from '@/hooks/useSubscription';
import { useAppState } from '@/lib/AppContext';

const STAGE_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: 'Seed', 2: 'Sprout', 3: 'Bloom', 4: 'Resonance',
};

export default function CurrentLayout() {
  const { slug } = useParams<{ slug: DomainKey }>();
  const navigate = useNavigate();
  const { isPremium, freeCurrent } = useSubscription();
  const { state } = useAppState();
  const localFree = state.onboarding.freeCurrent;

  if (!slug || !(slug in DOMAINS)) {
    return <NotASlug onBack={() => navigate('/currents')} />;
  }
  const domain = DOMAINS[slug];
  const spec = CURRENT_SPECS[slug];
  const { progress, stage, touch } = useCurrentProgress(slug);

  useEffect(() => { touch(); /* mark visit */ }, [touch]);

  const locked = !isPremium && slug !== 'money' && freeCurrent !== slug && localFree !== slug;
  if (locked) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-12 pb-10 space-y-6 safe-top text-center">
        <button onClick={() => navigate('/currents')} className="text-muted-foreground hover:text-foreground text-sm inline-flex items-center gap-1.5">
          <ArrowLeft size={16} /> Currents
        </button>
        <CurrentSigil base={spec.sigilBase} stage={1} size={140} glow={domain.glow} className="mx-auto opacity-70" />
        <h1 className="font-heading text-2xl text-foreground">{spec.shortName} Current</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">{spec.tagline}</p>
        <p className="text-xs text-muted-foreground/80 max-w-sm mx-auto leading-relaxed">
          This current opens with Pro. Free includes one full current of your choice plus Money.
        </p>
        <button onClick={() => navigate('/profile/subscription')} className="px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm">
          See Pro options
        </button>
      </div>
    );
  }

  const hasPracticed = progress.practicesCompleted > 0;
  const recentSequences = progress.sequencesCompleted.slice(-3).reverse();

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: `radial-gradient(circle, ${domain.glow}, transparent 70%)` }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pt-10 pb-12 space-y-8 safe-top">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/currents')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft size={16} strokeWidth={1.5} /> Currents
          </button>
          <AmbientPlayer slug={slug} compact />
        </div>

        {/* Hero */}
        <div className="text-center space-y-4">
          <p className="text-[10px] uppercase tracking-[0.28em] text-primary/70">{spec.shortName} Current</p>
          <CurrentSigil base={spec.sigilBase} stage={stage} size={180} glow={domain.glow} className="mx-auto" />
          <div className="space-y-2">
            <h1 className="font-heading text-3xl text-foreground tracking-tight">{spec.tagline}</h1>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
              Sigil \u00b7 {STAGE_LABEL[stage]} \u00b7 {progress.practicesCompleted} practice{progress.practicesCompleted === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed text-center max-w-md mx-auto italic">
          "{spec.heroFraming}"
        </p>

        {!hasPracticed && (
          <div className="soul-glass rounded-2xl p-5 border border-primary/15">
            <p className="text-xs uppercase tracking-[0.2em] text-primary/70 mb-2">A welcome</p>
            <p className="text-sm text-muted-foreground leading-relaxed italic">"{spec.emptyState}"</p>
          </div>
        )}

        <TodayBelief slug={slug} />

        {/* Guided Sequences */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg text-foreground tracking-tight">Guided Sequences</h2>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">{spec.sequences.length}</span>
          </div>
          <div className="space-y-2">
            {spec.sequences.map((seq) => {
              const completed = progress.sequencesCompleted.includes(seq.id);
              return (
                <motion.button
                  key={seq.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/currents/${slug}/sequence/${seq.id}`)}
                  className="soul-glass-elevated w-full text-left p-4 rounded-2xl hover:bg-muted/10 transition-colors flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-base text-foreground tracking-tight truncate">{seq.title}</h3>
                      {completed && <span className="text-[9px] uppercase tracking-[0.18em] text-emerald-400/80">Done</span>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">{seq.description}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">~{seq.estimatedMinutes} min</p>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground/30 shrink-0" />
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Belief Library entry */}
        <section className="space-y-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/currents/${slug}/beliefs`)}
            className="soul-glass-elevated w-full text-left p-4 rounded-2xl hover:bg-muted/10 transition-colors flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center shrink-0">
              <BookOpen size={16} className={domain.accentClass} />
            </div>
            <div className="flex-1 space-y-0.5">
              <h3 className="font-heading text-base text-foreground tracking-tight">Belief Library</h3>
              <p className="text-xs text-muted-foreground leading-snug">
                {spec.beliefs.length} starter beliefs \u00b7 {progress.beliefsLandedAsTrue.length + progress.beliefsLandedAsAlive.length} landed
              </p>
            </div>
            <ChevronRight size={14} className="text-muted-foreground/30 shrink-0" />
          </motion.button>
        </section>

        {/* Tuned Guide entry */}
        <section className="space-y-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/guide?current=${slug}`)}
            className="soul-glass-elevated w-full text-left p-4 rounded-2xl hover:bg-muted/10 transition-colors flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 soul-glow-gold">
              <MessageCircle size={16} className="text-primary" />
            </div>
            <div className="flex-1 space-y-0.5">
              <h3 className="font-heading text-base text-foreground tracking-tight">Talk to the {spec.shortName} Guide</h3>
              <p className="text-xs text-muted-foreground leading-snug">A companion tuned to this current's voice.</p>
            </div>
            <ChevronRight size={14} className="text-muted-foreground/30 shrink-0" />
          </motion.button>
        </section>

        {/* Tools from the existing hub */}
        <section className="space-y-3">
          <h2 className="font-heading text-lg text-foreground tracking-tight">Practice Tools</h2>
          <button
            onClick={() => navigate(domain.route)}
            className="soul-glass w-full text-left p-4 rounded-2xl hover:bg-muted/10 transition-colors flex items-center gap-3"
          >
            <div className="flex-1">
              <p className="text-sm text-foreground">Open the full {spec.shortName} toolkit</p>
              <p className="text-xs text-muted-foreground">State check, scripting, gather flow, resistance, openings & evidence.</p>
            </div>
            <ChevronRight size={14} className="text-muted-foreground/30 shrink-0" />
          </button>
        </section>

        <PatternMirror slug={slug} />

        <ResonanceLibrary slug={slug} />

        <div className="flex justify-center pt-2">
          <ResonanceCardExport slug={slug} />
        </div>

        {/* Recent work */}
        {recentSequences.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-heading text-lg text-foreground tracking-tight">Recent Work</h2>
            <div className="space-y-2">
              {recentSequences.map((id) => {
                const seq = spec.sequences.find((s) => s.id === id);
                if (!seq) return null;
                return (
                  <div key={id} className="text-xs text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    {seq.title}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function NotASlug({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-lg p-6 text-center space-y-4">
      <p className="text-sm text-muted-foreground">That current doesn\u2019t exist.</p>
      <button onClick={onBack} className="text-sm text-primary">Return to Currents</button>
    </div>
  );
}
