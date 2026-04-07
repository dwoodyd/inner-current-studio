import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw, Check, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/lib/AppContext';
import type { BelievabilityLevel, WheelSegment } from '@/lib/types';

const SEGMENT_PROMPTS = [
  "What feels heavy right now? Let one truth land.",
  "What would bring even a small sense of relief here?",
  "What do you know is true, even if it doesn't feel easy?",
  "What if this could soften, even slightly?",
  "What possibility feels real, not forced?",
  "What would your steadier self remind you of here?",
  "What are you beginning to notice shifting?",
  "What feels more available to you now than before?",
  "Where do you sense a growing steadiness?",
  "What momentum is quietly building?",
  "What feels true and alive in this moment?",
  "What resonance are you willing to receive?",
];

const BELIEVABILITY_LABELS: { value: BelievabilityLevel; label: string; color: string }[] = [
  { value: 'forced', label: 'Forced', color: 'bg-destructive/20 text-destructive' },
  { value: 'possible', label: 'Possible', color: 'bg-soul-dim/30 text-muted-foreground' },
  { value: 'believable', label: 'Believable', color: 'bg-secondary/30 text-secondary-foreground' },
  { value: 'true', label: 'True', color: 'bg-soul-blue/20 text-soul-blue' },
  { value: 'alive', label: 'Alive', color: 'bg-primary/20 text-primary' },
];

const SOFTEN_SUGGESTIONS = [
  "Try starting with 'It's possible that...'",
  "What if you began with 'I'm open to the idea that...'",
  "Consider: 'Part of me is beginning to sense...'",
  "Try: 'I wouldn't mind if...'",
  "What about: 'It would be a relief if...'",
];

function WheelVisualization({ segments, activeIndex }: { segments: WheelSegment[]; activeIndex: number }) {
  const size = 260;
  const center = size / 2;
  const outerR = 115;
  const innerR = 50;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {Array.from({ length: 12 }).map((_, i) => {
        const startAngle = (i * 30 - 90) * (Math.PI / 180);
        const endAngle = ((i + 1) * 30 - 90) * (Math.PI / 180);
        const filled = segments[i]?.response?.length > 0;
        const active = i === activeIndex;

        const x1 = center + outerR * Math.cos(startAngle);
        const y1 = center + outerR * Math.sin(startAngle);
        const x2 = center + outerR * Math.cos(endAngle);
        const y2 = center + outerR * Math.sin(endAngle);
        const x3 = center + innerR * Math.cos(endAngle);
        const y3 = center + innerR * Math.sin(endAngle);
        const x4 = center + innerR * Math.cos(startAngle);
        const y4 = center + innerR * Math.sin(startAngle);

        const bLevel = segments[i]?.believability;
        let fill = 'hsl(220 15% 15% / 0.5)';
        if (filled) {
          if (bLevel === 'alive') fill = 'hsl(42 65% 58% / 0.4)';
          else if (bLevel === 'true') fill = 'hsl(210 40% 45% / 0.4)';
          else if (bLevel === 'believable') fill = 'hsl(265 25% 45% / 0.3)';
          else if (bLevel === 'possible') fill = 'hsl(220 10% 55% / 0.3)';
          else fill = 'hsl(0 60% 50% / 0.2)';
        }

        return (
          <path
            key={i}
            d={`M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 0 0 ${x4} ${y4} Z`}
            fill={fill}
            stroke={active ? 'hsl(42 65% 58%)' : 'hsl(220 15% 18% / 0.8)'}
            strokeWidth={active ? 2 : 0.5}
            className="transition-all duration-500"
          />
        );
      })}
      <circle cx={center} cy={center} r={innerR - 2} fill="hsl(220 18% 10%)" />
      <text x={center} y={center - 6} textAnchor="middle" className="fill-primary text-[10px] font-heading">
        {activeIndex + 1}/12
      </text>
      <text x={center} y={center + 10} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        {activeIndex < 3 ? 'Relief' : activeIndex < 6 ? 'Softening' : activeIndex < 9 ? 'Steadying' : 'Momentum'}
      </text>
    </svg>
  );
}

