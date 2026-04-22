import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ALL_DOMAIN_KEYS, DOMAINS } from '@/lib/domains';

export default function CurrentsHub() {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(42 65% 58% / 0.06), transparent 70%)' }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pt-10 pb-10 space-y-6 safe-top sm:pt-12 sm:space-y-7">
        <div className="text-center space-y-3">
          <h1 className="font-heading text-3xl font-semibold text-foreground tracking-tight">Currents</h1>
          <p className="text-sm text-muted-foreground max-w-[320px] mx-auto leading-relaxed">
            Each current is an area of life you can saturate, soften, and align.
          </p>
        </div>

        <div className="space-y-3">
          {ALL_DOMAIN_KEYS.map((key, i) => {
            const d = DOMAINS[key];
            return (
              <motion.button key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => navigate(d.route)}
                className="group flex min-h-[68px] w-full items-center gap-3 rounded-2xl p-3.5 text-left transition-all duration-200 hover:bg-muted/10 active:scale-[0.98] soul-glass-elevated sm:min-h-[80px] sm:gap-4 sm:p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl sm:h-14 sm:w-14 sm:text-2xl"
                  style={{ background: d.gradient }}>{d.emoji}</div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-heading text-lg font-medium text-foreground tracking-tight">{d.label}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{d.tagline}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground/60 transition-colors" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
