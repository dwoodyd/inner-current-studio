import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppState, CheckIn, TodayFlow, Wheel, GatheredSequence, MomentumSession, FuturePage, ImagineIfEntry, OverflowEntry, CustomRitual, ResistanceEntry, ThoughtShift } from './types';
import { loadState, saveState, generateId } from './store';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

// Helper: upsert today_flow for current user
async function upsertTodayFlow(userId: string, updates: Partial<TodayFlow>) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from('today_flow')
    .select('id')
    .eq('user_id', userId)
    .eq('flow_date', today)
    .maybeSingle();

  if (existing) {
    await supabase.from('today_flow').update({
      morning_ritual: updates.morningRitual,
      reset_used: updates.resetUsed,
      reflection_completed: updates.reflectionCompleted,
      momentum_completed: updates.momentumCompleted,
      return_count: updates.returnCount,
    }).eq('id', existing.id);
  } else {
    await supabase.from('today_flow').insert({
      user_id: userId,
      flow_date: today,
      morning_ritual: updates.morningRitual ?? false,
      reset_used: updates.resetUsed ?? false,
      reflection_completed: updates.reflectionCompleted ?? false,
      momentum_completed: updates.momentumCompleted ?? false,
      return_count: updates.returnCount ?? 1,
    });
  }
}

