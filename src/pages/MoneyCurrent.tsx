import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, Receipt, Target, Sparkles, ChevronRight,
  BookOpen, Timer, Bot, Library, Feather, Leaf, ShieldCheck,
} from 'lucide-react';

const todayCard = {
  icon: Heart,
  eyebrow: 'Today in Money Current',
  title: 'Soften — 5 min',
  description: 'Start with the body before choosing another practice. Name what money is holding in you, then let one layer loosen.',
  to: '/money/resistance',
};

const sections = [
  {
    title: 'Quick',
    description: 'A small return when you only have a minute.',
    tools: [
      { icon: Heart, title: 'Money State', description: 'Notice how money feels right now.', to: '/money/state' },
      { icon: Timer, title: 'Money Affirmations', description: 'Absorb one believable receiving thought.', to: '/money/affirmations' },
      { icon: Receipt, title: 'Payment Shift', description: 'Turn one payment into supported circulation.', to: '/money/payment-shift' },
    ],
  },
  {
    title: 'Practice',
    description: 'Guided rituals for softening, gathering, and rehearsing safety.',
    tools: [
      { icon: BookOpen, title: 'Money Gather Flow', description: 'Build a supportive sequence you can return to.', to: '/money/gather' },
      { icon: ShieldCheck, title: 'Resistance Release', description: 'Name, feel, and soften money-specific tension.', to: '/money/resistance' },
      { icon: Feather, title: 'Reality Scripting', description: 'Write a grounded scene your body can believe.', to: '/money/script' },
      { icon: Receipt, title: 'Current Deposit', description: 'Create a ritual for what you are ready to welcome.', to: '/money/deposit' },
    ],
  },
  {
    title: 'Deep',
    description: 'Pattern work, evidence, and longer-form support.',
    tools: [
      { icon: Target, title: 'Money Openings', description: 'Clarify the desires that still feel alive.', to: '/money/openings' },
      { icon: Sparkles, title: 'Evidence of Support', description: 'Collect proof that support is already moving.', to: '/money/evidence' },
      { icon: Bot, title: 'Affirmation Coach', description: 'Ask for Inner Wake-style language and guidance.', to: '/money/coach' },
      { icon: Library, title: 'Affirmation Library', description: 'Revisit the words that stayed with you.', to: '/money/library' },
    ],
  },
];

export default function MoneyCurrent() {
  const navigate = useNavigate();
  const TodayIcon = todayCard.icon;

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
        <button onClick={() => navigate('/currents')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} strokeWidth={1.5} />
          <span className="text-sm">Currents</span>
        </button>

        <div className="text-center space-y-3">
          <motion.div
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--soul-green) / 0.1))' }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-2xl">💰</span>
          </motion.div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Money Current
          </h1>
          <p className="text-sm text-muted-foreground max-w-[300px] mx-auto leading-relaxed">
            A quieter relationship with receiving, spending, support, and enoughness.
          </p>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate(todayCard.to)}
          className="soul-glass-elevated w-full rounded-2xl p-5 text-left group active:scale-[0.98] transition-all duration-200"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
              <TodayIcon size={21} className="text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex-1 space-y-1.5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-primary/70">{todayCard.eyebrow}</p>
              <h2 className="font-heading text-xl font-medium text-foreground">{todayCard.title}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">{todayCard.description}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
          </div>
        </motion.button>

        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <section key={section.title} className="space-y-3">
              <div className="px-1">
                <div className="flex items-center gap-2">
                  <Leaf size={14} className="text-primary/70" />
                  <h2 className="font-heading text-lg font-medium text-foreground">{section.title}</h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{section.description}</p>
              </div>

              <div className="space-y-2.5">
                {section.tools.map(({ icon: Icon, title, description, to }, i) => (
                  <motion.button
                    key={title}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sectionIndex * 0.08 + i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => navigate(to)}
                    className="soul-glass w-full text-left flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/10 active:scale-[0.98] transition-all duration-200 min-h-[62px] group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-heading text-base font-medium text-foreground tracking-tight">{title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                    </div>
                    <ChevronRight size={15} className="text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground/60 transition-colors" />
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
