import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const PROMPTS = [
  { key: 'what_it_supports', label: 'What is this payment supporting?', placeholder: 'e.g. A warm home, health, education…' },
  { key: 'what_it_provided', label: 'What did this money provide?', placeholder: 'e.g. Stability, comfort, opportunity…' },
  { key: 'from_steadiness', label: 'Can this be paid from steadiness instead of fear?', placeholder: 'Reflect on what shifts when you pay from calm…' },
  { key: 'circulation_feeling', label: 'What would circulation feel like here?', placeholder: 'e.g. Flowing, natural, generous…' },
];

interface ShiftEntry {
  id: string;
  payment_name: string;
  what_it_supports: string;
  what_it_provided: string;
  from_steadiness: string;
  circulation_feeling: string;
  created_at: string;
}

export default function PaymentShift() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0); // 0 = name, 1-4 = prompts, 5 = complete
  const [paymentName, setPaymentName] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<ShiftEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('payment_shifts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setHistory(data as ShiftEntry[]); });
  }, [user]);

  const handleNext = () => {
    if (step === 0 && !paymentName.trim()) return;
    if (step >= 1 && step <= 4) {
      const key = PROMPTS[step - 1].key;
      if (!answers[key]?.trim()) return;
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      saveShift();
    }
  };

  const saveShift = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('payment_shifts')
      .insert({
        user_id: user.id,
        payment_name: paymentName.trim(),
        what_it_supports: answers.what_it_supports || '',
        what_it_provided: answers.what_it_provided || '',
        from_steadiness: answers.from_steadiness || '',
        circulation_feeling: answers.circulation_feeling || '',
      })
      .select()
      .single();
    if (error) { toast.error('Could not save'); return; }
    setHistory(prev => [data as ShiftEntry, ...prev]);
    setStep(5);
    toast.success('Payment reframed 💫');
  };

  const reset = () => {
    setStep(0);
    setPaymentName('');
    setAnswers({});
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(42 65% 58% / 0.06), hsl(200 30% 40% / 0.04), transparent 70%)' }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-6 safe-top">
        <button onClick={() => navigate('/money/hub')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} strokeWidth={1.5} />
          <span className="text-sm">Money Current</span>
        </button>

        <div className="text-center space-y-2">
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Payment Shift
          </h1>
          <p className="text-sm text-muted-foreground max-w-[300px] mx-auto leading-relaxed">
            Reframe how you relate to payments. Move from fear to circulation.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Payment name */}
          {step === 0 && (
            <motion.div key="name" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <div className="soul-glass-elevated rounded-2xl p-5 space-y-3">
                <p className="text-sm text-muted-foreground">What payment or bill would you like to reframe?</p>
                <input
                  value={paymentName}
                  onChange={e => setPaymentName(e.target.value)}
                  placeholder="e.g. Rent, electricity, insurance…"
                  className="w-full bg-muted/10 border border-border/30 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-soul-gold/30"
                  maxLength={200}
                />
                <button
                  onClick={handleNext}
                  disabled={!paymentName.trim()}
                  className="w-full py-3 rounded-xl text-sm font-medium bg-soul-gold/15 text-soul-gold hover:bg-soul-gold/25 disabled:opacity-40 transition-all"
                >
                  Begin Shift
                </button>
              </div>

              {history.length > 0 && (
                <div>
                  <button onClick={() => setShowHistory(!showHistory)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {showHistory ? 'Hide' : 'Show'} past shifts ({history.length})
                  </button>
                  {showHistory && (
                    <div className="mt-2 space-y-2">
                      {history.map(h => (
                        <div key={h.id} className="soul-glass rounded-xl p-3 space-y-1">
                          <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            <CreditCard size={14} className="text-soul-gold/60" /> {h.payment_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{h.circulation_feeling}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Steps 1-4: Prompts */}
          {step >= 1 && step <= 4 && (
            <motion.div key={`prompt-${step}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <div className="soul-glass-elevated rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-soul-gold/60">Step {step} of 4</span>
                  <div className="flex-1 h-1 bg-muted/20 rounded-full overflow-hidden">
                    <div className="h-full bg-soul-gold/40 rounded-full transition-all" style={{ width: `${(step / 4) * 100}%` }} />
                  </div>
                </div>
                <p className="text-sm text-foreground font-medium">{PROMPTS[step - 1].label}</p>
                <p className="text-xs text-muted-foreground/60 italic">Regarding: {paymentName}</p>
                <textarea
                  value={answers[PROMPTS[step - 1].key] || ''}
                  onChange={e => setAnswers({ ...answers, [PROMPTS[step - 1].key]: e.target.value })}
                  placeholder={PROMPTS[step - 1].placeholder}
                  className="w-full bg-muted/10 border border-border/30 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-soul-gold/30"
                  rows={3}
                  maxLength={1000}
                />
                <button
                  onClick={handleNext}
                  disabled={!answers[PROMPTS[step - 1].key]?.trim()}
                  className="w-full py-3 rounded-xl text-sm font-medium bg-soul-gold/15 text-soul-gold hover:bg-soul-gold/25 disabled:opacity-40 transition-all"
                >
                  {step === 4 ? 'Complete Shift' : 'Next'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Complete */}
          {step === 5 && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
                <Check size={28} className="text-emerald-400" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-foreground">Payment Reframed</h2>
              <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                "{paymentName}" is no longer a source of fear — it's part of your circulation.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <button onClick={reset} className="px-4 py-2 rounded-xl text-sm bg-muted/20 text-muted-foreground hover:bg-muted/30 transition-all">
                  Shift Another
                </button>
                <button onClick={() => navigate('/money/hub')} className="px-4 py-2 rounded-xl text-sm bg-soul-gold/15 text-soul-gold hover:bg-soul-gold/25 transition-all">
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
