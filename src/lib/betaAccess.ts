// Centralized helpers for the soft beta gate + owner bypass.
// The gate is a marketing wall, not a security boundary — real auth is Supabase.
//
// Storage strategy:
//  - sessionStorage (default): clears when the tab/window closes — safer.
//  - localStorage (opt-in via "trust this device"): persists across sessions.

export const STORAGE_KEY = 'iw_beta_access_v1';
export const BETA_TESTER_FLAG_KEY = 'iw_beta_tester_v1';
export const BETA_CODES = ['INNERWAKE-BETA', 'CURRENT20', 'QUIETRETURN'];
export const OWNER_PASSWORDS = ['OWNER-IW-2026', 'innerwake-owner-2026'];

/** Marks the current device as having entered via a real beta code.
 *  Used after signup to grant a 90-day trial via grant_beta_trial(). */
export function markBetaTester(): void {
  try { localStorage.setItem(BETA_TESTER_FLAG_KEY, '1'); } catch {}
}

export function isBetaTester(): boolean {
  if (typeof window === 'undefined') return false;
  try { return localStorage.getItem(BETA_TESTER_FLAG_KEY) === '1'; } catch { return false; }
}

export function isGateUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return (
      sessionStorage.getItem(STORAGE_KEY) === 'open' ||
      localStorage.getItem(STORAGE_KEY) === 'open'
    );
  } catch {
    return false;
  }
}

export function unlockBetaSession(): void {
  try { sessionStorage.setItem(STORAGE_KEY, 'open'); } catch {}
}

export function unlockOwnerSession(opts: { persist?: boolean } = {}): void {
  try {
    if (opts.persist) {
      localStorage.setItem(STORAGE_KEY, 'open');
    } else {
      sessionStorage.setItem(STORAGE_KEY, 'open');
    }
  } catch {}
}

export function clearGate(): void {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}
