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

      <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-7 safe-top">
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
                className="soul-glass-elevated w-full text-left flex items-center gap-4 p-5 rounded-2xl hover:bg-muted/10 active:scale-[0.98] transition-all duration-200 min-h-[80px] group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
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
