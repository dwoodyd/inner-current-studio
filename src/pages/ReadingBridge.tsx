import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Check } from 'lucide-react';
import { toast } from 'sonner';
import { CHAPTERS, type ChapterId } from '@/lib/readingBridge/config';
import { useReadingBridge } from '@/lib/readingBridge/useReadingBridge';

export default function ReadingBridge() {
  const navigate = useNavigate();
  const { chapter, optedOut, setChapter, optOut } = useReadingBridge();

  const choose = (id: ChapterId) => {
    setChapter(id);
    toast('Got it. We\'ll hold that.', {
      description: id === 'finished'
        ? 'Every chapter mapping is now open.'
        : 'Inner Wake will quietly meet you where you\'re reading.',
    });
  };

  const handleOptOut = () => {
    optOut();
    toast('Reading Bridge dismissed.', { description: 'It won\'t surface again.' });
    navigate(-1);
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(42 65% 58% / 0.06), transparent 70%)' }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pt-10 pb-12 safe-top space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15">
            <BookOpen size={20} className="text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl text-foreground tracking-tight">Reading Bridge</h1>
          <p className="mx-auto max-w-[340px] text-sm text-muted-foreground leading-relaxed">
            Tell Inner Wake where you are in <em className="italic">Before the Words</em>. We'll quietly meet you in the same language when a connection is real.
          </p>
          {optedOut && (
            <p className="text-[11px] text-muted-foreground/60 italic font-heading">
              You previously dismissed this. Pick a chapter below to turn it back on.
            </p>
          )}
        </div>

        <div className="space-y-2">
          {CHAPTERS.map((c, i) => {
            const selected = chapter === c.id;
            const isClose = c.id === 'finished';
            return (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => choose(c.id)}
                className={`group flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left min-h-[56px] transition-all duration-150 active:scale-[0.99] ${
                  selected
                    ? 'border-primary/40 bg-primary/10'
                    : isClose
                      ? 'border-border/30 bg-card/40 hover:bg-muted/10'
                      : 'border-border/30 bg-card/40 hover:bg-muted/10'
                }`}
              >
                <span className={`flex-1 text-sm leading-snug ${selected ? 'text-foreground' : 'text-foreground/85'}`}>
                  {c.label}
                </span>
                {selected && <Check size={16} className="shrink-0 text-primary" />}
              </motion.button>
            );
          })}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleOptOut}
            className="w-full min-h-[44px] rounded-xl border border-border/30 bg-card/30 px-4 text-xs font-medium text-muted-foreground hover:bg-muted/10 transition-colors"
          >
            Not reading it — don't ask again
          </button>
        </div>

        <p className="px-2 text-center text-[11px] text-muted-foreground/55 italic font-heading">
          You can change this anytime from Profile.
        </p>
      </div>
    </div>
  );
}
