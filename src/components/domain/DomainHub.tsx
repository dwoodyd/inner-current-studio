import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Sparkles, Library, Wind, Target, BookOpen, ChevronRight, Feather } from 'lucide-react';
import { DomainConfig } from '@/lib/domains';

interface Props { domain: DomainConfig }

export default function DomainHub({ domain }: Props) {
  const navigate = useNavigate();

  const tools = [
    { icon: Heart, title: `${domain.label.split(' ')[0]} State`, description: 'Check in with how you feel right now.', to: `${domain.route}/state` },
    { icon: Feather, title: 'Reality Scripting', description: 'Script your desired reality and track matching evidence.', to: `${domain.route}/script` },
    { icon: Library, title: 'Affirmations Saturation', description: 'Soak in curated affirmations on a timer.', to: `${domain.route}/affirmations` },
    { icon: BookOpen, title: 'Gather Flow', description: 'Build and absorb supportive thought sequences.', to: `${domain.route}/gather` },
    { icon: Wind, title: 'Resistance Release', description: 'Name, feel, and soften what is in the way.', to: `${domain.route}/resistance` },
    { icon: Target, title: '7 Openings', description: 'Define your top seven desires with clarity.', to: `${domain.route}/openings` },
    { icon: Sparkles, title: 'Evidence Log', description: 'Track the proof that this current is flowing.', to: `${domain.route}/evidence` },
  ];

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: `radial-gradient(circle, ${domain.glow}, transparent 70%)` }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-7 safe-top">
        <button onClick={() => navigate('/currents')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} strokeWidth={1.5} />
          <span className="text-sm">Currents</span>
        </button>

        <div className="text-center space-y-3">
          <motion.div
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
            style={{ background: domain.gradient }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-2xl">{domain.emoji}</span>
          </motion.div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">{domain.label}</h1>
          <p className="text-sm text-muted-foreground max-w-[300px] mx-auto leading-relaxed">{domain.tagline}</p>
        </div>

        <div className="space-y-3">
          {tools.map(({ icon: Icon, title, description, to }, i) => (
            <motion.button
              key={title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => navigate(to)}
              className="soul-glass-elevated w-full text-left flex items-center gap-4 p-4 sm:p-5 rounded-2xl hover:bg-muted/10 active:scale-[0.98] transition-all duration-200 min-h-[64px] group"
            >
              <div className="w-11 h-11 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
                <Icon size={20} className={domain.accentClass} strokeWidth={1.5} />
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
