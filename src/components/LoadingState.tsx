import { motion } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading…' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6">
      {/* Breathing orb */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute h-20 w-20 rounded-full border border-primary/20"
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="h-12 w-12 rounded-full"
          style={{
            background: 'radial-gradient(circle at 40% 35%, hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.1))',
          }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute h-2 w-2 rounded-full bg-primary/60"
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground tracking-wide"
      >
        {message}
      </motion.p>
    </div>
  );
}
