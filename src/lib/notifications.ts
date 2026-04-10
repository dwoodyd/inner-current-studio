const NOTIF_KEY = 'innerwake_notifications';

export interface NotificationPrefs {
  enabled: boolean;
  permission: NotificationPermission | 'default';
  morningReminder: boolean;
  morningTime: string; // "HH:MM"
  eveningReflection: boolean;
  eveningTime: string;
  gentleReturns: boolean; // "Haven't seen you in a while" style
  returnIntervalHours: number;
}

const defaults: NotificationPrefs = {
  enabled: false,
  permission: 'default',
  morningReminder: true,
  morningTime: '08:00',
  eveningReflection: true,
  eveningTime: '20:00',
  gentleReturns: true,
  returnIntervalHours: 4,
};

export function loadNotifPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

export function saveNotifPrefs(prefs: NotificationPrefs) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs));
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return await Notification.requestPermission();
}

export function canNotify(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

const GENTLE_MESSAGES = [
  { title: 'A moment for you', body: 'Your inner current is waiting. Even one breath counts.' },
  { title: 'Gentle check-in', body: 'How are you feeling right now? Take a moment to notice.' },
  { title: 'Return when ready', body: "There's no rush. But if you're ready, your practice is here." },
  { title: 'Still here', body: "Your rituals don't judge. They just hold space." },
  { title: 'A soft reminder', body: 'Sometimes the most important thing is just showing up.' },
];

const MORNING_MESSAGES = [
  { title: 'Good morning', body: 'Before the day begins — where are you right now?' },
  { title: 'A new day', body: 'Start with one honest check-in. That changes everything.' },
  { title: 'Morning current', body: 'What feels present this morning? Your practice is ready.' },
];

const EVENING_MESSAGES = [
  { title: 'Evening reflection', body: 'Before you rest — what moved through you today?' },
  { title: 'Day closing', body: 'A quiet moment of reflection before the day ends.' },
  { title: 'Settle in', body: "How are you landing tonight? There's no wrong answer." },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function sendNotification(type: 'morning' | 'evening' | 'return') {
  if (!canNotify()) return;

  const msg = type === 'morning'
    ? pickRandom(MORNING_MESSAGES)
    : type === 'evening'
    ? pickRandom(EVENING_MESSAGES)
    : pickRandom(GENTLE_MESSAGES);

  try {
    new Notification(msg.title, {
      body: msg.body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: `innerwake-${type}`,
      silent: false,
    });
  } catch {
    // Notification API not available in this context
  }
}

let schedulerInterval: ReturnType<typeof setInterval> | null = null;
let lastReturnNotif = Date.now();

export function startNotificationScheduler() {
  if (schedulerInterval) return;

  const prefs = loadNotifPrefs();
  if (!prefs.enabled || !canNotify()) return;

  // Check every minute
  schedulerInterval = setInterval(() => {
    const p = loadNotifPrefs();
    if (!p.enabled) { stopNotificationScheduler(); return; }

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (p.morningReminder && timeStr === p.morningTime) {
      sendNotification('morning');
    }

    if (p.eveningReflection && timeStr === p.eveningTime) {
      sendNotification('evening');
    }

    if (p.gentleReturns) {
      const hoursSince = (Date.now() - lastReturnNotif) / (1000 * 60 * 60);
      if (hoursSince >= p.returnIntervalHours) {
        sendNotification('return');
        lastReturnNotif = Date.now();
      }
    }
  }, 60000);
}

export function stopNotificationScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}
