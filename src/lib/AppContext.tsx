import React, { createContext, useContext, useState, useCallback } from 'react';
import { AppState, CheckIn, TodayFlow, Wheel, GatheredSequence, MomentumSession, FuturePage, ImagineIfEntry, OverflowEntry, CustomRitual, ResistanceEntry, ThoughtShift } from './types';
import {
  loadState, generateId,
  addCheckIn as storeAddCheckIn,
  completeOnboarding as storeCompleteOnboarding,
  updateTodayFlow as storeUpdateTodayFlow,
  addWheel as storeAddWheel,
  addGatheredSequence as storeAddGatheredSequence,
  addMomentumSession as storeAddMomentumSession,
  addFuturePage as storeAddFuturePage,
  addImagineIfEntry as storeAddImagineIfEntry,
  addOverflowEntry as storeAddOverflowEntry,
  addCustomRitual as storeAddCustomRitual,
  addResistanceEntry as storeAddResistanceEntry,
  addThoughtShift as storeAddThoughtShift,
} from './store';

interface AppContextType {
  state: AppState;
  refresh: () => void;
  addCheckIn: (state: CheckIn['state'], note?: string) => void;
  completeOnboarding: (data: { reason: string; style: string; challenge: string }) => void;
  updateTodayFlow: (updates: Partial<TodayFlow>) => void;
  saveWheel: (wheel: Omit<Wheel, 'id' | 'createdAt' | 'updatedAt'>) => void;
  saveGatheredSequence: (seq: Omit<GatheredSequence, 'id' | 'createdAt'>) => void;
  saveMomentumSession: (session: Omit<MomentumSession, 'id' | 'createdAt'>) => void;
  saveFuturePage: (page: Omit<FuturePage, 'id' | 'createdAt'>) => void;
  saveImagineIfEntry: (entry: Omit<ImagineIfEntry, 'id' | 'createdAt'>) => void;
  saveOverflowEntry: (entry: Omit<OverflowEntry, 'id' | 'createdAt'>) => void;
  saveCustomRitual: (ritual: Omit<CustomRitual, 'id' | 'createdAt'>) => void;
  saveResistanceEntry: (entry: Omit<ResistanceEntry, 'id' | 'createdAt'>) => void;
  saveThoughtShift: (shift: Omit<ThoughtShift, 'id' | 'createdAt'>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  const refresh = useCallback(() => setState(loadState()), []);

  const addCheckIn = useCallback((emotionalState: CheckIn['state'], note?: string) => {
    const checkIn: CheckIn = { id: generateId(), state: emotionalState, note, createdAt: new Date().toISOString() };
    setState(storeAddCheckIn(checkIn));
  }, []);

  const completeOnboarding = useCallback((data: { reason: string; style: string; challenge: string }) => {
    setState(storeCompleteOnboarding(data));
  }, []);

  const updateTodayFlow = useCallback((updates: Partial<TodayFlow>) => {
    setState(storeUpdateTodayFlow(updates));
  }, []);

  const saveWheel = useCallback((wheel: Omit<Wheel, 'id' | 'createdAt' | 'updatedAt'>) => {
    setState(storeAddWheel(wheel));
  }, []);

  const saveGatheredSequence = useCallback((seq: Omit<GatheredSequence, 'id' | 'createdAt'>) => {
    setState(storeAddGatheredSequence(seq));
  }, []);

  const saveMomentumSession = useCallback((session: Omit<MomentumSession, 'id' | 'createdAt'>) => {
    setState(storeAddMomentumSession(session));
  }, []);

  const saveFuturePage = useCallback((page: Omit<FuturePage, 'id' | 'createdAt'>) => {
    setState(storeAddFuturePage(page));
  }, []);

  const saveImagineIfEntry = useCallback((entry: Omit<ImagineIfEntry, 'id' | 'createdAt'>) => {
    setState(storeAddImagineIfEntry(entry));
  }, []);

  const saveOverflowEntry = useCallback((entry: Omit<OverflowEntry, 'id' | 'createdAt'>) => {
    setState(storeAddOverflowEntry(entry));
  }, []);

  const saveCustomRitual = useCallback((ritual: Omit<CustomRitual, 'id' | 'createdAt'>) => {
    setState(storeAddCustomRitual(ritual));
  }, []);

  const saveResistanceEntry = useCallback((entry: Omit<ResistanceEntry, 'id' | 'createdAt'>) => {
    setState(storeAddResistanceEntry(entry));
  }, []);

  const saveThoughtShift = useCallback((shift: Omit<ThoughtShift, 'id' | 'createdAt'>) => {
    setState(storeAddThoughtShift(shift));
  }, []);

  return (
    <AppContext.Provider value={{
      state, refresh, addCheckIn, completeOnboarding, updateTodayFlow,
      saveWheel, saveGatheredSequence, saveMomentumSession, saveFuturePage,
      saveImagineIfEntry, saveOverflowEntry, saveCustomRitual,
      saveResistanceEntry, saveThoughtShift,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
