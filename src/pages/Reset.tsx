import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart3, RefreshCw, Timer } from 'lucide-react';

const tools = [
  {
    icon: BarChart3,
    title: 'State Ladder',
    description: 'Identify your current emotional state and the next reachable one.',
    to: '/reset/ladder',
    color: 'text-soul-violet',
  },
  {
    icon: RefreshCw,
    title: 'Contrast Reset',
    description: 'Fast, frictionless emotional redirection.',
    to: '/reset/contrast',
    color: 'text-soul-blue',
  },
  {
    icon: Timer,
    title: 'Stillness Timer',
    description: 'Simple premium breathing and stillness ritual.',
    to: '/reset/stillness',
    color: 'text-soul-warm',
  },
];

export default function Reset() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-lg px-4 pt-12 pb-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Reset</h1>
        <p className="text-sm text-muted-foreground">Fast emotional reset and self-location</p>
      </div>

      <div className="space-y-3">
        {tools.map(({ icon: Icon, title, description, to, color }, i) => (
          <motion.button
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => navigate(to)}
            className="soul-card w-full text-left flex items-start gap-4 transition-colors hover:bg-muted/20 active:scale-[0.98]"
          >
            <div className={`mt-0.5 ${color}`}>
              <Icon size={22} strokeWidth={1.5} />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-heading text-base font-medium text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
