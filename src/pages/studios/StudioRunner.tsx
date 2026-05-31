// StudioRunner — walks the user through each step of a studio arc,
// reusing the per-current GuidedSequenceRunner. Tracks progress in
// localStorage so users can resume mid-studio.
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, Sparkles } from 'lucide-react';
import { findStudio } from '@/lib/studios/studios';
import { findSequence } from '@/lib/currents/spec';
import { DOMAINS } from '@/lib/domains';
import { recordPracticeFor } from '@/lib/currents/progress';

const KEY = (id: string) => `iw.studioProgress.${id}`;

type StudioState = { completedSteps: string[]; lastStep: number };

function readState(id: string): StudioState {
  try {
    const raw = localStorage.getItem(KEY(id));
    if (!raw) return { completedSteps: [], lastStep: 0 };
    return JSON.parse(raw);
  } catch { return { completedSteps: [], lastStep: 0 }; }
}
function writeState(id: string, s: StudioState) {
  try { localStorage.setItem(KEY(id), JSON.stringify(s)); } catch {}
}

export default function StudioRunner() {
  const { studioId } = useParams<{ studioId: string }>();
  const navigate = useNavigate();
  const studio = studioId ? findStudio(studioId) : undefined;
  const [state, setState] = useState<StudioState>(() => studioId ? readState(studioId) : { completedSteps: [], lastStep: 0 });
  const [showClosing, setShowClosing] = useState(false);

  useEffect(() => { if (studioId) setState(readState(studioId)); }, [studioId]);

  const steps = studio?.steps ?? [];
  const allDone = useMemo(() => steps.length > 0 && state.completedSteps.length >= steps.length, [steps.length, state.completedSteps.length]);

  if (!studio) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center space-y-4">
        <p className="text-sm text-muted-foreground">That studio doesn't exist.</p>
        <button onClick={() => navigate('/studios')} className="text-sm text-primary">Back to Studios</button>
      </div>
    );
  }

  function markComplete(idx: number) {
    const step = steps[idx];
    const key = `${step.slug}:${step.sequenceId}`;
    const next: StudioState = {
      completedSteps: state.completedSteps.includes(key) ? state.completedSteps : [...state.completedSteps, key],
      lastStep: Math.max(state.lastStep, idx + 1),
    };
    setState(next);
    if (studioId) writeState(studioId, next);
    recordPracticeFor(step.slug);
    if (next.completedSteps.length >= steps.length) setShowClosing(true);
  }

  function reset() {
    if (!studioId) return;
    const empty: StudioState = { completedSteps: [], lastStep: 0 };
    writeState(studioId, empty);
    setState(empty);
    setShowClosing(false);
  }

  return (
    <div className="relative mx-auto max-w-lg px-4 pt-10 pb-12 space-y-7 safe-top">
      <button onClick={() => navigate('/studios')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft size={16} strokeWidth={1.5} /> Studios
      </button>

      <div className="text-center space-y-3">
        <p className="text-[10px] uppercase tracking-[0.28em] text-primary/70">Studio</p>
        <h1 className="font-heading text-3xl text-foreground tracking-tight">{studio.title}</h1>
        <p className="text-sm text-primary/70 italic">{studio.subtitle}</p>
        <p className="text-xs text-muted-foreground/70 leading-relaxed max-w-sm mx-auto">{studio.longDescription}</p>
      </div>

      <div className="soul-glass rounded-2xl p-3 border border-border/20">
        <div className="flex items-center gap-2">
          {steps.map((_, i) => {
            const done = state.completedSteps.length > i;
            return (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${done ? 'bg-primary' : 'bg-muted/40'}`} />
            );
          })}
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 mt-2 text-center">
          {state.completedSteps.length} / {steps.length} complete
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => {
          const key = `${step.slug}:${step.sequenceId}`;
          const done = state.completedSteps.includes(key);
          const isCurrent = !done && i === state.completedSteps.length;
          const seq = findSequence(step.slug, step.sequenceId);
          const d = DOMAINS[step.slug];
          return (
            <div
              key={key}
              className={`soul-glass-elevated rounded-2xl p-4 border ${
                isCurrent ? 'border-primary/30' : 'border-border/15'
              } ${done ? 'opacity-70' : ''} space-y-3`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `radial-gradient(circle, ${d.glow}, transparent 70%)` }}
                >
                  {done ? <Check size={14} className="text-primary" /> : <span className="text-base">{i + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading text-base text-foreground tracking-tight">{seq?.title ?? step.sequenceId}</h3>
                    <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/60">{d.label}</span>
                  </div>
                  <p className="text-xs text-primary/70 italic mt-0.5">{step.framing}</p>
                  {seq && <p className="text-xs text-muted-foreground mt-1 leading-snug">{seq.description}</p>}
                </div>
              </div>
              {isCurrent && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/currents/${step.slug}/sequence/${step.sequenceId}`, { state: { fromStudio: studio.id } })}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-xs uppercase tracking-[0.18em] hover:opacity-90 transition-opacity"
                  >
                    <Sparkles size={12} /> Begin
                  </button>
                  <button
                    onClick={() => markComplete(i)}
                    className="px-4 py-2.5 rounded-full text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
                  >
                    Mark done
                  </button>
                </div>
              )}
              {!isCurrent && !done && (
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 text-center">
                  Locked until previous step
                </p>
              )}
            </div>
          );
        })}
      </div>

      {state.completedSteps.length > 0 && !allDone && (
        <button onClick={reset} className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-foreground mx-auto block">
          Reset studio
        </button>
      )}

      <AnimatePresence>
        {showClosing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-md p-6"
            onClick={() => { setShowClosing(false); navigate('/studios'); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-sm w-full soul-glass-elevated rounded-3xl p-7 text-center space-y-5 border border-primary/20"
            >
              <div className="inline-flex items-center gap-2 text-primary">
                <Sparkles size={14} />
                <span className="text-[10px] uppercase tracking-[0.32em]">Studio complete</span>
                <Sparkles size={14} />
              </div>
              <h2 className="font-heading text-2xl text-foreground tracking-tight">{studio.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed italic">"{studio.closingReflection}"</p>
              <button
                onClick={() => { setShowClosing(false); navigate('/studios'); }}
                className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs uppercase tracking-[0.18em]"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
