/**
 * Tracks the first meaningful practice a user completes.
 * Used to time the "Add to Home Screen" invitation for the highest-converting
 * moment — right after something felt good, never on first visit.
 */
const KEY = 'iw_first_practice_at';
export const PRACTICE_EVENT = 'iw:practice-complete';

export function hasCompletedFirstPractice(): boolean {
  try {
    return Boolean(localStorage.getItem(KEY));
  } catch {
    return false;
  }
}

export function recordPracticeComplete(): void {
  try {
    if (!localStorage.getItem(KEY)) {
      localStorage.setItem(KEY, new Date().toISOString());
    }
  } catch {
    /* storage unavailable — still fire the event */
  }
  try {
    window.dispatchEvent(new CustomEvent(PRACTICE_EVENT));
  } catch {
    /* non-browser context */
  }
}
