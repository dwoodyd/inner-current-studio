import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart3, RefreshCw, Timer, Shield, BrainCircuit, Wind, ChevronRight } from 'lucide-react';

const tools = [
  { icon: BarChart3, title: 'State Ladder', description: 'Identify your current emotional state and the next reachable one.', subtext: 'The question is not: how do I feel the right thing? It\'s: what\'s the next reachable state from here?', to: '/reset/ladder', color: 'text-soul-violet' },
  { icon: RefreshCw, title: 'Contrast Reset', description: 'Fast, frictionless emotional redirection.', subtext: 'Interrupt the drift before it becomes a departure.', to: '/reset/contrast', color: 'text-soul-blue' },
  { icon: Shield, title: 'Resistance Release', description: 'Identify, soften, and clear resistance without forcing positivity.', subtext: 'You cannot change a ground you won\'t acknowledge. Start here.', to: '/reset/resistance', color: 'text-soul-gold' },
  { icon: BrainCircuit, title: 'Quiet the Mind', description: 'Tools for mental noise, thought loops, and inner overactivity.', subtext: '', to: '/reset/quiet', color: 'text-soul-gold' },
  { icon: Timer, title: 'Stillness Timer', description: 'A simple breathing and stillness ritual.', subtext: 'Thirty seconds of genuine interior quiet creates a space between stimulus and response.', to: '/reset/stillness', color: 'text-soul-warm' },
  { icon: Wind, title: 'Breathwork', description: 'Guided breathing patterns with optional ambient soundscapes.', subtext: 'Breath connects the voluntary and involuntary. One deliberate exhale changes the inner posture.', to: '/reset/breathwork', color: 'text-primary' },
];

export default function Reset() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-lg px-4 pt-10 pb-10 space-y-6 safe-top sm:pt-12 sm:space-y-7">
      <div className="text-center space-y-3">
        <motion.div
          className="w-14 h-14 rounded-full mx-auto flex items-center justify-center soul-glass-elevated"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <RefreshCw size={20} className="text-soul-blue" strokeWidth={1.5} />
        </motion.div>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Reset</h1>
        <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">The tools for entering the state — before you speak, act, or ask.</p>
      </div>

      <div className="space-y-3">
        {tools.map(({ icon: Icon, title, description, subtext, to, color }, i) => (
          <motion.button
            key={title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => navigate(to)}
            className="group flex min-h-[60px] w-full items-center gap-3 rounded-2xl p-3.5 text-left transition-all duration-200 hover:bg-muted/10 active:scale-[0.98] soul-glass-elevated sm:min-h-[64px] sm:gap-4 sm:p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/30 sm:h-11 sm:w-11">
              <Icon size={20} className={color} strokeWidth={1.5} />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-heading text-base font-medium text-foreground tracking-tight">{title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>
              {subtext && (
                <p className="text-[11px] text-muted-foreground/55 italic font-heading leading-snug">{subtext}</p>
              )}
            </div>
            <ChevronRight size={16} className="text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground/60 transition-colors duration-150" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
