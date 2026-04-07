import { AppState, CheckIn, TodayFlow } from './types';

const STORAGE_KEY = 'soulcurrent_state';

const defaultTodayFlow: TodayFlow = {
  morningRitual: false,
  resetUsed: false,
  reflectionCompleted: false,
  momentumCompleted: false,
  returnCount: 0,
};

const defaultState: AppState = {
  onboarding: { completed: false },
  checkIns: [],
  wheels: [],
  gatheredSequences: [],
  momentumSessions: [],
  futurePages: [],
  imagineIfEntries: [],
  overflowEntries: [],
  customRituals: [],
  todayFlow: defaultTodayFlow,
  lastVisit: new Date().toISOString(),
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw) as AppState;
    // Reset today flow if last visit was a different day
    const lastDate = new Date(parsed.lastVisit).toDateString();
    const today = new Date().toDateString();
    if (lastDate !== today) {
      parsed.todayFlow = { ...defaultTodayFlow, returnCount: 0 };
    }
    parsed.todayFlow.returnCount += 1;
    parsed.lastVisit = new Date().toISOString();
    saveState(parsed);
    return parsed;
  } catch {
    return { ...defaultState };
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function updateState(updater: (s: AppState) => AppState) {
  const current = loadState();
  const next = updater(current);
  saveState(next);
  return next;
}

export function addCheckIn(checkIn: CheckIn) {
  return updateState(s => ({ ...s, checkIns: [checkIn, ...s.checkIns] }));
}

export function completeOnboarding(data: { reason: string; style: string; challenge: string }) {
  return updateState(s => ({
    ...s,
    onboarding: { ...data, completed: true },
  }));
}

export function updateTodayFlow(updates: Partial<TodayFlow>) {
  return updateState(s => ({
    ...s,
    todayFlow: { ...s.todayFlow, ...updates },
  }));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
