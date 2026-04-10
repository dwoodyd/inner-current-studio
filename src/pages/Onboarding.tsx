import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/lib/AppContext';

const steps = [
  {
    title: 'Welcome to Inner Wake',
    subtitle: 'Wake the inner current.',
    type: 'welcome' as const,
  },
  {
    title: 'What brought you here?',
    subtitle: 'Choose what resonates most.',
    type: 'choice' as const,
    key: 'reason',
    options: [
      'I overthink',
      'I lose my center quickly',
      'I want to feel more steady',
      'I want to build a daily ritual',
      'I want relief around money, support, or receiving',
      'I want more emotional clarity',
    ],
  },
  {
    title: 'How do you prefer to work?',
    subtitle: "We'll shape your experience around this.",
    type: 'choice' as const,
    key: 'style',
    options: [
      'Short and simple',
      'Guided and reflective',
      'Visual and immersive',
      'Audio-first',
    ],
  },
  {
    title: 'What feels most present right now?',
    subtitle: 'No judgment. Just honesty.',
    type: 'choice' as const,
    key: 'challenge',
    options: [
      'Anxiety or pressure',
      'Emotional flatness',
      'Self-doubt',
      'Inconsistency',
      'Overwhelm',
      'Disconnection',
      'Receiving or money friction',
    ],
  },
];

const ritualRecommendations: Record<string, { name: string; description: string; route: string }> = {
  'Anxiety or pressure': { name: 'Contrast Reset', description: 'A fast, grounding redirect to release what feels tight.', route: '/reset/contrast' },
  'Emotional flatness': { name: 'Stillness Timer', description: 'A gentle breathing space to reconnect with yourself.', route: '/reset/stillness' },
  'Self-doubt': { name: 'Contrast Reset', description: 'Name what feels heavy, then find what feels truer.', route: '/reset/contrast' },
  'Inconsistency': { name: 'State Check-In', description: "Locate where you are. That's the starting point.", route: '/reset' },
  'Overwhelm': { name: 'Stillness Timer', description: 'One minute of stillness can shift everything.', route: '/reset/stillness' },
  'Disconnection': { name: 'State Check-In', description: "Let's find where you are right now.", route: '/reset' },
  'Receiving or money friction': { name: 'Contrast Reset', description: 'Soften the friction. Find a more spacious thought.', route: '/reset/contrast' },
};

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const { completeOnboarding } = useAppState();
  const navigate = useNavigate();

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const showRecommendation = step === steps.length;

  const handleSelect = (option: string) => {
    if (current.type === 'choice' && current.key) {
      setSelections(prev => ({ ...prev, [current.key!]: option }));
    }
  };

  const handleNext = () => setStep(step + 1);

  const handleFinish = () => {
    completeOnboarding({
      reason: selections.reason || '',
      style: selections.style || '',
      challenge: selections.challenge || '',
    });
    const rec = ritualRecommendations[selections.challenge];
    navigate(rec?.route || '/');
  };

  const selectedForStep = current?.type === 'choice' && current.key ? selections[current.key] : undefined;
  const rec = ritualRecommendations[selections.challenge];

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12 bg-background">
      <AnimatePresence mode="wait">
        {!showRecommendation ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm"
          >
            {current.type === 'welcome' ? (
              <div className="flex flex-col items-center gap-8 text-center">
                <motion.div
                  className="h-24 w-24 rounded-full soul-glow-gold"
                  style={{
                    background: 'radial-gradient(circle at 40% 35%, hsl(42 65% 58% / 0.3), hsl(42 65% 58% / 0.08))',
                  }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="space-y-3">
                  <h1 className="font-heading text-3xl font-semibold text-foreground tracking-tight">{current.title}</h1>
                  <p className="font-heading text-lg font-light italic text-muted-foreground">{current.subtitle}</p>
                </div>
                <button
                  onClick={handleNext}
                  className="mt-4 w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                  Begin
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="font-heading text-2xl font-medium text-foreground">{current.title}</h2>
                  <p className="text-sm text-muted-foreground">{current.subtitle}</p>
                </div>
                <div className="space-y-2">
                  {current.options?.map((option, i) => (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      onClick={() => handleSelect(option)}
                      className={`w-full rounded-xl border px-4 py-3.5 text-left text-sm transition-all active:scale-[0.98] ${
                        selectedForStep === option
                          ? 'border-primary/40 bg-primary/10 text-foreground shadow-sm shadow-primary/5'
                          : 'border-border/30 bg-card/50 text-muted-foreground hover:border-border/50 hover:bg-card'
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  disabled={!selectedForStep}
                  className="w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-all disabled:opacity-20 active:scale-[0.98]"
                >
                  Continue
                </button>
                <div className="flex justify-center gap-1.5 pt-2">
                  {steps.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ width: i === step ? 24 : 6 }}
                      className={`h-1 rounded-full transition-colors ${i === step ? 'bg-primary' : i < step ? 'bg-primary/40' : 'bg-muted-foreground/20'}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="recommendation"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm text-center space-y-8"
          >
            <motion.div
              className="mx-auto h-20 w-20 rounded-full soul-glow-gold"
              style={{
                background: 'radial-gradient(circle at 40% 35%, hsl(42 65% 58% / 0.3), hsl(42 65% 58% / 0.08))',
              }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="space-y-3">
              <h2 className="font-heading text-2xl font-medium text-foreground">Your first ritual</h2>
              <p className="text-sm text-muted-foreground">Based on what you shared, we recommend starting here.</p>
            </div>
            {rec && (
              <div className="soul-card-raised text-left space-y-2">
                <h3 className="font-heading text-lg font-medium text-primary">{rec.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{rec.description}</p>
              </div>
            )}
            <button
              onClick={handleFinish}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-all active:scale-[0.98]"
            >
              Begin your practice
            </button>
            <button
              onClick={() => {
                completeOnboarding({ reason: selections.reason || '', style: selections.style || '', challenge: selections.challenge || '' });
                navigate('/');
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Go to Home instead
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
