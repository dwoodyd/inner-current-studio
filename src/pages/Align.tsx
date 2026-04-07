import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, Play, Target } from 'lucide-react';

const modules = [
  {
    icon: Compass,
    title: 'Alignment Wheel',
    description: 'A guided thought-shift ritual from resistance toward resonance.',
    color: 'text-soul-gold',
    premium: true,
  },
  {
    icon: Sparkles,
    title: 'Relief Wheel',
    description: 'A gentler version for low-capacity moments.',
    color: 'text-soul-violet',
    premium: true,
  },
  {
    icon: Play,
    title: 'Gather Flow',
    description: 'Build and play sequences of supportive, believable thoughts.',
    color: 'text-soul-green',
    premium: true,
  },
  {
    icon: Target,
    title: 'Momentum Ring',
    description: 'A timed state-holding ritual to lock in your shift.',
    color: 'text-soul-blue',
    premium: true,
  },
];

export default function Align() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-lg px-4 pt-12 pb-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Align</h1>
        <p className="text-sm text-muted-foreground">Core rituals for shifting your state</p>
      </div>

      <div className="space-y-3">
        {modules.map(({ icon: Icon, title, description, color, premium }, i) => (
          <motion.button
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="soul-card w-full text-left flex items-start gap-4 transition-colors hover:bg-muted/20 active:scale-[0.98]"
          >
            <div className={`mt-0.5 ${color}`}>
              <Icon size={22} strokeWidth={1.5} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base font-medium text-foreground">{title}</h3>
                {premium && (
                  <span className="text-[9px] uppercase tracking-wider text-primary/60 bg-primary/10 px-1.5 py-0.5 rounded-full">
                    Premium
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="text-center pt-4">
        <p className="text-xs text-muted-foreground/60 font-heading italic">
          "Momentum begins with one believable sentence."
        </p>
      </div>
    </div>
  );
}
