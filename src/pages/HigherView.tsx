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

const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } };

export default function HigherView() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [response, setResponse] = useState('');
  const [done, setDone] = useState(false);

  return (
    <div className="mx-auto max-w-lg px-4 pt-8 pb-6 min-h-[80dvh] flex flex-col">
      <button onClick={() => navigate('/reset/quiet')} className="flex items-center gap-1.5 text-muted-foreground text-sm mb-6 active:scale-95">
        <ArrowLeft size={16} /> Quiet the Mind
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key={idx} {...fadeUp} className="text-center space-y-6 max-w-sm w-full">
              <Mountain size={28} className="text-primary/60 mx-auto" />
              <h2 className="font-heading text-lg text-foreground/90 leading-relaxed">{PROMPTS[idx]}</h2>
              <textarea
                value={response}
                onChange={e => setResponse(e.target.value)}
                placeholder="Let something surface…"
                className="w-full p-3 rounded-xl bg-muted/30 border border-border/30 text-sm resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setResponse(''); setIdx(i => (i + 1) % PROMPTS.length); }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Another prompt
                </button>
                <button onClick={() => setDone(true)}
                  className="px-6 py-2.5 rounded-full bg-primary/15 text-primary font-medium text-sm active:scale-95">
                  I see it
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="done" {...fadeUp} className="text-center space-y-5">
              <Mountain size={32} className="text-primary mx-auto" />
              <h2 className="font-heading text-xl font-semibold">The view is different from here.</h2>
              <p className="text-sm text-muted-foreground">You don't have to stay in the narrow angle.</p>
              <button onClick={() => navigate('/reset/quiet')} className="text-sm text-primary/80">Back to Quiet the Mind</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
