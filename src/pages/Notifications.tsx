import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff, Sun, Moon, Clock, RotateCcw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  loadNotifPrefs,
  saveNotifPrefs,
  requestPermission,
  canNotify,
  startNotificationScheduler,
  stopNotificationScheduler,
  sendNotification,
  type NotificationPrefs,
} from '@/lib/notifications';

export default function Notifications() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<NotificationPrefs>(loadNotifPrefs);
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  useEffect(() => {
    saveNotifPrefs(prefs);
    if (prefs.enabled && canNotify()) {
      startNotificationScheduler();
    } else {
      stopNotificationScheduler();
    }
  }, [prefs]);

  const handleEnableToggle = async (checked: boolean) => {
    if (checked) {
      const perm = await requestPermission();
      setPermissionState(perm);
      if (perm === 'granted') {
        setPrefs(p => ({ ...p, enabled: true, permission: perm }));
        toast.success('Notifications enabled. We\'ll be gentle.');
      } else if (perm === 'denied') {
        toast.error('Notifications blocked. Check your browser settings.');
      } else {
        toast('Please allow notifications to receive gentle reminders.');
      }
    } else {
      setPrefs(p => ({ ...p, enabled: false }));
      stopNotificationScheduler();
    }
  };

  const update = (key: keyof NotificationPrefs, value: unknown) => {
    setPrefs(p => ({ ...p, [key]: value }));
  };

  const testNotification = (type: 'morning' | 'evening' | 'return') => {
    if (!canNotify()) {
      toast.error('Enable notifications first.');
      return;
    }
    sendNotification(type);
    toast.success('Check your notifications.');
  };

  const notSupported = !('Notification' in window);

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/profile')} className="text-muted-foreground p-2 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-heading text-lg font-semibold text-foreground">Notifications</h1>
          <p className="text-[10px] text-muted-foreground">Gentle reminders, never noise</p>
        </div>
      </div>

      {notSupported ? (
        <div className="text-center py-16 space-y-3">
          <BellOff size={32} className="mx-auto text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Notifications aren't available in this browser.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Try opening SoulCurrent in Chrome, Safari, or Firefox.
          </p>
        </div>
      ) : (
        <>
          {/* Master Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="soul-card-raised flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center">
                <Bell size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Enable Reminders</p>
                <p className="text-[10px] text-muted-foreground">
                  {permissionState === 'denied' ? 'Blocked in browser settings' : 'Receive gentle nudges'}
                </p>
              </div>
            </div>
            <Switch
              checked={prefs.enabled}
              onCheckedChange={handleEnableToggle}
              disabled={permissionState === 'denied'}
            />
          </motion.div>

          {prefs.enabled && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {/* Morning Reminder */}
              <div className="soul-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sun size={16} className="text-primary/70" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Morning Check-In</p>
                      <p className="text-[10px] text-muted-foreground">Start your day with presence</p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs.morningReminder}
                    onCheckedChange={v => update('morningReminder', v)}
                  />
                </div>
                {prefs.morningReminder && (
                  <div className="flex items-center gap-2 pl-7">
                    <Clock size={12} className="text-muted-foreground/50" />
                    <input
                      type="time"
                      value={prefs.morningTime}
                      onChange={e => update('morningTime', e.target.value)}
                      className="bg-muted/20 text-xs text-foreground rounded-lg px-3 py-1.5 border border-border/20 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    <button
                      onClick={() => testNotification('morning')}
                      className="text-[10px] text-primary/60 hover:text-primary ml-auto"
                    >
                      Test
                    </button>
                  </div>
                )}
              </div>

              {/* Evening Reflection */}
              <div className="soul-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Moon size={16} className="text-soul-violet/70" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Evening Reflection</p>
                      <p className="text-[10px] text-muted-foreground">Close the day gently</p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs.eveningReflection}
                    onCheckedChange={v => update('eveningReflection', v)}
                  />
                </div>
                {prefs.eveningReflection && (
                  <div className="flex items-center gap-2 pl-7">
                    <Clock size={12} className="text-muted-foreground/50" />
                    <input
                      type="time"
                      value={prefs.eveningTime}
                      onChange={e => update('eveningTime', e.target.value)}
                      className="bg-muted/20 text-xs text-foreground rounded-lg px-3 py-1.5 border border-border/20 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    <button
                      onClick={() => testNotification('evening')}
                      className="text-[10px] text-primary/60 hover:text-primary ml-auto"
                    >
                      Test
                    </button>
                  </div>
                )}
              </div>

              {/* Gentle Returns */}
              <div className="soul-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RotateCcw size={16} className="text-soul-blue/70" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Gentle Return Nudges</p>
                      <p className="text-[10px] text-muted-foreground">When it's been a while</p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs.gentleReturns}
                    onCheckedChange={v => update('gentleReturns', v)}
                  />
                </div>
                {prefs.gentleReturns && (
                  <div className="flex items-center gap-2 pl-7">
                    <Clock size={12} className="text-muted-foreground/50" />
                    <select
                      value={prefs.returnIntervalHours}
                      onChange={e => update('returnIntervalHours', Number(e.target.value))}
                      className="bg-muted/20 text-xs text-foreground rounded-lg px-3 py-1.5 border border-border/20 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    >
                      <option value={2}>Every 2 hours</option>
                      <option value={4}>Every 4 hours</option>
                      <option value={8}>Every 8 hours</option>
                      <option value={12}>Twice a day</option>
                    </select>
                    <button
                      onClick={() => testNotification('return')}
                      className="text-[10px] text-primary/60 hover:text-primary ml-auto"
                    >
                      Test
                    </button>
                  </div>
                )}
              </div>

              {/* Philosophy note */}
              <div className="text-center py-3">
                <p className="font-heading text-xs italic text-muted-foreground/60 leading-relaxed max-w-[16rem] mx-auto">
                  "We don't nag. We whisper. If a reminder doesn't serve you, turn it off."
                </p>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
