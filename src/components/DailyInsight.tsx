import React from 'react';

const insights = [
  "What you resist persists. What you allow, moves.",
  "Relief is not the absence of challenge. It's the presence of steadiness.",
  "You don't need to fix your thoughts. You need to soften your grip on them.",
  "Clarity doesn't arrive through force. It arrives when you stop pushing.",
  "The current is always there. You're learning to stop swimming against it.",
  "A small shift today is more real than a dramatic leap you can't sustain.",
  "Your inner state is not a problem to solve. It's a signal to follow.",
  "Momentum begins with one believable sentence.",
  "What if relief is closer than it feels right now?",
  "You don't need to convince yourself. You need to soften toward what's already true.",
  "Alignment is not perfection. It's honesty with yourself.",
  "The steadiest version of you is built one return at a time.",
  "Spaciousness begins when you stop crowding yourself with pressure.",
  "Your next state is not something to force. It's something to let arrive.",
  "What feels heavy right now won't always feel this way.",
];

const DailyInsight = React.memo(function DailyInsight() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const insight = insights[dayOfYear % insights.length];

  return (
    <div className="soul-card border-primary/10">
      <p className="font-heading text-base font-light italic leading-relaxed text-foreground/80">
        "{insight}"
      </p>
    </div>
  );
});

export default DailyInsight;
