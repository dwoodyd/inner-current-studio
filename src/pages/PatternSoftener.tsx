import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Repeat } from 'lucide-react';
import { useAppState } from '@/lib/AppContext';

const COMMON_PATTERNS = [
  { loop: "I'm behind", softer: "I'm where I am, and that's the only place I can start." },
  { loop: "Nothing is changing", softer: "Change often happens before I can see it." },
  { loop: "I have to make this happen", softer: "I can take one step without forcing the whole path." },
  { loop: "I can't relax until this resolves", softer: "Relaxing may actually help this resolve." },
  { loop: "I always lose momentum", softer: "Returning is momentum. I'm here again." },
  { loop: "I'm not doing this right", softer: "There is no wrong way to soften." },
];

export default function PatternSoftener() {
  const navigate = useNavigate();
  const { state } = useAppState();

  const userPatterns = useMemo(() => {
    const thoughts = state.thoughtShifts || [];
    const freq: Record<string, number> = {};
    thoughts.forEach(t => {
      const key = t.chargeType;
      freq[key] = (freq[key] || 0) + 1;
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [state.thoughtShifts]);

  return (
    <div className="mx-auto max-w-lg px-4 pt-8 pb-6 space-y-6">
      <button onClick={() => navigate('/reset/quiet')} className="flex items-center gap-1.5 text-muted-foreground text-sm active:scale-95">
        <ArrowLeft size={16} /> Quiet the Mind
      </button>

      <div className="text-center space-y-2">
        <h1 className="font-heading text-xl font-semibold">Pattern Softener</h1>
        <p className="text-sm text-muted-foreground">See repeated loops and soften them gently.</p>
      </div>

      {userPatterns.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your recurring themes</h3>
          {userPatterns.map(([type, count]) => (
            <div key={type} className="soul-card flex items-center justify-between">
              <span className="text-sm capitalize">{type}</span>
              <span className="text-xs text-muted-foreground">{count} times</span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Common loops & softer alternatives</h3>
        {COMMON_PATTERNS.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="soul-card space-y-2"
          >
            <div className="flex items-start gap-2">
              <Repeat size={14} className="text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-foreground/80 italic">"{p.loop}"</p>
            </div>
            <p className="text-sm text-primary/80 pl-5">→ {p.softer}</p>
          </motion.div>
        ))}
      </div>

      <div className="text-center pt-2">
        <button onClick={() => navigate('/reset/quiet/shift')} className="text-sm text-primary/80 hover:text-primary">
          Shift a thought now →
        </button>
      </div>
    </div>
  );
}
