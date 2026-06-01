import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Check, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
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

const BELIEVABILITY_LABELS: { value: BelievabilityLevel; label: string }[] = [
  { value: 'forced', label: 'Forced' },
  { value: 'possible', label: 'Possible' },
  { value: 'believable', label: 'Believable' },
  { value: 'true', label: 'True' },
  { value: 'alive', label: 'Alive' },
];

const SOFTEN_SUGGESTIONS = [
  "Try starting with 'It's possible that...'",
  "What if you began with 'I'm open to the idea that...'",
  "Consider: 'Part of me is beginning to sense...'",
  "Try: 'I wouldn't mind if...'",
  "What about: 'It would be a relief if...'",
];

const PHASE_LABELS = ['Relief', 'Softening', 'Steadying', 'Momentum'] as const;

function WheelVisualization({ segments, activeIndex }: { segments: WheelSegment[]; activeIndex: number }) {
  const size = 260;
  const center = size / 2;
  const outerR = 115;
  const innerR = 50;

  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-48 h-48 rounded-full opacity-30" style={{
          background: 'radial-gradient(circle, hsl(42 65% 58% / 0.12), transparent 70%)',
        }} />
      </div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto relative z-10">
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
          {PHASE_LABELS[Math.floor(activeIndex / 3)]}
        </text>
      </svg>
    </div>
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
    setShowSoften(level === 'forced');
  };

  const goNext = () => { if (activeIndex < 11) { setActiveIndex(activeIndex + 1); setShowSoften(false); } };
  const goPrev = () => { if (activeIndex > 0) { setActiveIndex(activeIndex - 1); setShowSoften(false); } };

  const handleSave = (status: 'draft' | 'in-progress' | 'complete') => {
    saveWheel({ title: 'Alignment Wheel', centerText: 'Returning to resonance', segments, type: 'alignment', completionStatus: status });
    if (status === 'complete') setCompleted(true);
    else navigate('/align');
  };

  const filledCount = segments.filter(s => s.response.length > 0).length;

  if (completed) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-16 pb-6 text-center space-y-8 soul-ambient-gold">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <div className="soul-completion-ring w-32 h-32">
            <Sparkles size={40} className="text-primary" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
          <h2 className="font-heading text-2xl text-foreground">Wheel Complete</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            You moved through relief, softening, steadying, and momentum. Let that settle.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="space-y-3">
          <button onClick={() => navigate('/align')} className="soul-btn-primary w-full">Return to Align</button>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-5 soul-ambient-gold overflow-hidden">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/align')} className="text-muted-foreground p-2 -ml-2 hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-heading text-lg font-semibold text-foreground">Alignment Wheel</h1>
        <button onClick={() => handleSave('draft')} className="text-muted-foreground p-2 -mr-2 hover:text-foreground transition-colors">
          <Save size={18} />
        </button>
      </div>

      <WheelVisualization segments={segments} activeIndex={activeIndex} />

      {/* Phase indicator */}
      <div className="flex justify-center gap-1">
        {PHASE_LABELS.map((label, i) => (
          <div key={label} className={`text-[9px] px-2.5 py-1 rounded-full transition-all ${
            Math.floor(activeIndex / 3) === i ? 'bg-primary/15 text-primary' : 'text-muted-foreground/40'
          }`}>
            {label}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <div className="soul-glass-elevated rounded-2xl p-5 space-y-4">
            <p className="font-heading text-sm text-primary italic leading-relaxed">{current.prompt}</p>
            <textarea
              value={current.response}
              onChange={e => updateSegment('response', e.target.value)}
              placeholder="Write what feels true…"
              className="soul-textarea min-h-[80px]"
            />

            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">How does this feel?</p>
              <div className="flex flex-wrap gap-1.5">
                {BELIEVABILITY_LABELS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleBelievability(value)}
                    className={`soul-chip text-[11px] px-3 py-1.5 ${
                      current.believability === value ? 'soul-chip-active' : 'soul-chip-idle'
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
                  className="bg-primary/5 border border-primary/10 rounded-xl p-3 space-y-2"
                >
                  <p className="text-[10px] uppercase tracking-wider text-primary/60">Belief Support</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {SOFTEN_SUGGESTIONS[activeIndex % SOFTEN_SUGGESTIONS.length]}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <button onClick={goPrev} disabled={activeIndex === 0}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all px-3 py-2">
          <ChevronLeft size={16} /> Prev
        </button>
        <span className="text-xs text-muted-foreground/60">{filledCount}/12</span>
        {activeIndex === 11 ? (
          <button onClick={() => handleSave('complete')} disabled={filledCount < 6}
            className="soul-btn-primary flex items-center gap-1 text-sm !px-5 !py-2">
            <Check size={16} /> Complete
          </button>
        ) : (
          <button onClick={goNext}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-all px-3 py-2">
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
