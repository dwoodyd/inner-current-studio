import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, RefreshCw, Timer, Sparkles, BookOpen, Play } from 'lucide-react';

const cards = [
  { label: 'Alignment Wheel', icon: Compass, to: '/align', color: 'text-soul-gold' },
  { label: 'Imagine If', icon: Sparkles, to: '/reflect/imagine-if', color: 'text-soul-violet' },
  { label: 'Contrast Reset', icon: RefreshCw, to: '/reset/contrast', color: 'text-soul-blue' },
  { label: 'Reflect', icon: Play, to: '/reflect', color: 'text-soul-green' },
  { label: 'Future Self Pages', icon: BookOpen, to: '/reflect/future-pages', color: 'text-soul-warm' },
  { label: 'Stillness Timer', icon: Timer, to: '/reset/stillness', color: 'text-muted-foreground' },
];

const QuickLaunchCards = React.memo(function QuickLaunchCards() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {cards.map(({ label, icon: Icon, to, color }) => (
        <button
          key={label}
          onClick={() => navigate(to)}
          className="soul-card flex flex-col items-center justify-center gap-2 min-h-[72px] py-4 px-2 transition-all duration-200 hover:bg-muted/30 active:scale-[0.97]"
          aria-label={label}
        >
          <Icon size={22} className={color} strokeWidth={1.5} />
          <span className="text-[11px] font-medium text-muted-foreground leading-tight text-center">{label}</span>
        </button>
      ))}
    </div>
  );
});

export default QuickLaunchCards;
