import { TodayFlow } from '@/lib/types';
import { Check, Circle } from 'lucide-react';

interface TodayFlowCardProps {
  flow: TodayFlow;
}

const steps = [
  { key: 'morningRitual' as const, label: 'Morning ritual' },
  { key: 'resetUsed' as const, label: 'Reset used' },
  { key: 'reflectionCompleted' as const, label: 'Reflection' },
  { key: 'momentumCompleted' as const, label: 'Momentum session' },
];

export default function TodayFlowCard({ flow }: TodayFlowCardProps) {
  const completed = steps.filter(s => flow[s.key]).length;
  const progress = completed / steps.length;

  return (
    <div className="soul-card space-y-3 p-4 sm:space-y-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-medium text-foreground">Today's Flow</h3>
        <span className="text-xs text-muted-foreground font-heading italic">
          {completed === 0 ? "You're here today" : `${completed} of ${steps.length} complete`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-transform duration-700 ease-out origin-left will-change-transform"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {steps.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2 text-xs sm:text-sm">
            {flow[key] ? (
              <Check size={14} className="text-primary" />
            ) : (
              <Circle size={14} className="text-muted-foreground/40" />
            )}
            <span className={flow[key] ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
