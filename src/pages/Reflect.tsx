import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Lightbulb, Droplets, Archive, ChevronRight } from 'lucide-react';

const items = [
  {
    icon: BookOpen,
    title: 'Future Pages',
    description: 'Guided reflective writing from a resonant self.',
    to: '/reflect/future-pages',
    accent: 'gold' as const,
  },
  {
    icon: Lightbulb,
    title: 'Imagine If',
    description: 'Open possibility rituals that feel playful and real.',
    to: '/reflect/imagine-if',
    accent: 'violet' as const,
  },
  {
    icon: Droplets,
    title: 'Overflow Practice',
    description: 'An original receiving and sufficiency ritual.',
    to: '/reflect/overflow',
    accent: 'blue' as const,
  },
  {
    icon: Archive,
    title: 'My Current',
    description: 'Your private archive of inner work.',
    to: '/reflect/archive',
    accent: 'warm' as const,
  },
];

const accentMap = {
  gold: { icon: 'text-primary', bg: 'hsl(42 65% 58% / 0.08)', border: 'hsl(42 65% 58% / 0.12)', glow: 'soul-ambient-gold' },
  violet: { icon: 'text-secondary', bg: 'hsl(265 25% 45% / 0.08)', border: 'hsl(265 25% 45% / 0.12)', glow: 'soul-ambient-violet' },
  blue: { icon: 'soul-text-dim', bg: 'hsl(210 40% 45% / 0.08)', border: 'hsl(210 40% 45% / 0.12)', glow: '' },
  warm: { icon: 'soul-text-warm', bg: 'hsl(30 30% 85% / 0.06)', border: 'hsl(30 30% 85% / 0.1)', glow: '' },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Reflect() {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(265 25% 45% / 0.05), transparent 70%)' }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-lg px-4 pt-12 pb-6 space-y-6 safe-top"
      >
        <motion.div variants={fadeUp} className="text-center space-y-2">
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground">Reflect</h1>
          <p className="text-sm text-muted-foreground font-heading italic">Longer-form reflective and imaginative space</p>
        </motion.div>

        <div className="space-y-3">
          {items.map(({ icon: Icon, title, description, to, accent }) => {
            const a = accentMap[accent];
            return (
              <motion.button
                key={title}
                variants={fadeUp}
                onClick={() => navigate(to)}
                className={`soul-glass-elevated w-full text-left flex items-center gap-4 rounded-2xl p-4 sm:p-5 transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98] min-h-[64px] group ${a.glow}`}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: a.bg, border: `1px solid ${a.border}` }}
                >
                  <Icon size={20} className={a.icon} strokeWidth={1.5} />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-heading text-base font-medium text-foreground">{title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground/60 transition-colors duration-150" />
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
