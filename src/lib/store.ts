import { AppState, CheckIn, TodayFlow, Wheel, WheelSegment, GatheredSequence, MomentumSession, FuturePage, ImagineIfEntry, OverflowEntry, CustomRitual, ResistanceEntry, ThoughtShift } from './types';

const STORAGE_KEY = 'innerwake_state';

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
  resistanceEntries: [],
  thoughtShifts: [],
  todayFlow: defaultTodayFlow,
  lastVisit: new Date().toISOString(),
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const state: AppState = { ...defaultState, ...parsed };
    const lastDate = new Date(state.lastVisit).toDateString();
    const today = new Date().toDateString();
    if (lastDate !== today) {
      state.todayFlow = { ...defaultTodayFlow, returnCount: 0 };
    }
    state.todayFlow.returnCount += 1;
    state.lastVisit = new Date().toISOString();
    saveState(state);
    return state;
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
  return updateState(s => ({ ...s, onboarding: { ...data, completed: true } }));
}

export function updateTodayFlow(updates: Partial<TodayFlow>) {
  return updateState(s => ({ ...s, todayFlow: { ...s.todayFlow, ...updates } }));
}

export function addWheel(wheel: Omit<Wheel, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  return updateState(s => ({
    ...s,
    wheels: [{ ...wheel, id: generateId(), createdAt: now, updatedAt: now }, ...s.wheels],
  }));
}

export function addGatheredSequence(seq: Omit<GatheredSequence, 'id' | 'createdAt'>) {
  return updateState(s => ({
    ...s,
    gatheredSequences: [{ ...seq, id: generateId(), createdAt: new Date().toISOString() }, ...s.gatheredSequences],
  }));
}

export function addMomentumSession(session: Omit<MomentumSession, 'id' | 'createdAt'>) {
  return updateState(s => ({
    ...s,
    momentumSessions: [{ ...session, id: generateId(), createdAt: new Date().toISOString() }, ...s.momentumSessions],
  }));
}

export function addFuturePage(page: Omit<FuturePage, 'id' | 'createdAt'>) {
  return updateState(s => ({
    ...s,
    futurePages: [{ ...page, id: generateId(), createdAt: new Date().toISOString() }, ...s.futurePages],
  }));
}

export function addImagineIfEntry(entry: Omit<ImagineIfEntry, 'id' | 'createdAt'>) {
  return updateState(s => ({
    ...s,
    imagineIfEntries: [{ ...entry, id: generateId(), createdAt: new Date().toISOString() }, ...s.imagineIfEntries],
  }));
}

export function addOverflowEntry(entry: Omit<OverflowEntry, 'id' | 'createdAt'>) {
  return updateState(s => ({
    ...s,
    overflowEntries: [{ ...entry, id: generateId(), createdAt: new Date().toISOString() }, ...s.overflowEntries],
  }));
}

export function addCustomRitual(ritual: Omit<CustomRitual, 'id' | 'createdAt'>) {
  return updateState(s => ({
    ...s,
    customRituals: [{ ...ritual, id: generateId(), createdAt: new Date().toISOString() }, ...s.customRituals],
  }));
}

export function addResistanceEntry(entry: Omit<ResistanceEntry, 'id' | 'createdAt'>) {
  return updateState(s => ({
    ...s,
    resistanceEntries: [{ ...entry, id: generateId(), createdAt: new Date().toISOString() }, ...(s.resistanceEntries || [])],
  }));
}

export function addThoughtShift(shift: Omit<ThoughtShift, 'id' | 'createdAt'>) {
  return updateState(s => ({
    ...s,
    thoughtShifts: [{ ...shift, id: generateId(), createdAt: new Date().toISOString() }, ...(s.thoughtShifts || [])],
  }));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
