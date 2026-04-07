import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppState, CheckIn } from './types';
import { loadState, saveState, generateId, addCheckIn as storeAddCheckIn, completeOnboarding as storeCompleteOnboarding, updateTodayFlow as storeUpdateTodayFlow } from './store';
import type { TodayFlow } from './types';

interface AppContextType {
  state: AppState;
  refresh: () => void;
  addCheckIn: (state: CheckIn['state'], note?: string) => void;
  completeOnboarding: (data: { reason: string; style: string; challenge: string }) => void;
  updateTodayFlow: (updates: Partial<TodayFlow>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  const refresh = useCallback(() => setState(loadState()), []);

  const addCheckIn = useCallback((emotionalState: CheckIn['state'], note?: string) => {
    const checkIn: CheckIn = { id: generateId(), state: emotionalState, note, createdAt: new Date().toISOString() };
    const next = storeAddCheckIn(checkIn);
    setState(next);
  }, []);

  const completeOnboarding = useCallback((data: { reason: string; style: string; challenge: string }) => {
    const next = storeCompleteOnboarding(data);
    setState(next);
  }, []);

  const updateTodayFlow = useCallback((updates: Partial<TodayFlow>) => {
    const next = storeUpdateTodayFlow(updates);
    setState(next);
  }, []);

  return (
    <AppContext.Provider value={{ state, refresh, addCheckIn, completeOnboarding, updateTodayFlow }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
