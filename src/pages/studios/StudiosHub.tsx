// Studios hub page — lists the curated multi-current journeys.
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Sparkles, Clock } from 'lucide-react';
import { STUDIOS } from '@/lib/studios/studios';
import { CURRENT_SPECS } from '@/lib/currents/spec';

export default function StudiosHub() {
  const navigate = useNavigate();
  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(42 65% 58% / 0.07), transparent 70%)' }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pt-10 pb-12 space-y-7 safe-top">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft size={16} strokeWidth={1.5} /> Back
        </button>

        <div className="text-center space-y-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-primary/70">Studios</p>
          <h1 className="font-heading text-3xl text-foreground tracking-tight">Longer arcs across currents</h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            A studio weaves several currents into a single sitting. For when you have time and want depth.
          </p>
        </div>

        <div className="space-y-3">
          {STUDIOS.map((s, i) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              onClick={() => navigate(`/studios/${s.id}`)}
              className="soul-glass-elevated w-full text-left p-5 rounded-2xl hover:bg-muted/10 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 soul-glow-gold">
                  <Sparkles size={16} className="text-primary" />
                </div>
                <div className="flex-1 space-y-1.5 min-w-0">
                  <h3 className="font-heading text-lg text-foreground tracking-tight">{s.title}</h3>
                  <p className="text-xs text-primary/70 italic">{s.subtitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.longDescription}</p>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
                      <Clock size={10} /> ~{s.estimatedMinutes} min
                    </span>
                    <div className="flex items-center gap-1">
                      {s.steps.map((st) => (
                        <span key={st.sequenceId} className="text-[10px]">{DOMAINS[st.slug].symbol ?? '·'}</span>
                      ))}
                      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 ml-1">
                        {s.steps.length} current{s.steps.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground/60 transition-colors" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
