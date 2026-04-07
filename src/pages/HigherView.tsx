import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mountain } from 'lucide-react';

const PROMPTS = [
  'What else might be true here?',
  'What would you notice if you were less afraid?',
  'What would a steadier version of you say?',
  'What is the wider view?',
  'What becomes visible when you stop bracing?',
];

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } };

export default function HigherView() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [response, setResponse] = useState('');
  const [done, setDone] = useState(false);

  return (
    <div className="mx-auto max-w-lg px-5 pt-8 pb-8 min-h-[80dvh] flex flex-col soul-ambient-gold">
      <button onClick={() => navigate('/reset/quiet')} className="flex items-center gap-1.5 text-muted-foreground text-sm mb-6 active:scale-95 transition-transform">
        <ArrowLeft size={16} /> Quiet the Mind
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key={idx} {...fadeUp} className="text-center space-y-8 max-w-sm w-full">
              <motion.div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center soul-glass-elevated"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Mountain size={22} className="text-soul-blue" strokeWidth={1.5} />
              </motion.div>
              <h2 className="font-heading text-xl text-foreground/90 leading-relaxed">{PROMPTS[idx]}</h2>
              <textarea
                value={response}
                onChange={e => setResponse(e.target.value)}
                placeholder="Let something surface…"
                className="soul-textarea h-28"
              />
              <div className="flex gap-4 justify-center items-center">
                <button
                  onClick={() => { setResponse(''); setIdx(i => (i + 1) % PROMPTS.length); }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Another prompt
                </button>
                <button onClick={() => setDone(true)} className="soul-btn-primary">
                  I see it
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="done" {...fadeUp} className="text-center space-y-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 14 }} className="soul-completion-ring">
                <Mountain size={26} className="text-primary" strokeWidth={1.5} />
              </motion.div>
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="font-heading text-2xl font-semibold">The view is different from here.</motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-sm text-muted-foreground">You don't have to stay in the narrow angle.</motion.p>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} onClick={() => navigate('/reset/quiet')} className="text-sm text-primary/80 hover:text-primary transition-colors">Back to Quiet the Mind</motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
