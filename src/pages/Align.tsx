import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, Play, Target, ChevronRight } from 'lucide-react';

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

const modules = [
  {
    icon: Compass,
    title: 'Alignment Wheel',
    description: 'A guided thought-shift ritual from resistance toward resonance.',
    gradient: 'from-soul-gold/15 to-soul-gold/5',
    iconColor: 'text-soul-gold',
    to: '/align/wheel',
  },
  {
    icon: Sparkles,
    title: 'Relief Wheel',
    description: 'A gentler version for low-capacity moments.',
    gradient: 'from-soul-violet/15 to-soul-violet/5',
    iconColor: 'text-soul-violet',
    to: '/align/relief',
  },
  {
    icon: Play,
    title: 'Gather Flow',
    description: 'Build and play sequences of supportive, believable thoughts.',
    gradient: 'from-soul-green/15 to-soul-green/5',
    iconColor: 'text-soul-green',
    to: '/align/gather',
  },
  {
    icon: Target,
    title: 'Momentum Ring',
    description: 'A timed state-holding ritual to lock in your shift.',
    gradient: 'from-soul-blue/15 to-soul-blue/5',
    iconColor: 'text-soul-blue',
    to: '/align/momentum',
  },
];

export default function Align() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-lg px-4 pt-12 pb-6 space-y-8 soul-ambient-gold overflow-hidden safe-top">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center space-y-3"
      >
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Align</h1>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Core rituals for shifting your state toward clarity and momentum
        </p>
      </motion.div>

      <motion.div className="space-y-3" variants={stagger} initial="initial" animate="animate">
        {modules.map(({ icon: Icon, title, description, gradient, iconColor, to }) => (
          <motion.button
            key={title}
            variants={fadeUp}
            onClick={() => navigate(to)}
            className="soul-glass-elevated w-full text-left flex items-center gap-4 p-4 sm:p-5 rounded-2xl transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98] group min-h-[64px]"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
              <Icon size={20} strokeWidth={1.5} className={iconColor} />
            </div>
            <div className="flex-1 space-y-1 min-w-0">
              <h3 className="font-heading text-base font-medium text-foreground">{title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground/60 transition-colors duration-150" />
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center pt-4"
      >
        <p className="text-xs text-muted-foreground/40 font-heading italic">
          "Momentum begins with one believable sentence."
        </p>
      </motion.div>
    </div>
  );
}
