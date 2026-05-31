import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppState } from '@/lib/AppContext';
import { STATE_DEFS } from '@/lib/states';
import type { EmotionalState, QuickState } from '@/lib/types';

// Map the broader emotional vocabulary back to the canonical 5 quick states.
const emotionalToQuick: Record<EmotionalState, QuickState> = {
  'shut-down': 'tight', raw: 'tight', tense: 'tight', discouraged: 'tight',
  scattered: 'restless', doubtful: 'restless', restless: 'restless',
  flat: 'flat', neutral: 'flat',
  open: 'open', steady: 'open', hopeful: 'open',
  uplifted: 'flowing', clear: 'flowing', energized: 'flowing', flowing: 'flowing',
};

function formatDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (sameDay) return `Today, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  if (isYesterday) return `Yesterday, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function ResonanceLibrary() {
  const navigate = useNavigate();
  const { state } = useAppState();

  const grouped = useMemo(() => {
    const map = new Map<string, typeof state.checkIns>();
    for (const c of state.checkIns) {
      const day = new Date(c.createdAt).toDateString();
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(c);
    }
    return Array.from(map.entries());
  }, [state.checkIns]);

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-10 space-y-6 safe-top">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/profile')} className="text-muted-foreground p-2 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-heading text-lg font-semibold text-foreground">Resonance Library</h1>
          <p className="text-[10px] text-muted-foreground">Every state you've named, honored as itself</p>
        </div>
      </div>

      {state.checkIns.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <motion.div
            className="mx-auto h-14 w-14 rounded-full bg-primary/10"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <p className="font-heading text-sm italic text-muted-foreground">
            "The library fills as you check in."
          </p>
          <p className="text-xs text-muted-foreground/60">No check-ins yet. Name a state on Home to begin.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([day, entries], gi) => (
            <motion.section
              key={day}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.04 }}
              className="space-y-2"
            >
              <h2 className="px-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60">
                {new Date(day).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </h2>
              <div className="soul-glass overflow-hidden rounded-2xl divide-y divide-border/10">
                {entries.map((c, i) => {
                  const qs = emotionalToQuick[c.state] ?? 'flat';
                  const def = STATE_DEFS[qs];
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.03 }}
                      className="flex items-start gap-3 px-4 py-3.5"
                    >
                      <img
                        src={def.orb}
                        alt=""
                        className="h-12 w-12 shrink-0 object-contain"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-heading text-sm text-foreground">You were {def.label}.</span>
                          <span className="text-[10px] text-muted-foreground/50 shrink-0">
                            {formatDay(c.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {def.description}
                        </p>
                        {c.note && (
                          <p className="text-[11px] text-muted-foreground/70 italic">"{c.note}"</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>
      )}
    </div>
  );
}
