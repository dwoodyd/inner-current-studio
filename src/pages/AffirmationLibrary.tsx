import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Copy, BookOpen, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { safeStorage } from '@/lib/platform';
import EmptyState from '@/components/EmptyState';
import {
  loadNotifPrefs, saveNotifPrefs, requestPermission,
  type NotificationPrefs,
} from '@/lib/notifications';

const SAVED_KEY = 'innerwake_saved_affirmations';
const REMIND_KEY = 'innerwake_affirm_reminders';

interface ReminderConfig {
  enabled: boolean;
  times: string[]; // ["09:00","13:00","18:00"]
}

function loadReminders(): ReminderConfig {
  try {
    return JSON.parse(safeStorage.getItem(REMIND_KEY) || '{}') as ReminderConfig;
  } catch { return { enabled: false, times: ['09:00', '13:00', '18:00'] }; }
}

function saveReminders(r: ReminderConfig) {
  safeStorage.setItem(REMIND_KEY, JSON.stringify(r));
}

const DEFAULT_TIMES = ['09:00', '13:00', '18:00'];

export default function AffirmationLibrary() {
  const navigate = useNavigate();
  const [affirmations, setAffirmations] = useState<string[]>([]);
  const [reminders, setReminders] = useState<ReminderConfig>({ enabled: false, times: DEFAULT_TIMES });

  useEffect(() => {
    try {
      setAffirmations(JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'));
    } catch { setAffirmations([]); }
    setReminders(loadReminders());
  }, []);

  const remove = (index: number) => {
    const updated = affirmations.filter((_, i) => i !== index);
    setAffirmations(updated);
    localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
    toast('Removed from library', {
      action: {
        label: 'Undo',
        onClick: () => {
          setAffirmations(affirmations);
          localStorage.setItem(SAVED_KEY, JSON.stringify(affirmations));
        },
      },
    });
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    toast('Copied ✦');
  };

  const toggleReminders = async () => {
    if (!reminders.enabled) {
      const perm = await requestPermission();
      if (perm !== 'granted') {
        toast('Permission needed', { description: 'Enable notifications in your browser settings.' });
        return;
      }
      const np = loadNotifPrefs();
      np.enabled = true;
      saveNotifPrefs(np);
    }
    const updated = { ...reminders, enabled: !reminders.enabled };
    setReminders(updated);
    saveReminders(updated);
    toast(updated.enabled ? 'Affirmation reminders on ✦' : 'Reminders paused');
  };

  const updateTime = (index: number, value: string) => {
    const times = [...reminders.times];
    times[index] = value;
    const updated = { ...reminders, times };
    setReminders(updated);
    saveReminders(updated);
  };

  const addTime = () => {
    if (reminders.times.length >= 6) return;
    const updated = { ...reminders, times: [...reminders.times, '12:00'] };
    setReminders(updated);
    saveReminders(updated);
  };

  const removeTime = (index: number) => {
    if (reminders.times.length <= 1) return;
    const times = reminders.times.filter((_, i) => i !== index);
    const updated = { ...reminders, times };
    setReminders(updated);
    saveReminders(updated);
  };

  return (
    <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-6 safe-top">
      <button onClick={() => navigate('/money/hub')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={18} strokeWidth={1.5} /><span className="text-sm">Money Current</span>
      </button>

      <div className="text-center space-y-2">
        <motion.div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, hsl(42 65% 58% / 0.15), hsl(160 30% 40% / 0.1))' }}
          animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 5, repeat: Infinity }}>
          <BookOpen size={24} className="text-soul-gold" />
        </motion.div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">My Affirmation Library</h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          {affirmations.length} saved · from your coach sessions
        </p>
      </div>

      {/* Reminders Section */}
      <div className="soul-glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {reminders.enabled ? <Bell size={18} className="text-soul-gold" /> : <BellOff size={18} className="text-muted-foreground" />}
            <div>
              <p className="text-sm font-medium text-foreground">Affirmation Reminders</p>
              <p className="text-xs text-muted-foreground">Get notified to affirm at set times</p>
            </div>
          </div>
          <button
            onClick={toggleReminders}
            className={`w-12 h-7 rounded-full transition-colors relative ${reminders.enabled ? 'bg-soul-gold/40' : 'bg-muted/30'}`}
          >
            <motion.div
              className="w-5 h-5 rounded-full bg-foreground absolute top-1"
              animate={{ left: reminders.enabled ? 26 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        <AnimatePresence>
          {reminders.enabled && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-2">
              <p className="text-xs text-muted-foreground">Reminder times:</p>
              {reminders.times.map((time, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={time}
                    onChange={e => updateTime(i, e.target.value)}
                    className="flex-1 bg-muted/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-soul-gold/30"
                  />
                  {reminders.times.length > 1 && (
                    <button onClick={() => removeTime(i)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              {reminders.times.length < 6 && (
                <button onClick={addTime} className="text-xs text-soul-gold hover:underline">+ Add time</button>
              )}
              <p className="text-xs text-muted-foreground italic mt-1">
                You'll receive a reminder with an affirmation from your library at each time.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Saved Affirmations */}
      {affirmations.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Your library is still quiet"
          message="Lines you save will live here, ready whenever you need one."
          invitation="Start with one sentence you can almost believe."
          action={{ label: 'Ask the Coach', onClick: () => navigate('/money/coach') }}
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {affirmations.map((aff, i) => (
              <motion.div
                key={aff}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: i * 0.03 }}
                className="soul-glass rounded-xl p-4 flex items-start gap-3 group"
              >
                <p className="flex-1 text-sm text-foreground leading-relaxed italic">"{aff}"</p>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copy(aff)} className="p-1.5 rounded-lg hover:bg-muted/20 text-muted-foreground transition-colors">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => remove(i)} className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
