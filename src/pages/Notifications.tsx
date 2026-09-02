import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff, Sun, Moon, Clock, RotateCcw, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { toast } from 'sonner';
import { hasNotificationAPI } from '@/lib/platform';
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
import {
  hasPushSupport,
  subscribeAndSync,
  updatePushPrefs,
  unsubscribePush,
  sendTestPush,
} from '@/lib/push';

type SheetKind = 'morning' | 'evening' | 'return' | 'affirm';

const RETURN_OPTIONS = [
  { value: 2, label: 'Every 2 hours' },
  { value: 4, label: 'Every 4 hours' },
  { value: 8, label: 'Every 8 hours' },
  { value: 12, label: 'Twice a day' },
];

const AFFIRM_OPTIONS = [
  { value: 30, label: 'Every 30 minutes' },
  { value: 60, label: 'Every hour' },
  { value: 120, label: 'Every 2 hours' },
  { value: 180, label: 'Every 3 hours' },
];

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return t;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<NotificationPrefs>(loadNotifPrefs);
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    hasNotificationAPI() ? Notification.permission : 'denied'
  );

  const pushAvailable = hasPushSupport();

  // Map UI prefs → backend payload
  const toPushPayload = (p: NotificationPrefs) => ({
    morning_reminder: p.morningReminder,
    morning_time: p.morningTime,
    evening_reflection: p.eveningReflection,
    evening_time: p.eveningTime,
    gentle_returns: p.gentleReturns,
    return_interval_hours: p.returnIntervalHours,
    affirmation_interval_minutes: p.affirmationReminders ? p.affirmationIntervalMinutes : 0,
  });

  useEffect(() => {
    saveNotifPrefs(prefs);
    if (prefs.enabled && canNotify()) {
      startNotificationScheduler();
      // Sync prefs to backend so server-side cron can deliver pushes when app is closed.
      if (pushAvailable) {
        updatePushPrefs(toPushPayload(prefs)).catch(() => {});
      }
    } else {
      stopNotificationScheduler();
    }
  }, [prefs, pushAvailable]);

  const handleEnableToggle = async (checked: boolean) => {
    if (checked) {
      const perm = await requestPermission();
      setPermissionState(perm);
      if (perm === 'granted') {
        const next = { ...prefs, enabled: true, permission: perm };
        setPrefs(next);
        // Subscribe browser to push and sync prefs to backend.
        if (pushAvailable) {
          const ok = await subscribeAndSync(toPushPayload(next));
          if (ok) {
            toast.success('Notifications enabled. We\'ll be gentle.');
          } else {
            toast.success('Local reminders enabled.');
          }
        } else {
          toast.success('Notifications enabled. We\'ll be gentle.');
        }
      } else if (perm === 'denied') {
        toast.error('Notifications blocked. Check your browser settings.');
      } else {
        toast('Please allow notifications to receive gentle reminders.');
      }
    } else {
      setPrefs(p => ({ ...p, enabled: false }));
      stopNotificationScheduler();
      if (pushAvailable) {
        unsubscribePush().catch(() => {});
      }
    }
  };

  const update = (key: keyof NotificationPrefs, value: unknown) => {
    setPrefs(p => ({ ...p, [key]: value }));
  };

  const testNotification = async (type: 'morning' | 'evening' | 'return' | 'affirm') => {
    if (!canNotify()) {
      toast.error('Enable notifications first.');
      return;
    }
    // Prefer server-side push so the user can confirm background delivery works.
    if (pushAvailable) {
      const ok = await sendTestPush(type);
      if (ok) {
        toast.success('Push sent. Check your notifications.');
        return;
      }
    }
    sendNotification(type as any);
    toast.success('Check your notifications.');
  };

  const notSupported = !hasNotificationAPI();

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/profile')} className="text-muted-foreground p-2 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-heading text-lg font-semibold text-foreground">Gentle Returns</h1>
          <p className="text-[10px] text-muted-foreground">A quiet tap back, never pressure</p>
        </div>
      </div>

      {notSupported ? (
        <div className="text-center py-16 space-y-3">
          <BellOff size={32} className="mx-auto text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Notifications aren't available in this browser.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Try opening Inner Wake in Chrome, Safari, or Firefox.
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
                <p className="text-sm font-medium text-foreground">Enable Gentle Returns</p>
                <p className="text-[10px] text-muted-foreground">
                  {permissionState === 'denied' ? 'Blocked in browser settings' : 'Small invitations back to center'}
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
                    <button
                      onClick={() => setSheet('morning')}
                      className="press bg-muted/20 text-xs text-foreground rounded-lg px-3 py-1.5 border border-border/20 min-h-[36px] transition-colors hover:border-primary/30"
                      aria-label={`Morning check-in time, ${formatTime(prefs.morningTime)}. Tap to change.`}
                    >
                      {formatTime(prefs.morningTime)}
                    </button>
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
                    <button
                      onClick={() => setSheet('evening')}
                      className="press bg-muted/20 text-xs text-foreground rounded-lg px-3 py-1.5 border border-border/20 min-h-[36px] transition-colors hover:border-primary/30"
                      aria-label={`Evening reflection time, ${formatTime(prefs.eveningTime)}. Tap to change.`}
                    >
                      {formatTime(prefs.eveningTime)}
                    </button>
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
                    <button
                      onClick={() => setSheet('return')}
                      className="press bg-muted/20 text-xs text-foreground rounded-lg px-3 py-1.5 border border-border/20 min-h-[36px] transition-colors hover:border-primary/30"
                      aria-label="Gentle return frequency. Tap to change."
                    >
                      {RETURN_OPTIONS.find(o => o.value === prefs.returnIntervalHours)?.label ?? 'Every 4 hours'}
                    </button>
                    <button
                      onClick={() => testNotification('return')}
                      className="text-[10px] text-primary/60 hover:text-primary ml-auto"
                    >
                      Test
                    </button>
                  </div>
                )}
              </div>

              {/* Affirmation Reminders */}
              <div className="soul-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles size={16} className="text-primary/70" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Affirmation Reminders</p>
                      <p className="text-[10px] text-muted-foreground">Gentle pings to saturate your mind</p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs.affirmationReminders}
                    onCheckedChange={v => update('affirmationReminders', v)}
                  />
                </div>
                {prefs.affirmationReminders && (
                  <div className="flex items-center gap-2 pl-7">
                    <Clock size={12} className="text-muted-foreground/50" />
                    <button
                      onClick={() => setSheet('affirm')}
                      className="press bg-muted/20 text-xs text-foreground rounded-lg px-3 py-1.5 border border-border/20 min-h-[36px] transition-colors hover:border-primary/30"
                      aria-label="Affirmation reminder frequency. Tap to change."
                    >
                      {AFFIRM_OPTIONS.find(o => o.value === prefs.affirmationIntervalMinutes)?.label ?? 'Every hour'}
                    </button>
                    <button
                      onClick={() => testNotification('affirm')}
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

      {/* Reminder-time picker — a bottom sheet with real gesture dismissal,
          not a route swap. */}
      <Drawer open={sheet !== null} onOpenChange={(open) => !open && setSheet(null)}>
        <DrawerContent className="border-border/30 bg-card/95 backdrop-blur-xl">
          <DrawerHeader className="text-center">
            <DrawerTitle className="font-heading text-lg font-light text-foreground">
              {sheet === 'morning' && 'Morning Check-In'}
              {sheet === 'evening' && 'Evening Reflection'}
              {sheet === 'return' && 'Gentle Return Nudges'}
              {sheet === 'affirm' && 'Affirmation Reminders'}
            </DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground">
              {(sheet === 'morning' || sheet === 'evening') && 'Choose the quiet hour.'}
              {(sheet === 'return' || sheet === 'affirm') && 'How often should we whisper?'}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-6 pb-8 safe-bottom">
            {(sheet === 'morning' || sheet === 'evening') && (
              <div className="flex flex-col items-center gap-5">
                <input
                  type="time"
                  value={sheet === 'morning' ? prefs.morningTime : prefs.eveningTime}
                  onChange={(e) =>
                    update(sheet === 'morning' ? 'morningTime' : 'eveningTime', e.target.value)
                  }
                  className="w-full max-w-[220px] rounded-2xl border border-border/30 bg-muted/20 px-4 py-3 text-center font-heading text-2xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
                <DrawerClose asChild>
                  <button className="press min-h-[48px] w-full max-w-[220px] rounded-2xl bg-primary text-sm font-medium text-primary-foreground">
                    Done
                  </button>
                </DrawerClose>
              </div>
            )}

            {(sheet === 'return' || sheet === 'affirm') && (
              <div className="mx-auto flex max-w-[280px] flex-col gap-2">
                {(sheet === 'return' ? RETURN_OPTIONS : AFFIRM_OPTIONS).map((opt) => {
                  const selected =
                    sheet === 'return'
                      ? prefs.returnIntervalHours === opt.value
                      : prefs.affirmationIntervalMinutes === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        update(
                          sheet === 'return' ? 'returnIntervalHours' : 'affirmationIntervalMinutes',
                          opt.value,
                        );
                        setSheet(null);
                      }}
                      className={`press min-h-[48px] rounded-2xl border px-4 text-sm transition-colors ${
                        selected
                          ? 'border-primary/40 bg-primary/10 text-primary'
                          : 'border-border/20 bg-muted/10 text-foreground hover:border-primary/25'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
