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
    <div className="mx-auto max-w-lg px-4 pt-8 pb-6 space-y-6">
      <button onClick={() => navigate('/reset')} className="flex items-center gap-1.5 text-muted-foreground text-sm active:scale-95">
        <ArrowLeft size={16} /> Reset
      </button>
      <div className="text-center space-y-2">
        <h1 className="font-heading text-2xl font-semibold">Quiet the Mind</h1>
        <p className="text-sm text-muted-foreground">Tools for mental noise, thought loops, and inner overactivity.</p>
      </div>
      <div className="space-y-2.5">
        {modules.map(({ icon: Icon, title, desc, to, color }, i) => (
          <motion.button
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigate(to)}
            className="soul-card w-full text-left flex items-start gap-3.5 hover:bg-muted/20 active:scale-[0.98] transition-all"
          >
            <Icon size={20} className={`mt-0.5 ${color}`} strokeWidth={1.5} />
            <div className="flex-1">
              <h3 className="font-heading text-sm font-medium">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
