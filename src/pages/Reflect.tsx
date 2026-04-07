import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, Droplets, Archive } from 'lucide-react';

const items = [
  { icon: BookOpen, title: 'Future Pages', description: 'Guided reflective writing from a resonant self.', premium: true },
  { icon: Lightbulb, title: 'Imagine If', description: 'Open possibility rituals that feel playful and real.', premium: true },
  { icon: Droplets, title: 'Overflow Practice', description: 'An original receiving and sufficiency ritual.', premium: true },
  { icon: Archive, title: 'My Current', description: 'Your private archive of inner work.', premium: false },
];

export default function Reflect() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-12 pb-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Reflect</h1>
        <p className="text-sm text-muted-foreground">Longer-form reflective and imaginative space</p>
      </div>

      <div className="space-y-3">
        {items.map(({ icon: Icon, title, description, premium }, i) => (
          <motion.button
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="soul-card w-full text-left flex items-start gap-4 transition-colors hover:bg-muted/20 active:scale-[0.98]"
          >
            <Icon size={20} className="mt-0.5 text-soul-warm" strokeWidth={1.5} />
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

      {/* Empty state for My Current */}
      <div className="soul-card text-center py-8 space-y-2">
        <p className="font-heading text-sm italic text-muted-foreground">
          "Your inner library begins with one honest page."
        </p>
      </div>
    </div>
  );
}
