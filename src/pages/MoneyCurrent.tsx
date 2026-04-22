import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, Receipt, Target, Sparkles, ChevronRight,
  BookOpen, Zap, Trophy, Timer, ListChecks, Bot, Library, Feather,
} from 'lucide-react';

const tools = [
  {
    icon: Heart,
    title: 'Money State',
    description: 'Check in with how you feel about money right now.',
    to: '/money/state',
    color: 'text-soul-gold',
  },
  {
    icon: Receipt,
    title: 'Current Deposit',
    description: 'Create a receiving ritual for what you want to welcome.',
    to: '/money/deposit',
    color: 'text-emerald-400',
  },
  {
    icon: Target,
    title: '7 Money Openings',
    description: 'Define your top seven money desires with clarity.',
    to: '/money/openings',
    color: 'text-soul-violet',
  },
  {
    icon: Feather,
    title: 'Reality Scripting',
    description: 'Script your money reality and track signs that match it.',
    to: '/money/script',
    color: 'text-soul-gold',
  },
  {
    icon: Sparkles,
    title: 'Overflow Spending',
    description: 'Daily abundance rehearsal — practice receiving freely.',
    to: '/money/overflow',
    color: 'text-soul-blue',
  },
  {
    icon: Sparkles,
    title: 'Evidence of Support',
    description: 'Track the abundance and support already around you.',
    to: '/money/evidence',
    color: 'text-amber-400',
  },
  {
    icon: Heart,
    title: 'Money Resistance Release',
    description: 'Name, feel, and soften money-specific resistance.',
    to: '/money/resistance',
    color: 'text-rose-400',
  },
  {
    icon: Receipt,
    title: 'Payment Shift',
    description: 'Reframe bills from fear into flowing circulation.',
    to: '/money/payment-shift',
    color: 'text-sky-400',
  },
  {
    icon: BookOpen,
    title: 'Money Gather Flow',
    description: 'Build and absorb money-supportive thought sequences.',
    to: '/money/gather',
    color: 'text-teal-400',
  },
  {
    icon: Zap,
    title: 'Aligned Action',
    description: 'Turn a money shift into one grounded, practical step.',
    to: '/money/aligned-action',
    color: 'text-orange-400',
  },
  {
    icon: Trophy,
    title: 'Wealth Rhythm',
    description: 'Track your momentum with levels, streaks, and milestones.',
    to: '/money/wealth-rhythm',
    color: 'text-purple-400',
  },
  {
    icon: Timer,
    title: 'Auto Affirmations',
    description: 'Set a timer and absorb powerful money affirmations on repeat.',
    to: '/money/affirmations',
    color: 'text-soul-gold',
  },
  {
    icon: ListChecks,
    title: '10K Challenge',
    description: 'Track your way to 10,000 affirmations. Saturate your mind.',
    to: '/money/tracker',
    color: 'text-soul-gold',
  },
  {
    icon: Bot,
    title: 'Affirmation Coach',
    description: 'AI-powered coach for personalized affirmations and guidance.',
    to: '/money/coach',
    color: 'text-soul-gold',
  },
  {
    icon: Library,
    title: 'My Affirmation Library',
    description: 'View, manage, and set reminders for your saved affirmations.',
    to: '/money/library',
    color: 'text-soul-gold',
  },
];

export default function MoneyCurrent() {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(42 65% 58% / 0.08), hsl(160 30% 40% / 0.04), transparent 70%)' }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-7 safe-top">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} strokeWidth={1.5} />
          <span className="text-sm">Home</span>
        </button>

        <div className="text-center space-y-3">
          <motion.div
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(42 65% 58% / 0.15), hsl(160 30% 40% / 0.1))' }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-2xl">💰</span>
          </motion.div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Money Current
          </h1>
          <p className="text-sm text-muted-foreground max-w-[300px] mx-auto leading-relaxed">
            Release resistance. Rehearse receiving. Build a healthier relationship with money.
          </p>
        </div>

        <div className="space-y-3">
          {tools.map(({ icon: Icon, title, description, to, color }, i) => (
            <motion.button
              key={title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
              <ChevronRight size={16} className="text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground/60 transition-colors" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
