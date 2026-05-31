import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const RESISTANCE_LEVELS = ['high', 'moderate', 'mild', 'low', 'none'] as const;

const STEPS = [
  { key: 'amount', label: 'Amount or resource', prompt: 'What are you receiving?', placeholder: 'e.g. $5,000 / a new client / unexpected support' },
  { key: 'represents', label: 'What it represents', prompt: 'What does this represent for you?', placeholder: 'e.g. breathing room, freedom, proof of support' },
  { key: 'feeling', label: 'How it would feel', prompt: 'How would it feel to receive this?', placeholder: 'e.g. relief, excitement, calm certainty' },
  { key: 'ease_when_arrives', label: 'What becomes easier', prompt: 'What becomes easier when this arrives?', placeholder: 'e.g. I can focus on what matters, I stop worrying about rent' },
] as const;

export default function CurrentDeposit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [resistance, setResistance] = useState<string>('moderate');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const inResistanceStep = step === STEPS.length;

  const handleNext = () => {
    if (!answers[currentStep?.key]?.trim()) return;
    if (isLastStep) {
      setStep(STEPS.length); // resistance step
    } else {
      setStep(step + 1);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('current_deposits').insert({
      user_id: user.id,
      amount: answers.amount || '',
      represents: answers.represents || '',
      feeling: answers.feeling || '',
      ease_when_arrives: answers.ease_when_arrives || '',
      resistance_level: resistance,
    });
    setSaving(false);
    if (error) {
      toast.error('Could not save deposit');
      return;
    }
    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-12 pb-8 space-y-7 safe-top">
      <button onClick={() => navigate('/money/hub')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={18} strokeWidth={1.5} />
        <span className="text-sm">Money Current</span>
      </button>

      <div className="text-center space-y-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">Current Deposit</h1>
        <p className="text-sm text-muted-foreground">Create a receiving ritual for what you want to welcome.</p>
      </div>

      <AnimatePresence mode="wait">
        {saved ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-8">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-emerald-500/10">
              <Check size={28} className="text-emerald-400" />
            </div>
            <h2 className="font-heading text-xl font-semibold text-foreground">Deposit Received</h2>
            <p className="text-sm text-muted-foreground max-w-[260px] mx-auto">
              You've rehearsed receiving. The current is moving.
            </p>

            {/* Stylized receipt */}
            <div className="soul-glass-elevated rounded-2xl p-5 text-left space-y-3 mt-6 max-w-xs mx-auto border border-primary/10">
              <div className="text-center border-b border-border/30 pb-3">
                <p className="font-heading text-xs text-muted-foreground uppercase tracking-widest">Current Deposit</p>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="text-muted-foreground">Received:</span> <span className="text-foreground">{answers.amount}</span></div>
                <div><span className="text-muted-foreground">Represents:</span> <span className="text-foreground">{answers.represents}</span></div>
                <div><span className="text-muted-foreground">Feels like:</span> <span className="text-foreground">{answers.feeling}</span></div>
              </div>
              <div className="text-center border-t border-border/30 pt-3">
                <p className="text-xs text-muted-foreground italic">Status: Welcomed</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/money/hub')}
              className="mt-4 px-6 py-2.5 rounded-xl soul-glass-elevated text-sm font-medium text-foreground hover:bg-muted/10 transition-colors"
            >
              Back to Money Current
            </button>
          </motion.div>
        ) : inResistanceStep ? (
          <motion.div key="resistance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <p className="font-heading text-base font-medium text-foreground text-center">
              How much resistance do you feel about receiving this?
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {RESISTANCE_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setResistance(level)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                    resistance === level
                      ? 'bg-primary text-primary-foreground'
                      : 'soul-glass-elevated text-foreground hover:bg-muted/10'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-heading font-medium text-base hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Complete Deposit'}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* Progress */}
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
                disabled={!answers[currentStep.key]?.trim()}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-medium text-base hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLastStep ? 'Next' : 'Continue'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