export default function AlignmentWheel() {
  const navigate = useNavigate();
  const { saveWheel } = useAppState();
  const [activeIndex, setActiveIndex] = useState(0);
  const [segments, setSegments] = useState<WheelSegment[]>(
    Array.from({ length: 12 }, (_, i) => ({
      index: i,
      prompt: SEGMENT_PROMPTS[i],
      response: '',
      believability: 'possible' as BelievabilityLevel,
    }))
  );
  const [showSoften, setShowSoften] = useState(false);
  const [completed, setCompleted] = useState(false);

  const current = segments[activeIndex];

  const updateSegment = useCallback((field: keyof WheelSegment, value: string | BelievabilityLevel) => {
    setSegments(prev => prev.map((s, i) => i === activeIndex ? { ...s, [field]: value } : s));
  }, [activeIndex]);

  const handleBelievability = (level: BelievabilityLevel) => {
    updateSegment('believability', level);
    if (level === 'forced') setShowSoften(true);
    else setShowSoften(false);
  };

  const goNext = () => {
    if (activeIndex < 11) setActiveIndex(activeIndex + 1);
    setShowSoften(false);
  };

  const goPrev = () => {
    if (activeIndex > 0) setActiveIndex(activeIndex - 1);
    setShowSoften(false);
  };

  const handleSave = (status: 'draft' | 'in-progress' | 'complete') => {
    saveWheel({
      title: 'Alignment Wheel',
      centerText: 'Returning to resonance',
      segments,
      type: 'alignment',
      completionStatus: status,
    });
    if (status === 'complete') {
      setCompleted(true);
    } else {
      navigate('/align');
    }
  };

  const filledCount = segments.filter(s => s.response.length > 0).length;

  if (completed) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-16 pb-6 text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="w-32 h-32 mx-auto rounded-full soul-gradient-gold opacity-80 flex items-center justify-center soul-glow-gold">
            <Sparkles size={40} className="text-primary-foreground" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
          <h2 className="font-heading text-2xl text-foreground">Wheel Complete</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            You moved through relief, softening, steadying, and momentum. Let that settle.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="space-y-3">
          <Button onClick={() => navigate('/align')} className="w-full">Return to Align</Button>
          <Button variant="ghost" onClick={() => navigate('/align/gather')} className="w-full text-muted-foreground">
            Turn into Gather Flow
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/align')} className="text-muted-foreground p-2 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-heading text-lg font-semibold text-foreground">Alignment Wheel</h1>
        <button onClick={() => handleSave('draft')} className="text-muted-foreground p-2 -mr-2">
          <Save size={18} />
        </button>
      </div>

      <WheelVisualization segments={segments} activeIndex={activeIndex} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <div className="soul-card space-y-3">
            <p className="font-heading text-sm text-primary italic">{current.prompt}</p>
            <textarea
              value={current.response}
              onChange={e => updateSegment('response', e.target.value)}
              placeholder="Write what feels true…"
              className="w-full bg-transparent border-0 border-b border-border/50 text-foreground text-sm resize-none focus:outline-none focus:border-primary/50 transition-colors min-h-[80px] placeholder:text-muted-foreground/40"
            />

            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">How does this feel?</p>
              <div className="flex flex-wrap gap-1.5">
                {BELIEVABILITY_LABELS.map(({ value, label, color }) => (
                  <button
                    key={value}
                    onClick={() => handleBelievability(value)}
                    className={`text-[11px] px-2.5 py-1 rounded-full transition-all ${
                      current.believability === value ? color + ' ring-1 ring-current' : 'bg-muted/30 text-muted-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {showSoften && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-muted/20 rounded-xl p-3 space-y-2"
                >
                  <p className="text-[10px] uppercase tracking-wider text-primary/70">Belief Support</p>
                  <p className="text-xs text-muted-foreground">
                    {SOFTEN_SUGGESTIONS[activeIndex % SOFTEN_SUGGESTIONS.length]}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={goPrev} disabled={activeIndex === 0}>
          <ChevronLeft size={16} /> Prev
        </Button>
        <span className="text-xs text-muted-foreground">{filledCount}/12 filled</span>
        {activeIndex === 11 ? (
          <Button size="sm" onClick={() => handleSave('complete')} disabled={filledCount < 6}>
            <Check size={16} /> Complete
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={goNext}>
            Next <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
