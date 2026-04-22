import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, Receipt, Target, Sparkles, ChevronRight,
  BookOpen, Timer, Bot, Library, Feather, Leaf, ShieldCheck,
} from 'lucide-react';
import { useAppState } from '@/lib/AppContext';
import type { EmotionalState } from '@/lib/types';

type MoneyTool = { icon: typeof Heart; title: string; description: string; to: string };

const stateCopy: Partial<Record<EmotionalState, { label: string; line: string; cta: string; meta: string; to: string }>> = {
  raw: { label: 'raw', line: 'You named something tender recently. The softest next step is letting the body stop bracing.', cta: 'Soften this', meta: 'Money Resistance Release · 5 min', to: '/money/resistance' },
  tense: { label: 'tight', line: 'You feel tight around money right now. No new belief is needed before one breath of room.', cta: 'Start with the body', meta: 'Money State · 2 min', to: '/money/state' },
  discouraged: { label: 'burdened', line: 'You named heaviness recently. Begin where the weight is, not where you think you should be.', cta: 'Let one layer loosen', meta: 'Resistance Release · 5 min', to: '/money/resistance' },
  scattered: { label: 'scattered', line: 'Your attention is moving in several directions. One small sequence can gather it back.', cta: 'Gather one current', meta: 'Money Gather Flow · 4 min', to: '/money/gather' },
  flat: { label: 'flat', line: 'Nothing has to feel inspiring yet. A believable sentence is enough contact for today.', cta: 'Find one true line', meta: 'Money Affirmations · 3 min', to: '/money/affirmations' },
  neutral: { label: 'neutral', line: 'Neutral is workable. Let this be a place to notice what wants a little more room.', cta: 'Name the opening', meta: 'Money Openings · 4 min', to: '/money/openings' },
  open: { label: 'open', line: 'There is a little room here. Practice receiving without turning it into pressure.', cta: 'Write the scene', meta: 'Reality Scripting · 7 min', to: '/money/script' },
  hopeful: { label: 'hopeful', line: 'Hope is present. Keep it grounded enough that your body can stay with it.', cta: 'Build evidence', meta: 'Evidence of Support · 3 min', to: '/money/evidence' },
  steady: { label: 'steady', line: 'Steadiness is already a form of support. Let one payment become part of circulation.', cta: 'Shift a payment', meta: 'Payment Shift · 3 min', to: '/money/payment-shift' },
  flowing: { label: 'flowing', line: 'Flowing does not need escalation. Let this rhythm become normal and quietly repeatable.', cta: 'Tend the rhythm', meta: 'Wealth Rhythm · 5 min', to: '/money/wealth-rhythm' },
};

const sections: { title: string; time: string; tools: MoneyTool[]; deep?: boolean }[] = [
  {
    title: 'Quick returns',
    time: '1–3 min',
    tools: [
      { icon: Heart, title: 'Money State', description: 'Notice the current texture.', to: '/money/state' },
      { icon: Timer, title: 'Affirmations', description: 'One believable line.', to: '/money/affirmations' },
      { icon: Receipt, title: 'Payment Shift', description: 'Let one payment soften.', to: '/money/payment-shift' },
      { icon: Sparkles, title: 'Evidence', description: 'Track support already here.', to: '/money/evidence' },
    ],
  },
  {
    title: 'Ritual work',
    time: '4–7 min',
    tools: [
      { icon: ShieldCheck, title: 'Resistance Release', description: 'Name, feel, and soften tension.', to: '/money/resistance' },
      { icon: BookOpen, title: 'Gather Flow', description: 'Build a sequence to return to.', to: '/money/gather' },
      { icon: Feather, title: 'Reality Scripting', description: 'Write what your body can believe.', to: '/money/script' },
      { icon: Receipt, title: 'Current Deposit', description: 'Welcome without gripping.', to: '/money/deposit' },
    ],
  },
  {
    title: 'Deeper support',
    time: 'when you have room',
    deep: true,
    tools: [
      { icon: Bot, title: 'Affirmation Coach', description: 'Ask for quieter language that meets your state.', to: '/money/coach' },
      { icon: Target, title: 'Money Openings', description: 'Clarify the desire that still feels alive.', to: '/money/openings' },
      { icon: Library, title: 'Library', description: 'Revisit the words that stayed.', to: '/money/library' },
      { icon: Leaf, title: 'Wealth Rhythm', description: 'Tend return without streak pressure.', to: '/money/wealth-rhythm' },
    ],
  },
];

