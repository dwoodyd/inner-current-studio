import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const DAILY_AMOUNTS = [
  '$500', '$1,000', '$2,500', '$5,000', '$10,000', '$25,000',
  '$50,000', '$100,000', 'Unlimited support',
];

const STEPS = [
  { key: 'what_chosen', prompt: 'What would you choose to do with this?', placeholder: 'Describe how you would spend or direct this...' },
  { key: 'why_it_matters', prompt: 'Why does this choice matter to you?', placeholder: 'What makes this meaningful...' },
  { key: 'how_it_feels', prompt: 'How does it feel to imagine this?', placeholder: 'Describe the feeling...' },
  { key: 'resistance_note', prompt: 'What resistance came up, if any?', placeholder: 'Notice any tightness, doubt, or "but..." thoughts' },
] as const;

export default function OverflowSpending() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dailyAmount, setDailyAmount] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Pick a "random" daily amount based on date seed
  const suggestedAmount = useMemo(() => {
    const seed = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    return DAILY_AMOUNTS[Math.abs(hash) % DAILY_AMOUNTS.length];
  }, []);

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (!answers[currentStep.key]?.trim()) return;
    if (isLast) {
      handleSave();
    } else {
      setStep(step + 1);
    }
  };

  const handleSave = async () => {
    if (!user || !dailyAmount) return;
    setSaving(true);
    const { error } = await supabase.from('overflow_spending').insert({
      user_id: user.id,
      daily_amount: dailyAmount,
      what_chosen: answers.what_chosen || '',
      why_it_matters: answers.why_it_matters || '',
      how_it_feels: answers.how_it_feels || '',
      resistance_note: answers.resistance_note || '',
    });
    setSaving(false);
    if (error) {
      toast.error('Could not save');
      return;
    }
    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-12 pb-8 space-y-7 safe-top">
      <button onClick={() => navigate('/money')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={18} strokeWidth={1.5} />
        <span className="text-sm">Money Current</span>
      </button>

      <div className="text-center space-y-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">Overflow Spending</h1>
        <p className="text-sm text-muted-foreground">Daily abundance rehearsal — practice receiving and directing freely.</p>
      </div>

      <AnimatePresence mode="wait">
        {saved ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-8">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-emerald-500/10">
              <Check size={28} className="text-emerald-400" />
            </div>
            <h2 className="font-heading text-xl font-semibold text-foreground">Overflow Complete</h2>
            <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
              You practiced letting {dailyAmount} have a place to go. Let the body learn that receiving can stay gentle.
            </p>
            <div className="mx-auto mt-5 grid max-w-xs gap-2">
              <button onClick={() => navigate('/money/evidence')} className="px-5 py-3 rounded-xl bg-primary/15 text-primary text-sm font-medium hover:bg-primary/25 transition-colors">
                Notice evidence of support
              </button>
              <button onClick={() => navigate('/money')} className="px-5 py-3 rounded-xl soul-glass text-sm text-foreground hover:bg-muted/10 transition-colors">
                Return to Money Current
              </button>
            </div>
          </motion.div>
        ) : !dailyAmount ? (
          <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="soul-glass-elevated rounded-2xl p-5 text-center space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-heading">Today's suggested overflow</p>
              <p className="font-heading text-3xl font-semibold text-primary">{suggestedAmount}</p>
              <button
                onClick={() => setDailyAmount(suggestedAmount)}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-medium text-sm"
              >
                Accept This Amount
              </button>
            </div>

            <p className="text-center text-xs text-muted-foreground">Or choose your own:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {DAILY_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setDailyAmount(amt)}
                  className="px-3 py-1.5 rounded-lg soul-glass text-xs font-medium text-foreground hover:bg-muted/10 transition-colors"
                >
                  {amt}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Today's overflow: <span className="text-primary font-medium">{dailyAmount}</span></p>
            </div>

            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted/30'}`} />
              ))}
            </div>

            <p className="font-heading text-base font-medium text-foreground text-center">{currentStep.prompt}</p>

            <textarea
              value={answers[currentStep.key] || ''}
              onChange={(e) => setAnswers({ ...answers, [currentStep.key]: e.target.value })}
              placeholder={currentStep.placeholder}
              maxLength={500}
              autoFocus
              className="w-full soul-glass-elevated rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none h-28 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />

            <div className="flex gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 rounded-xl soul-glass-elevated text-sm font-medium text-foreground hover:bg-muted/10 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!answers[currentStep.key]?.trim() || saving}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-medium text-base hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {saving ? 'Saving…' : isLast ? 'Complete' : 'Continue'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
