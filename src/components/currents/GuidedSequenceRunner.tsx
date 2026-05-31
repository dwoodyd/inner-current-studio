// Guided Sequence Runner — steps the user through a sequence's steps
// (breath / state-check / reflection / current-guide-message / belief-shift /
// stillness / sigil-touch / declarative-read). Records completion to the
// Current's progress, which drives Sigil evolution.

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { DOMAINS, type DomainKey } from '@/lib/domains';
import { CURRENT_SPECS, findSequence, findBelief, type SequenceStep } from '@/lib/currents/spec';
import { useCurrentProgress } from '@/lib/currents/progress';
import CurrentSigil from '@/components/currents/CurrentSigil';

export default function GuidedSequenceRunner() {
  const { slug, sequenceId } = useParams<{ slug: DomainKey; sequenceId: string }>();
  const navigate = useNavigate();
  const domain = slug ? DOMAINS[slug] : undefined;
  const spec = slug ? CURRENT_SPECS[slug] : undefined;
  const sequence = slug && sequenceId ? findSequence(slug, sequenceId) : undefined;
  const { stage, recordSequence } = useCurrentProgress(slug || 'self');

  const [idx, setIdx] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [idx]);

  if (!domain || !spec || !sequence) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <p className="text-sm text-muted-foreground">That sequence isn't available.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-primary">Go back</button>
      </div>
    );
  }

  const step = sequence.steps[idx];
  const last = idx === sequence.steps.length - 1;
  const finished = idx >= sequence.steps.length;

  const next = () => {
    if (last) {
      recordSequence(sequence.id);
      toast('Practice complete.', { description: `${sequence.title} — added to your ${spec.shortName} current.` });
      setIdx((i) => i + 1);
    } else {
      setIdx((i) => i + 1);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-10 pb-12 safe-top space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(`/currents/${slug}`)} className="text-muted-foreground hover:text-foreground text-sm inline-flex items-center gap-1.5">
          <ArrowLeft size={16} /> {spec.shortName}
        </button>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
          {Math.min(idx + 1, sequence.steps.length)} / {sequence.steps.length}
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="font-heading text-2xl text-foreground tracking-tight">{sequence.title}</h1>
        <p className="text-xs text-muted-foreground">{sequence.description}</p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

      <AnimatePresence mode="wait">
        {finished ? (
          <motion.div key="done" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center py-6">
            <CurrentSigil base={spec.sigilBase} stage={stage} size={180} glow={domain.glow} className="mx-auto" />
            <div className="space-y-2">
              <p className="font-heading text-xl text-foreground">That's the practice.</p>
              <p className="text-sm text-muted-foreground max-w-[300px] mx-auto leading-relaxed">
                Your {spec.shortName} sigil holds a little more of you now.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button onClick={() => navigate(`/currents/${slug}`)} className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm">Return to {spec.shortName}</button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`step-${idx}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
          >
            <StepView step={step} value={responses[idx] || ''} onChange={(v) => setResponses((r) => ({ ...r, [idx]: v }))} domain={domain} spec={spec} stage={stage} />
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                disabled={idx === 0}
                className="text-sm text-muted-foreground disabled:opacity-30 inline-flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={next}
                className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm inline-flex items-center gap-1.5"
              >
                {last ? (<>Complete <Check size={14} /></>) : (<>Continue <ArrowRight size={14} /></>)}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepView({ step, value, onChange, domain, spec, stage }: {
  step: SequenceStep;
  value: string;
  onChange: (v: string) => void;
  domain: typeof DOMAINS[DomainKey];
  spec: typeof CURRENT_SPECS[DomainKey];
  stage: 1 | 2 | 3 | 4;
}) {
  switch (step.type) {
    case 'breath': return <BreathStep step={step} />;
    case 'state-check': return <StateCheckStep step={step} domain={domain as any} />;
    case 'reflection': return <ReflectionStep step={step} value={value} onChange={onChange} />;
    case 'current-guide-message': return <GuideStep message={step.message} />;
    case 'belief-shift': return <BeliefStep beliefId={step.beliefId} slug={(spec as any).slug} />;
    case 'stillness': return <StillnessStep step={step} />;
    case 'sigil-touch': return <SigilStep spec={spec as any} stage={stage} domain={domain as any} label={step.label} />;
    case 'declarative-read': return <DeclarativeStep lines={step.lines} />;
  }
}

// ───── Individual step views ─────

function BreathStep({ step }: { step: Extract<SequenceStep, { type: 'breath' }> }) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out' | 'pause'>('in');
  const [cycle, setCycle] = useState(0);
  const config = useMemo(() => {
    switch (step.pattern) {
      case 'box': return { in: 4000, hold: 4000, out: 4000, pause: 4000 };
      case 'long-exhale': return { in: 4000, hold: 0, out: 7000, pause: 0 };
      case 'sigh': return { in: 2000, hold: 200, out: 6000, pause: 0 };
      case 'ignite': return { in: 1200, hold: 800, out: 5000, pause: 0 };
    }
  }, [step.pattern]);

  useEffect(() => {
    if (cycle >= step.cycles) return;
    const order: typeof phase[] = config.hold > 0 ? (config.pause > 0 ? ['in','hold','out','pause'] : ['in','hold','out']) : ['in','out'];
    const i = order.indexOf(phase);
    const ms = config[phase];
    if (ms <= 0) {
      const nxt = order[(i + 1) % order.length];
      if (nxt === 'in') setCycle((c) => c + 1);
      setPhase(nxt);
      return;
    }
    const t = setTimeout(() => {
      const nxt = order[(i + 1) % order.length];
      if (nxt === 'in') setCycle((c) => c + 1);
      setPhase(nxt);
    }, ms);
    return () => clearTimeout(t);
  }, [phase, cycle, config, step.cycles]);

  const scale = phase === 'in' ? 1 : phase === 'hold' ? 1 : phase === 'out' ? 0.6 : 0.6;
  const label = phase === 'in' ? 'Breathe in' : phase === 'hold' ? 'Hold' : phase === 'out' ? 'Breathe out' : 'Pause';
  const ms = config[phase] || 1000;

  return (
    <div className="text-center space-y-6 py-4">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground/70">{step.label || step.pattern.replace('-', ' ')}</p>
      <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
        <motion.div
          animate={{ scale }}
          transition={{ duration: ms / 1000, ease: 'easeInOut' }}
          className="w-40 h-40 rounded-full bg-primary/15 border border-primary/30"
        />
        <p className="absolute inset-0 flex items-center justify-center font-heading text-base text-foreground">{label}</p>
      </div>
      <p className="text-xs text-muted-foreground">Cycle {Math.min(cycle + 1, step.cycles)} of {step.cycles}</p>
    </div>
  );
}

function StateCheckStep({ step, domain }: { step: Extract<SequenceStep, { type: 'state-check' }>; domain: any }) {
  const [picked, setPicked] = useState<string | null>(null);
  const states = domain.states?.length ? domain.states : [
    { value: 'tight', label: 'Tight', emoji: '🌧️' },
    { value: 'restless', label: 'Restless', emoji: '🌀' },
    { value: 'flat', label: 'Flat', emoji: '🌫️' },
    { value: 'open', label: 'Open', emoji: '🌤️' },
    { value: 'flowing', label: 'Flowing', emoji: '🌊' },
  ];
  return (
    <div className="space-y-4">
      <p className="text-base text-foreground leading-relaxed">{step.prompt || 'How is it right now?'}</p>
      <div className="grid grid-cols-3 gap-2">
        {states.map((s: any) => (
          <button
            key={s.value}
            onClick={() => setPicked(s.value)}
            className={`soul-glass rounded-xl p-3 text-center transition-all ${picked === s.value ? 'ring-2 ring-primary/60' : 'hover:bg-muted/15'}`}
          >
            <div className="text-2xl">{s.emoji}</div>
            <div className="text-[11px] text-foreground/80 mt-1">{s.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ReflectionStep({ step, value, onChange }: { step: Extract<SequenceStep, { type: 'reflection' }>; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-base text-foreground leading-relaxed">{step.prompt}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder="Write what comes…"
        className="w-full rounded-xl bg-muted/15 border border-border/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40 leading-relaxed"
      />
      {step.minChars && value.length < step.minChars && (
        <p className="text-[10px] text-muted-foreground/60">{step.minChars - value.length} more characters to continue.</p>
      )}
    </div>
  );
}

function GuideStep({ message }: { message: string }) {
  return (
    <div className="space-y-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.2em] text-primary/80">Current Guide</p>
      <p className="font-heading text-xl text-foreground leading-relaxed italic">"{message}"</p>
    </div>
  );
}

function BeliefStep({ beliefId, slug }: { beliefId: string; slug: DomainKey }) {
  const belief = findBelief(slug, beliefId);
  const { landBelief } = useCurrentProgress(slug);
  if (!belief) return <p className="text-sm text-muted-foreground">Belief unavailable.</p>;
  return (
    <div className="space-y-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">A belief to walk</p>
      <p className="text-base text-foreground/90 leading-relaxed">{belief.startingThought}</p>
      <div className="space-y-2 pl-3 border-l border-border/30">
        {belief.bridgeThoughts.map((b, i) => (
          <p key={i} className="text-sm text-muted-foreground italic leading-snug">{b}</p>
        ))}
      </div>
      <p className="font-heading text-lg text-foreground leading-relaxed">{belief.endingThought}</p>
      <div className="flex gap-2 pt-1">
        <button onClick={() => landBelief(beliefId, 'true')} className="text-xs px-3 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">Lands True</button>
        <button onClick={() => landBelief(beliefId, 'alive')} className="text-xs px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary">Lands Alive</button>
      </div>
    </div>
  );
}

function StillnessStep({ step }: { step: Extract<SequenceStep, { type: 'stillness' }> }) {
  const [remaining, setRemaining] = useState(step.seconds);
  useEffect(() => {
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearTimeout(t);
  }, [remaining]);
  return (
    <div className="text-center space-y-4 py-6">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{step.label || 'Stillness'}</p>
      <motion.div
        animate={{ scale: [1, 1.04, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="w-32 h-32 mx-auto rounded-full bg-primary/10 border border-primary/30"
      />
      <p className="font-heading text-3xl text-foreground tabular-nums">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</p>
    </div>
  );
}

function SigilStep({ spec, stage, domain, label }: { spec: any; stage: 1 | 2 | 3 | 4; domain: any; label?: string }) {
  return (
    <div className="text-center space-y-4 py-2">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{label || 'A breath with your sigil'}</p>
      <CurrentSigil base={spec.sigilBase} stage={stage} size={200} glow={domain.glow} className="mx-auto" />
    </div>
  );
}

function DeclarativeStep({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Read it. Aloud, or quietly.</p>
      {lines.map((l, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.4, duration: 0.6 }}
          className="font-heading text-lg text-foreground leading-relaxed"
        >
          {l}
        </motion.p>
      ))}
    </div>
  );
}
