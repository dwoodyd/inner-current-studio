import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/lib/AppContext';

const steps = [
  {
    title: 'Welcome to SoulCurrent',
    subtitle: 'Return to your inner current.',
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
    subtitle: 'We\'ll shape your experience around this.',
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
  'Inconsistency': { name: 'State Check-In', description: 'Locate where you are. That\'s the starting point.', route: '/reset' },
  'Overwhelm': { name: 'Stillness Timer', description: 'One minute of stillness can shift everything.', route: '/reset/stillness' },
  'Disconnection': { name: 'State Check-In', description: 'Let\'s find where you are right now.', route: '/reset' },
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

  const handleNext = () => {
    if (isLast) {
      setStep(step + 1);
    } else {
      setStep(step + 1);
    }
  };

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
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12">
      <AnimatePresence mode="wait">
        {!showRecommendation ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm"
          >
            {current.type === 'welcome' ? (
              <div className="flex flex-col items-center gap-6 text-center">
                {/* Logo orb */}
                <motion.div
                  className="h-20 w-20 rounded-full bg-primary/20 soul-glow-gold"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <h1 className="font-heading text-3xl font-semibold text-foreground">{current.title}</h1>
                <p className="font-heading text-lg font-light italic text-muted-foreground">{current.subtitle}</p>
                <button
                  onClick={handleNext}
                  className="mt-6 w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
                <div className="space-y-2.5">
                  {current.options?.map(option => (
                    <button
                      key={option}
                      onClick={() => handleSelect(option)}
                      className={`w-full rounded-xl border px-4 py-3.5 text-left text-sm transition-all ${
                        selectedForStep === option
                          ? 'border-primary/40 bg-primary/10 text-foreground'
                          : 'border-border/40 bg-card text-muted-foreground hover:border-border'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  disabled={!selectedForStep}
                  className="w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-all disabled:opacity-30"
                >
                  Continue
                </button>
                {/* Step dots */}
                <div className="flex justify-center gap-1.5 pt-2">
                  {steps.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'}`} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="recommendation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm text-center space-y-8"
          >
            <motion.div
              className="mx-auto h-16 w-16 rounded-full bg-primary/20 soul-glow-gold"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="space-y-3">
              <h2 className="font-heading text-2xl font-medium text-foreground">Your first ritual</h2>
              <p className="text-sm text-muted-foreground">Based on what you shared, we recommend starting here.</p>
            </div>
            {rec && (
              <div className="soul-card text-left space-y-2">
                <h3 className="font-heading text-lg font-medium text-primary">{rec.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{rec.description}</p>
              </div>
            )}
            <button
              onClick={handleFinish}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground"
            >
              Begin your practice
            </button>
            <button
              onClick={() => { completeOnboarding({ reason: selections.reason || '', style: selections.style || '', challenge: selections.challenge || '' }); navigate('/'); }}
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
