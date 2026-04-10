import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart3, RefreshCw, Timer, Shield, BrainCircuit, ChevronRight } from 'lucide-react';

const tools = [
  { icon: BarChart3, title: 'State Ladder', description: 'Identify your current emotional state and the next reachable one.', to: '/reset/ladder', color: 'text-soul-violet' },
  { icon: RefreshCw, title: 'Contrast Reset', description: 'Fast, frictionless emotional redirection.', to: '/reset/contrast', color: 'text-soul-blue' },
  { icon: Shield, title: 'Resistance Release', description: 'Identify, soften, and clear resistance without forcing positivity.', to: '/reset/resistance', color: 'text-soul-gold' },
  { icon: BrainCircuit, title: 'Quiet the Mind', description: 'Tools for mental noise, thought loops, and inner overactivity.', to: '/reset/quiet', color: 'text-soul-green' },
  { icon: Timer, title: 'Stillness Timer', description: 'Simple premium breathing and stillness ritual.', to: '/reset/stillness', color: 'text-soul-warm' },
];

export default function Reset() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-lg px-4 pt-12 pb-8 space-y-7 safe-top">
      <div className="text-center space-y-3">
        <motion.div
          className="w-14 h-14 rounded-full mx-auto flex items-center justify-center soul-glass-elevated"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <RefreshCw size={20} className="text-soul-blue" strokeWidth={1.5} />
        </motion.div>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Reset</h1>
        <p className="text-sm text-muted-foreground max-w-[260px] mx-auto">Locate, interrupt, soften, and clear resistance.</p>
      </div>

      <div className="space-y-3">
        {tools.map(({ icon: Icon, title, description, to, color }, i) => (
          <motion.button
            key={title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => navigate(to)}
            className="soul-glass-elevated w-full text-left flex items-center gap-4 p-4 sm:p-5 rounded-2xl hover:bg-muted/10 active:scale-[0.98] transition-all duration-200 min-h-[64px] group"
          >
            <div className="w-11 h-11 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
              <Icon size={20} className={color} strokeWidth={1.5} />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-heading text-base font-medium text-foreground tracking-tight">{title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground/60 transition-colors duration-150" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
