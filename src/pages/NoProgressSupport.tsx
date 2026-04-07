import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';

const EXPLANATIONS = [
  { title: 'Jumping too far', desc: 'You may be trying to leap from heavy to joyful. Try one step instead of ten.', action: 'Try State Ladder', to: '/reset/ladder' },
  { title: 'Using thoughts that feel false', desc: 'Supportive thoughts only work when they feel at least possible. Forced ones create more resistance.', action: 'Try Relief Wheel', to: '/align/relief' },
  { title: 'Shifting mentally but not physically', desc: 'Your body is still holding it. Try a body-based approach first.', action: 'Try Resistance Release', to: '/reset/resistance' },
  { title: 'Over-practicing from urgency', desc: 'You might be using rituals to fix instead of soften. Less force, more repetition.', action: 'Try Stillness Timer', to: '/reset/stillness' },
  { title: 'Needing repetition, not intensity', desc: 'One gentle return each day does more than one intense session per week.', action: 'Try Momentum Ring', to: '/align/momentum' },
  { title: 'Needing a shorter ritual', desc: 'Your capacity might be low right now. That\'s not failure. It\'s information.', action: 'Try Present Moment Interrupt', to: '/reset/quiet/present' },
];

export default function NoProgressSupport() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-lg px-5 pt-8 pb-8 space-y-7 soul-ambient-gold">
      <button onClick={() => navigate('/reset/quiet')} className="flex items-center gap-1.5 text-muted-foreground text-sm active:scale-95 transition-transform">
        <ArrowLeft size={16} /> Quiet the Mind
      </button>

      <div className="text-center space-y-3">
        <motion.div
          className="w-14 h-14 rounded-full mx-auto flex items-center justify-center soul-glass-elevated"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Heart size={20} className="text-primary/70" strokeWidth={1.5} />
        </motion.div>
        <h1 className="font-heading text-xl font-semibold tracking-tight">Nothing is working?</h1>
        <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">That feeling is valid. Here are some possibilities for why, without judgment.</p>
      </div>

      <div className="space-y-3">
        {EXPLANATIONS.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="soul-glass-elevated p-5 rounded-2xl space-y-2.5"
          >
            <h3 className="font-heading text-sm font-medium tracking-tight">{e.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{e.desc}</p>
            <button onClick={() => navigate(e.to)} className="text-xs text-primary/80 hover:text-primary transition-colors">{e.action} →</button>
          </motion.div>
        ))}
      </div>

      <div className="text-center pt-3">
        <p className="text-xs text-muted-foreground/50 font-heading italic max-w-[260px] mx-auto leading-relaxed">
          "Less friction is still movement. You are not stuck — you're recalibrating."
        </p>
      </div>
    </div>
  );
}
