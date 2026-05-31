import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme, type ThemeMode } from '@/hooks/useTheme';

const OPTIONS: Array<{ value: ThemeMode; label: string; description: string; Icon: typeof Moon }> = [
  { value: 'dark', label: 'Dark', description: 'Deep slate · the original Inner Wake atmosphere', Icon: Moon },
  { value: 'light', label: 'Light', description: 'Warm parchment · soft daytime palette', Icon: Sun },
  { value: 'system', label: 'System', description: 'Follow your device setting', Icon: Monitor },
];

export default function ThemeSettings() {
  const navigate = useNavigate();
  const { mode, resolved, setMode } = useTheme();

  return (
    <div className="relative mx-auto max-w-lg px-4 pt-12 pb-10 space-y-6 safe-top">
      <button
        type="button"
        onClick={() => navigate('/profile')}
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        Profile
      </button>

      <header className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Theme</h1>
        <p className="text-sm text-muted-foreground font-heading italic">
          Choose the atmosphere that feels most like home
        </p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60">
          Currently showing · {resolved}
        </p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="soul-glass overflow-hidden rounded-2xl divide-y divide-border/10"
      >
        {OPTIONS.map(({ value, label, description, Icon }) => {
          const active = mode === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-all hover:bg-muted/20 active:scale-[0.99] ${
                active ? 'bg-primary/[0.05]' : ''
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  active ? 'border-primary/30 bg-primary/10' : 'border-border/20 bg-muted/30'
                }`}
              >
                <Icon size={18} className={active ? 'text-primary' : 'text-muted-foreground'} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-medium ${active ? 'text-primary' : 'text-foreground'}`}>{label}</div>
                <div className="text-[11px] text-muted-foreground">{description}</div>
              </div>
              {active && <Check size={16} className="text-primary" />}
            </button>
          );
        })}
      </motion.div>

      <p className="text-center text-[11px] text-muted-foreground/60 leading-relaxed">
        Your preference is saved on this device.
      </p>
    </div>
  );
}