// Load full state from Supabase for a user
async function loadCloudState(userId: string): Promise<AppState | null> {
  try {
    const [
      profileRes,
      checkInsRes,
      wheelsRes,
      seqRes,
      momRes,
      fpRes,
      iiRes,
      ofRes,
      crRes,
      reRes,
      tsRes,
      tfRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('check_ins').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('wheels').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('gathered_sequences').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('momentum_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('future_pages').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('imagine_if_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('overflow_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('custom_rituals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('resistance_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('thought_shifts').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('today_flow').select('*').eq('user_id', userId).eq('flow_date', new Date().toISOString().slice(0, 10)).maybeSingle(),
    ]);

    const profile = profileRes.data;

    const todayFlow: TodayFlow = tfRes.data ? {
      morningRitual: tfRes.data.morning_ritual,
      resetUsed: tfRes.data.reset_used,
      reflectionCompleted: tfRes.data.reflection_completed,
      momentumCompleted: tfRes.data.momentum_completed,
      returnCount: (tfRes.data.return_count || 0) + 1,
    } : { morningRitual: false, resetUsed: false, reflectionCompleted: false, momentumCompleted: false, returnCount: 1 };

    // Bump return count
    upsertTodayFlow(userId, todayFlow);

    return {
      onboarding: {
        completed: profile?.onboarding_completed ?? false,
        reason: profile?.onboarding_reason ?? undefined,
        style: profile?.onboarding_style ?? undefined,
        challenge: profile?.onboarding_challenge ?? undefined,
      },
      checkIns: (checkInsRes.data || []).map(r => ({ id: r.id, state: r.state as any, note: r.note ?? undefined, createdAt: r.created_at })),
      wheels: (wheelsRes.data || []).map(r => ({
        id: r.id, title: r.title, centerText: r.center_text, segments: r.segments as any,
        type: r.type as any, completionStatus: r.completion_status as any,
        createdAt: r.created_at, updatedAt: r.updated_at,
      })),
      gatheredSequences: (seqRes.data || []).map(r => ({
        id: r.id, title: r.title, lines: r.lines as any,
        playbackSettings: r.playback_settings as any, createdAt: r.created_at,
      })),
      momentumSessions: (momRes.data || []).map(r => ({
        id: r.id, phrase: r.phrase, duration: r.duration, completed: r.completed, createdAt: r.created_at,
      })),
      futurePages: (fpRes.data || []).map(r => ({
        id: r.id, title: r.title, template: r.template, content: r.content,
        vibeCheck: r.vibe_check as any, createdAt: r.created_at,
      })),
      imagineIfEntries: (iiRes.data || []).map(r => ({ id: r.id, category: r.category, text: r.text, createdAt: r.created_at })),
      overflowEntries: (ofRes.data || []).map(r => ({
        id: r.id, mode: r.mode, resourceAmount: r.resource_amount, entryText: r.entry_text,
        feelingText: r.feeling_text, resistanceNote: r.resistance_note, createdAt: r.created_at,
      })),
      customRituals: (crRes.data || []).map(r => ({
        id: r.id, name: r.name, steps: r.steps as any, durationEstimate: r.duration_estimate, createdAt: r.created_at,
      })),
      resistanceEntries: (reRes.data || []).map(r => ({
        id: r.id, triggerType: r.trigger_type as any, bodyLocation: r.body_location as any,
        chargeBefore: r.charge_before as any, chargeAfter: r.charge_after as any,
        clearingMode: r.clearing_mode as any, softenedStatement: r.softened_statement ?? undefined,
        createdAt: r.created_at,
      })),
      thoughtShifts: (tsRes.data || []).map(r => ({
        id: r.id, originalThought: r.original_thought, chargeType: r.charge_type as any,
        softerStatement: r.softer_statement, believableStatement: r.believable_statement,
        supportStatement: r.support_statement, createdAt: r.created_at,
      })),
      todayFlow,
      lastVisit: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Failed to load cloud state:', err);
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<AppState>(loadState);
  const [cloudLoaded, setCloudLoaded] = useState(false);

  // Load from cloud when user is available
  useEffect(() => {
    if (!user) {
      setCloudLoaded(false);
      return;
    }

    loadCloudState(user.id).then(cloudState => {
      if (cloudState) {
        setState(cloudState);
        // Also persist locally as cache
        saveState(cloudState);
      }
      setCloudLoaded(true);
    });
  }, [user?.id]);

  // Migrate localStorage data to cloud on first login
  useEffect(() => {
    if (!user || !cloudLoaded) return;
    const migrated = localStorage.getItem('soulcurrent_migrated_' + user.id);
    if (migrated) return;

    const local = loadState();
    if (local.checkIns.length > 0 || local.wheels.length > 0) {
      // Migrate local data to cloud in background
      migrateToCloud(user.id, local).then(() => {
        localStorage.setItem('soulcurrent_migrated_' + user.id, 'true');
        // Reload from cloud
        loadCloudState(user.id).then(s => { if (s) setState(s); });
      });
    } else {
      localStorage.setItem('soulcurrent_migrated_' + user.id, 'true');
    }
  }, [user?.id, cloudLoaded]);

  const refresh = useCallback(() => {
    if (user) {
      loadCloudState(user.id).then(s => { if (s) setState(s); });
    } else {
      setState(loadState());
    }
  }, [user]);

  const addCheckIn = useCallback((emotionalState: CheckIn['state'], note?: string) => {
    const checkIn: CheckIn = { id: generateId(), state: emotionalState, note, createdAt: new Date().toISOString() };
    setState(prev => {
      const next = { ...prev, checkIns: [checkIn, ...prev.checkIns] };
      saveState(next);
      return next;
    });
    if (user) {
      supabase.from('check_ins').insert({ user_id: user.id, state: emotionalState, note }).then();
    }
  }, [user]);

  const completeOnboarding = useCallback((data: { reason: string; style: string; challenge: string }) => {
    setState(prev => {
      const next = { ...prev, onboarding: { ...data, completed: true } };
      saveState(next);
      return next;
    });
    if (user) {
      supabase.from('profiles').update({
        onboarding_completed: true,
        onboarding_reason: data.reason,
        onboarding_style: data.style,
        onboarding_challenge: data.challenge,
      }).eq('user_id', user.id).then();
    }
  }, [user]);

  const updateTodayFlow = useCallback((updates: Partial<TodayFlow>) => {
    setState(prev => {
      const next = { ...prev, todayFlow: { ...prev.todayFlow, ...updates } };
      saveState(next);
      return next;
    });
    if (user) {
      upsertTodayFlow(user.id, { ...state.todayFlow, ...updates });
    }
  }, [user, state.todayFlow]);

  const saveWheel = useCallback((wheel: Omit<Wheel, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const id = generateId();
    const full: Wheel = { ...wheel, id, createdAt: now, updatedAt: now };
    setState(prev => {
      const next = { ...prev, wheels: [full, ...prev.wheels] };
      saveState(next);
      return next;
    });
    if (user) {
      supabase.from('wheels').insert({
        user_id: user.id, title: wheel.title, center_text: wheel.centerText,
        segments: wheel.segments as any, type: wheel.type, completion_status: wheel.completionStatus,
      }).then();
    }
  }, [user]);

  const saveGatheredSequence = useCallback((seq: Omit<GatheredSequence, 'id' | 'createdAt'>) => {
    const id = generateId();
    const full = { ...seq, id, createdAt: new Date().toISOString() };
    setState(prev => {
      const next = { ...prev, gatheredSequences: [full, ...prev.gatheredSequences] };
      saveState(next);
      return next;
    });
    if (user) {
      supabase.from('gathered_sequences').insert({
        user_id: user.id, title: seq.title, lines: seq.lines as any,
        playback_settings: seq.playbackSettings as any,
      }).then();
    }
  }, [user]);

  const saveMomentumSession = useCallback((session: Omit<MomentumSession, 'id' | 'createdAt'>) => {
    const id = generateId();
    const full = { ...session, id, createdAt: new Date().toISOString() };
    setState(prev => {
      const next = { ...prev, momentumSessions: [full, ...prev.momentumSessions] };
      saveState(next);
      return next;
    });
    if (user) {
      supabase.from('momentum_sessions').insert({
        user_id: user.id, phrase: session.phrase, duration: session.duration, completed: session.completed,
      }).then();
    }
  }, [user]);

  const saveFuturePage = useCallback((page: Omit<FuturePage, 'id' | 'createdAt'>) => {
    const id = generateId();
    const full = { ...page, id, createdAt: new Date().toISOString() };
    setState(prev => {
      const next = { ...prev, futurePages: [full, ...prev.futurePages] };
      saveState(next);
      return next;
    });
    if (user) {
      supabase.from('future_pages').insert({
        user_id: user.id, title: page.title, template: page.template,
        content: page.content, vibe_check: page.vibeCheck,
      }).then();
    }
  }, [user]);

  const saveImagineIfEntry = useCallback((entry: Omit<ImagineIfEntry, 'id' | 'createdAt'>) => {
    const id = generateId();
    const full = { ...entry, id, createdAt: new Date().toISOString() };
    setState(prev => {
      const next = { ...prev, imagineIfEntries: [full, ...prev.imagineIfEntries] };
      saveState(next);
      return next;
    });
    if (user) {
      supabase.from('imagine_if_entries').insert({ user_id: user.id, category: entry.category, text: entry.text }).then();
    }
  }, [user]);

  const saveOverflowEntry = useCallback((entry: Omit<OverflowEntry, 'id' | 'createdAt'>) => {
    const id = generateId();
    const full = { ...entry, id, createdAt: new Date().toISOString() };
    setState(prev => {
      const next = { ...prev, overflowEntries: [full, ...prev.overflowEntries] };
      saveState(next);
      return next;
    });
    if (user) {
      supabase.from('overflow_entries').insert({
        user_id: user.id, mode: entry.mode, resource_amount: entry.resourceAmount,
        entry_text: entry.entryText, feeling_text: entry.feelingText, resistance_note: entry.resistanceNote,
      }).then();
    }
  }, [user]);

  const saveCustomRitual = useCallback((ritual: Omit<CustomRitual, 'id' | 'createdAt'>) => {
    const id = generateId();
    const full = { ...ritual, id, createdAt: new Date().toISOString() };
    setState(prev => {
      const next = { ...prev, customRituals: [full, ...prev.customRituals] };
      saveState(next);
      return next;
    });
    if (user) {
      supabase.from('custom_rituals').insert({
        user_id: user.id, name: ritual.name, steps: ritual.steps as any, duration_estimate: ritual.durationEstimate,
      }).then();
    }
  }, [user]);

  const saveResistanceEntry = useCallback((entry: Omit<ResistanceEntry, 'id' | 'createdAt'>) => {
    const id = generateId();
    const full = { ...entry, id, createdAt: new Date().toISOString() };
    setState(prev => {
      const next = { ...prev, resistanceEntries: [full, ...(prev.resistanceEntries || [])] };
      saveState(next);
      return next;
    });
    if (user) {
      supabase.from('resistance_entries').insert({
        user_id: user.id, trigger_type: entry.triggerType, body_location: entry.bodyLocation,
        charge_before: entry.chargeBefore, charge_after: entry.chargeAfter,
        clearing_mode: entry.clearingMode, softened_statement: entry.softenedStatement,
      }).then();
    }
  }, [user]);

  const saveThoughtShift = useCallback((shift: Omit<ThoughtShift, 'id' | 'createdAt'>) => {
    const id = generateId();
    const full = { ...shift, id, createdAt: new Date().toISOString() };
    setState(prev => {
      const next = { ...prev, thoughtShifts: [full, ...(prev.thoughtShifts || [])] };
      saveState(next);
      return next;
    });
    if (user) {
      supabase.from('thought_shifts').insert({
        user_id: user.id, original_thought: shift.originalThought, charge_type: shift.chargeType,
        softer_statement: shift.softerStatement, believable_statement: shift.believableStatement,
        support_statement: shift.supportStatement,
      }).then();
    }
  }, [user]);

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

// Migrate local data to cloud
async function migrateToCloud(userId: string, local: AppState) {
  const promises: Promise<any>[] = [];

  if (local.onboarding.completed) {
    promises.push(
      supabase.from('profiles').update({
        onboarding_completed: true,
        onboarding_reason: local.onboarding.reason,
        onboarding_style: local.onboarding.style,
        onboarding_challenge: local.onboarding.challenge,
      }).eq('user_id', userId)
    );
  }

  for (const c of local.checkIns) {
    promises.push(supabase.from('check_ins').insert({ user_id: userId, state: c.state, note: c.note }));
  }
  for (const w of local.wheels) {
    promises.push(supabase.from('wheels').insert({
      user_id: userId, title: w.title, center_text: w.centerText,
      segments: w.segments as any, type: w.type, completion_status: w.completionStatus,
    }));
  }
  for (const s of local.gatheredSequences) {
    promises.push(supabase.from('gathered_sequences').insert({
      user_id: userId, title: s.title, lines: s.lines as any, playback_settings: s.playbackSettings as any,
    }));
  }
  for (const m of local.momentumSessions) {
    promises.push(supabase.from('momentum_sessions').insert({
      user_id: userId, phrase: m.phrase, duration: m.duration, completed: m.completed,
    }));
  }
  for (const f of local.futurePages) {
    promises.push(supabase.from('future_pages').insert({
      user_id: userId, title: f.title, template: f.template, content: f.content, vibe_check: f.vibeCheck,
    }));
  }
  for (const e of local.imagineIfEntries) {
    promises.push(supabase.from('imagine_if_entries').insert({ user_id: userId, category: e.category, text: e.text }));
  }
  for (const e of local.overflowEntries) {
    promises.push(supabase.from('overflow_entries').insert({
      user_id: userId, mode: e.mode, resource_amount: e.resourceAmount,
      entry_text: e.entryText, feeling_text: e.feelingText, resistance_note: e.resistanceNote,
    }));
  }
  for (const r of local.customRituals) {
    promises.push(supabase.from('custom_rituals').insert({
      user_id: userId, name: r.name, steps: r.steps as any, duration_estimate: r.durationEstimate,
    }));
  }
  for (const r of (local.resistanceEntries || [])) {
    promises.push(supabase.from('resistance_entries').insert({
      user_id: userId, trigger_type: r.triggerType, body_location: r.bodyLocation,
      charge_before: r.chargeBefore, charge_after: r.chargeAfter,
      clearing_mode: r.clearingMode, softened_statement: r.softenedStatement,
    }));
  }
  for (const t of (local.thoughtShifts || [])) {
    promises.push(supabase.from('thought_shifts').insert({
      user_id: userId, original_thought: t.originalThought, charge_type: t.chargeType,
      softer_statement: t.softerStatement, believable_statement: t.believableStatement,
      support_statement: t.supportStatement,
    }));
  }

  await Promise.allSettled(promises);
}
