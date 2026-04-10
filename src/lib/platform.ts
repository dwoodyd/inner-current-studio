/**
 * Platform detection utilities for Capacitor / native compatibility.
 * Guards all browser-only APIs so they degrade gracefully in native shells.
 */

/** True when running inside a Capacitor native shell */
export const isNative = (): boolean =>
  typeof window !== 'undefined' && !!(window as any).Capacitor;

/** True when the Web Notification API is available */
export const hasNotificationAPI = (): boolean =>
  typeof window !== 'undefined' && 'Notification' in window;

/** True when localStorage is available (can be blocked in some webviews) */
export const hasLocalStorage = (): boolean => {
  try {
    const k = '__iw_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
};

/** Safe localStorage wrapper — returns fallback in-memory store if unavailable */
const memoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem(key: string): string | null {
    if (hasLocalStorage()) return localStorage.getItem(key);
    return memoryStore[key] ?? null;
  },
  setItem(key: string, value: string): void {
    if (hasLocalStorage()) localStorage.setItem(key, value);
    else memoryStore[key] = value;
  },
  removeItem(key: string): void {
    if (hasLocalStorage()) localStorage.removeItem(key);
    else delete memoryStore[key];
  },
};

/** True when the device has a network connection */
export const isOnline = (): boolean =>
  typeof navigator !== 'undefined' ? navigator.onLine : true;
