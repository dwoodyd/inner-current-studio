import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Scan, BrainCircuit, Layers, Sparkles, Repeat, Mountain, Package, HelpCircle } from 'lucide-react';

const modules = [
  { icon: Eye, title: 'Present Moment Interrupt', desc: 'Stop fusing with the thought stream.', to: '/reset/quiet/present', color: 'text-soul-blue' },
  { icon: Scan, title: 'Resistance Scan', desc: 'Identify what type of resistance is active.', to: '/reset/quiet/scan', color: 'text-soul-violet' },
  { icon: BrainCircuit, title: 'Analytical Mind Off-Ramp', desc: 'Stop solving your state with more thinking.', to: '/reset/quiet/offramp', color: 'text-soul-warm' },
  { icon: Layers, title: 'Thought Shift Ladder', desc: 'Take one thought from tight to softer.', to: '/reset/quiet/shift', color: 'text-soul-gold' },
  { icon: Sparkles, title: 'Mental Chatter to Clarity', desc: 'A 2-minute flow for when your mind is loud.', to: '/reset/quiet/clarity', color: 'text-soul-green' },
  { icon: Repeat, title: 'Pattern Softener', desc: 'See and soften repeated thought loops.', to: '/reset/quiet/patterns', color: 'text-soul-violet' },
  { icon: Mountain, title: 'Higher View', desc: 'Perspective-shift prompts.', to: '/reset/quiet/higher', color: 'text-soul-blue' },
  { icon: Package, title: 'Situation Packs', desc: 'Guided support for common resistance themes.', to: '/reset/quiet/situations', color: 'text-soul-warm' },
  { icon: HelpCircle, title: 'Nothing Is Working', desc: 'Supportive troubleshooting when you feel stuck.', to: '/reset/quiet/support', color: 'text-soul-dim' },
];

export default function QuietMind() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-lg px-5 pt-8 pb-8 space-y-7 soul-ambient-violet">
      <button onClick={() => navigate('/reset')} className="flex items-center gap-1.5 text-muted-foreground text-sm active:scale-95 transition-transform">
        <ArrowLeft size={16} /> Reset
      </button>

      <div className="text-center space-y-3">
        <motion.div
          className="w-14 h-14 rounded-full mx-auto flex items-center justify-center soul-glass-elevated"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <BrainCircuit size={20} className="text-soul-violet" strokeWidth={1.5} />
        </motion.div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Quiet the Mind</h1>
        <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">Tools for mental noise, thought loops, and inner overactivity.</p>
      </div>

      <div className="space-y-2.5">
        {modules.map(({ icon: Icon, title, desc, to, color }, i) => (
          <motion.button
            key={title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => navigate(to)}
            className="soul-glass-elevated w-full text-left flex items-start gap-4 p-4 rounded-2xl hover:bg-muted/10 active:scale-[0.98] transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
              <Icon size={17} className={color} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-sm font-medium tracking-tight">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