export default function MoneyCurrent() {
  const navigate = useNavigate();
  const { state } = useAppState();
  const latestState = state.checkIns[0]?.state;
  const recommendation = useMemo(
    () => (latestState && stateCopy[latestState]) || { label: 'steady', line: 'Start with the smallest honest place. Money can be tended without forcing a better mood.', cta: 'Begin softly', meta: 'Money State · 2 min', to: '/money/state' },
    [latestState]
  );

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.08), hsl(var(--soul-green) / 0.04), transparent 70%)' }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-7 safe-top">
        <div className="flex items-start justify-between gap-4">
          <button onClick={() => navigate('/currents')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} strokeWidth={1.5} />
            <span className="text-sm">Currents</span>
          </button>
          <button onClick={() => navigate('/money/state')} className="group relative grid h-9 w-9 place-items-center rounded-full bg-[radial-gradient(circle_at_50%_50%,hsl(var(--muted)),hsl(var(--card))_60%,hsl(var(--background))_100%)] shadow-[0_0_18px_hsl(var(--primary)/0.18)]" aria-label="Update money state">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
            <span className="absolute -bottom-4 right-0 font-heading text-[10px] italic text-muted-foreground/60">{recommendation.label}</span>
          </button>
        </div>

        <div className="text-center space-y-3 pt-2">
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center border border-primary/15 bg-primary/10">
            <Receipt size={24} className="text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Money Current</h1>
          <p className="font-heading italic text-base text-muted-foreground max-w-[300px] mx-auto leading-relaxed">
            Receive freely. Release resistance. Build flow.
          </p>
        </div>

        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[1.125rem] border border-primary/20 bg-primary/10 p-5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/15 blur-2xl" />
          <div className="relative space-y-4">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-primary/80"><span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />For where you are</p>
            <p className="font-heading text-lg italic leading-relaxed text-foreground">{recommendation.line}</p>
            <button onClick={() => navigate(recommendation.to)} className="group flex w-full items-center justify-between rounded-xl border border-border/30 bg-background/35 px-4 py-3.5 text-left transition-colors hover:bg-background/50">
              <span>
                <span className="block font-heading text-lg font-medium text-foreground">{recommendation.cta}</span>
                <span className="mt-0.5 block text-[11px] tracking-wide text-muted-foreground/60">{recommendation.meta}</span>
              </span>
              <ChevronRight size={16} className="text-primary transition-transform group-hover:translate-x-0.5" />
            </button>
            <button onClick={() => document.getElementById('money-tools')?.scrollIntoView({ behavior: 'smooth' })} className="mx-auto block text-xs text-muted-foreground/60 underline underline-offset-4">Or pick something else below</button>
          </div>
        </motion.section>

        <div id="money-tools" className="space-y-7 scroll-mt-6">
          {sections.map((section, sectionIndex) => (
            <section key={section.title} className="space-y-3">
              <div className="flex items-baseline justify-between px-1">
                <h2 className="font-heading text-lg italic font-medium text-foreground">{section.title}</h2>
                <p className="text-[11px] lowercase tracking-wide text-muted-foreground/60">{section.time}</p>
              </div>

              <div className={section.deep ? 'grid gap-2.5' : 'grid grid-cols-2 gap-2.5'}>
                {section.tools.map(({ icon: Icon, title, description, to }, i) => (
                  <motion.button
                    key={title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sectionIndex * 0.08 + i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => navigate(to)}
                    className={`soul-glass group text-left transition-all duration-200 hover:bg-muted/10 active:scale-[0.98] ${section.deep ? 'flex min-h-[76px] items-center gap-3 rounded-2xl p-4' : 'min-h-[104px] rounded-2xl p-4'}`}
                  >
                    <Icon size={section.deep ? 22 : 20} className="mb-2 text-primary" strokeWidth={1.5} />
                    <div className="flex-1 space-y-1">
                      <h3 className="font-heading text-base font-medium leading-tight text-foreground">{title}</h3>
                      <p className="text-xs leading-relaxed text-muted-foreground/70">{description}</p>
                    </div>
                    {section.deep && <ChevronRight size={15} className="text-primary/60" />}
                  </motion.button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}