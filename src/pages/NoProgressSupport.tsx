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
    <div className="mx-auto max-w-lg px-4 pt-8 pb-6 space-y-6">
      <button onClick={() => navigate('/reset/quiet')} className="flex items-center gap-1.5 text-muted-foreground text-sm active:scale-95">
        <ArrowLeft size={16} /> Quiet the Mind
      </button>

      <div className="text-center space-y-3">
        <Heart size={28} className="text-primary/60 mx-auto" />
        <h1 className="font-heading text-xl font-semibold">Nothing is working?</h1>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">That feeling is valid. Here are some possibilities for why, without judgment.</p>
      </div>

      <div className="space-y-3">
        {EXPLANATIONS.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="soul-card space-y-2"
          >
            <h3 className="font-heading text-sm font-medium">{e.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{e.desc}</p>
            <button onClick={() => navigate(e.to)} className="text-xs text-primary/80 hover:text-primary">{e.action} →</button>
          </motion.div>
        ))}
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground/60 font-heading italic max-w-xs mx-auto">
          "Less friction is still movement. You are not stuck — you're recalibrating."
        </p>
      </div>
    </div>
  );
}
