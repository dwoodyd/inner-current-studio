import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Heart, Shield, Zap, Waves, Eye, Leaf } from 'lucide-react';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const PILLARS = [
  {
    icon: Heart,
    title: 'Emotional First',
    description: 'Every feature begins with a feeling. We design for your inner landscape, not your productivity.',
  },
  {
    icon: Shield,
    title: 'Safe & Private',
    description: 'Your emotional data is yours alone. End-to-end encrypted, never sold, never shared.',
  },
  {
    icon: Zap,
    title: 'Gentle Power',
    description: 'Real shifts don\'t come from force. Our tools guide you softly toward clarity and relief.',
  },
  {
    icon: Eye,
    title: 'Pattern Awareness',
    description: 'Surface the invisible rhythms of your emotional life. See yourself more clearly.',
  },
  {
    icon: Waves,
    title: 'Flow, Not Force',
    description: 'Like water finding its path, SoulCurrent helps you move through — not against — your feelings.',
  },
  {
    icon: Leaf,
    title: 'Original Practice',
    description: 'Every reframe, every ritual, every word is crafted from scratch. No borrowed mantras.',
  },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[100dvh] pb-24">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.06), transparent 70%)' }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(var(--soul-violet) / 0.05), transparent 70%)' }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-lg px-5 pt-6 space-y-8"
      >
        {/* Back button */}
        <motion.button
          variants={fadeUp}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        {/* Hero */}
        <motion.div variants={fadeUp} className="text-center space-y-5 pt-4">
          <motion.div
            className="mx-auto h-20 w-20 rounded-full soul-glow-gold flex items-center justify-center"
            style={{ background: 'radial-gradient(circle at 40% 35%, hsl(var(--primary) / 0.3), hsl(var(--primary) / 0.08))' }}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles size={24} className="text-primary/60" />
          </motion.div>

          <div className="space-y-3">
            <h1 className="font-heading text-3xl font-semibold text-foreground tracking-tight">
              About SoulCurrent
            </h1>
            <p className="font-heading text-lg text-muted-foreground italic leading-relaxed max-w-xs mx-auto">
              A practice for your inner world.
            </p>
          </div>
        </motion.div>

        {/* Mission */}
        <motion.div
          variants={fadeUp}
          className="soul-glass-elevated rounded-2xl px-6 py-6 space-y-4"
        >
          <h2 className="font-heading text-lg font-medium text-foreground">Our Mission</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            SoulCurrent was built for the moments when your mind won't quiet, your emotions feel heavy,
            or you've lost your center. It's not a meditation app. It's not therapy. It's a practice space
            — a living toolbox for emotional clarity, built around how you actually feel.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We believe relief doesn't arrive through effort. It arrives when you stop gripping.
            Every tool inside SoulCurrent is designed to help you release, reframe, and return to yourself.
          </p>
        </motion.div>

        {/* Pillars */}
        <motion.div variants={fadeUp} className="space-y-3">
          <h2 className="font-heading text-lg font-medium text-foreground px-1">What We Stand For</h2>
          <div className="grid grid-cols-1 gap-3">
            {PILLARS.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="soul-glass rounded-2xl px-5 py-4 flex items-start gap-4 group hover:bg-muted/10 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={18} className="text-primary" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Philosophy */}
        <motion.div
          variants={fadeUp}
          className="soul-glass-elevated rounded-2xl px-6 py-6 space-y-4 border border-primary/10"
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center">
              <Sparkles size={12} className="text-primary" />
            </div>
            <h2 className="font-heading text-base font-medium text-foreground">The SoulCurrent Philosophy</h2>
          </div>
          <blockquote className="font-heading text-base text-foreground/80 italic leading-relaxed border-l-2 border-primary/20 pl-4">
            "You are not broken. You are not behind. You are simply a human being, being human.
            Sometimes the next clear thought is only one breath away."
          </blockquote>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We don't believe in toxic positivity or aggressive motivation. SoulCurrent meets you
            where you are — with softness, with honesty, and with tools that actually work.
          </p>
        </motion.div>

        {/* Version & credits */}
        <motion.div variants={fadeUp} className="text-center space-y-3 pt-4 pb-8">
          <p className="text-xs text-muted-foreground/50">SoulCurrent v1.0</p>
          <p className="text-[10px] text-muted-foreground/30">
            Crafted with intention. All content is original.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a href="/privacy" className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground underline transition-colors">
              Privacy Policy
            </a>
            <span className="text-[10px] text-muted-foreground/20">·</span>
            <a href="/terms" className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground underline transition-colors">
              Terms of Service
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
