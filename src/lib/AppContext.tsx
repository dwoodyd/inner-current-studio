import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { AppState, CheckIn, TodayFlow, Wheel, GatheredSequence, MomentumSession, FuturePage, ImagineIfEntry, OverflowEntry, CustomRitual, ResistanceEntry, ThoughtShift } from './types';
import { loadState, saveState, generateId } from './store';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  validateOrError, checkInSchema, wheelSchema, gatheredSequenceSchema,
  momentumSessionSchema, futurePageSchema, imagineIfSchema, overflowSchema,
  customRitualSchema, resistanceEntrySchema, thoughtShiftSchema, onboardingSchema,
} from './validation';

interface AppContextType {
  state: AppState;
  refresh: () => void;
  addCheckIn: (state: CheckIn['state'], note?: string) => void;
  completeOnboarding: (data: { reason: string; style: string; challenge: string; companionName?: string; companionSigil?: string; freeCurrent?: string }) => void;
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

// Debounced local save to avoid blocking the main thread on every mutation
let saveTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedSave(state: AppState) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveState(state), 300);
}

type PendingCloudOp =
  | { type: 'checkIn'; payload: CheckIn }
  | { type: 'todayFlow'; payload: TodayFlow }
  | { type: 'momentumSession'; payload: MomentumSession };

const pendingKey = (userId: string) => `innerwake_pending_cloud_${userId}`;

function readPending(userId: string): PendingCloudOp[] {
  try {
    return JSON.parse(localStorage.getItem(pendingKey(userId)) || '[]') as PendingCloudOp[];
  } catch {
    return [];
  }
}

function writePending(userId: string, queue: PendingCloudOp[]) {
  try { localStorage.setItem(pendingKey(userId), JSON.stringify(queue)); } catch {}
}

function enqueuePending(userId: string, op: PendingCloudOp) {
  const queue = readPending(userId).filter(item => !(item.type === op.type && 'id' in item.payload && 'id' in op.payload && item.payload.id === op.payload.id));
  writePending(userId, [...queue, op]);
}

function shouldQueueCloudError(error: any) {
  const message = String(error?.message || error || '').toLowerCase();
  return !navigator.onLine || message.includes('fetch') || message.includes('network') || message.includes('offline');
}

// Helper: upsert today_flow for current user
async function upsertTodayFlow(userId: string, updates: Partial<TodayFlow>) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing, error: selectError } = await supabase
    .from('today_flow')
    .select('id')
    .eq('user_id', userId)
    .eq('flow_date', today)
    .maybeSingle();
  if (selectError) return { error: selectError };

  if (existing) {
    return supabase.from('today_flow').update({
      morning_ritual: updates.morningRitual,
      reset_used: updates.resetUsed,
      reflection_completed: updates.reflectionCompleted,
      momentum_completed: updates.momentumCompleted,
      return_count: updates.returnCount,
    }).eq('id', existing.id);
  }

  return supabase.from('today_flow').insert({
    user_id: userId,
    flow_date: today,
    morning_ritual: updates.morningRitual ?? false,
    reset_used: updates.resetUsed ?? false,
    reflection_completed: updates.reflectionCompleted ?? false,
    momentum_completed: updates.momentumCompleted ?? false,
    return_count: updates.returnCount ?? 1,
  });
}

async function flushPendingCloudOps(userId: string) {
  const queue = readPending(userId);
  if (!queue.length || !navigator.onLine) return;

  const remaining: PendingCloudOp[] = [];
  for (const op of queue) {
    let result: { error: any } = { error: null };
    if (op.type === 'checkIn') {
      result = await supabase.from('check_ins').insert({ user_id: userId, id: op.payload.id, state: op.payload.state, note: op.payload.note, created_at: op.payload.createdAt });
    } else if (op.type === 'todayFlow') {
      result = await upsertTodayFlow(userId, op.payload);
    } else if (op.type === 'momentumSession') {
      result = await supabase.from('momentum_sessions').insert({ user_id: userId, id: op.payload.id, phrase: op.payload.phrase, duration: op.payload.duration, completed: op.payload.completed, created_at: op.payload.createdAt });
    }
    if (result.error && shouldQueueCloudError(result.error)) remaining.push(op);
  }
  writePending(userId, remaining);
}

// Load full state from Supabase for a user
async function loadCloudState(userId: string): Promise<AppState | null> {
  try {
    const [
      profileRes, checkInsRes, wheelsRes, seqRes, momRes,
      fpRes, iiRes, ofRes, crRes, reRes, tsRes, tfRes,
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
      returnCount: tfRes.data.return_count || 0,
    } : { morningRitual: false, resetUsed: false, reflectionCompleted: false, momentumCompleted: false, returnCount: 0 };

    // Note: returnCount intentionally not auto-incremented on cloud load.
    // It now reflects actual ritual/reset completions only (see Audit §6).

    return {
      onboarding: {
        completed: profile?.onboarding_completed ?? false,
        reason: profile?.onboarding_reason ?? undefined,
        style: profile?.onboarding_style ?? undefined,
        challenge: profile?.onboarding_challenge ?? undefined,
        companionName: profile?.companion_name ?? undefined,
        companionSigil: profile?.companion_sigil ?? undefined,
        freeCurrent: profile?.free_current ?? undefined,
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

    flushPendingCloudOps(user.id).finally(() => loadCloudState(user.id).then(cloudState => {
      if (cloudState) {
        setState(cloudState);
        debouncedSave(cloudState);
      }
      setCloudLoaded(true);
    }));
  }, [user?.id]);

  // Pending-sync count exposed via context so banners can surface it.
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // Resilient flush: the `online` event is unreliable on mobile (especially
  // iOS Safari and PWAs), so also retry on tab focus, visibility change, and
  // a 30s interval while pending ops exist. Cheap no-op when queue is empty.
  useEffect(() => {
    if (!user) { setPendingSyncCount(0); return; }
    let inFlight = false;
    const refreshCount = () => setPendingSyncCount(readPending(user.id).length);
    const flush = async () => {
      if (inFlight || !navigator.onLine) return;
      if (readPending(user.id).length === 0) { refreshCount(); return; }
      inFlight = true;
      try {
        await flushPendingCloudOps(user.id);
        const s = await loadCloudState(user.id);
        if (s) setState(s);
      } finally {
        inFlight = false;
        refreshCount();
      }
    };
    const onVisible = () => { if (document.visibilityState === 'visible') flush(); };
    refreshCount();
    window.addEventListener('online', flush);
    window.addEventListener('focus', flush);
    document.addEventListener('visibilitychange', onVisible);
    const flushInterval = window.setInterval(flush, 30_000);
    const countInterval = window.setInterval(refreshCount, 2_000);
    return () => {
      window.removeEventListener('online', flush);
      window.removeEventListener('focus', flush);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(flushInterval);
      window.clearInterval(countInterval);
    };
  }, [user?.id]);

  // Migrate local data to cloud on first login
  useEffect(() => {
    if (!user || !cloudLoaded) return;
    const migrationKey = 'innerwake_migrated_' + user.id;
    try {
      const migrated = localStorage.getItem(migrationKey);
      if (migrated) return;
    } catch { return; }

    const local = loadState();
    if (local.checkIns.length > 0 || local.wheels.length > 0) {
      migrateToCloud(user.id, local).then(() => {
        try { localStorage.setItem(migrationKey, 'true'); } catch {}
        loadCloudState(user.id).then(s => { if (s) setState(s); });
      });
    } else {
      try { localStorage.setItem(migrationKey, 'true'); } catch {}
    }
  }, [user?.id, cloudLoaded]);

  const refresh = useCallback(() => {
    if (user) {
      loadCloudState(user.id).then(s => { if (s) setState(s); });
    } else {
      setState(loadState());
    }
  }, [user]);

  // Optimistic helper: apply state change immediately and queue network failures for the next online return
  const optimistic = useCallback((
    updater: (prev: AppState) => AppState,
    cloudOp: () => PromiseLike<{ error: any }>,
    label: string,
    pendingOp?: PendingCloudOp
  ) => {
    setState(prev => {
      const next = updater(prev);
      debouncedSave(next);
      return next;
    });
    if (user) {
      cloudOp().then(({ error }) => {
        if (error) {
          console.error(`Failed to save ${label}:`, error);
          if (pendingOp && shouldQueueCloudError(error)) enqueuePending(user.id, pendingOp);
          else toast.error(`Couldn't save ${label}.`);
        }
      });
    }
  }, [user]);

  const addCheckIn = useCallback((emotionalState: CheckIn['state'], note?: string) => {
    const err = validateOrError(checkInSchema, { state: emotionalState, note });
    if (err) { toast.error(err); return; }
    const checkIn: CheckIn = { id: generateId(), state: emotionalState, note, createdAt: new Date().toISOString() };
    optimistic(
      prev => ({ ...prev, checkIns: [checkIn, ...prev.checkIns] }),
      () => supabase.from('check_ins').insert({ user_id: user!.id, id: checkIn.id, state: emotionalState, note, created_at: checkIn.createdAt }),
      'check-in',
      { type: 'checkIn', payload: checkIn }
    );
  }, [user, optimistic]);

  const completeOnboarding = useCallback((data: { reason: string; style: string; challenge: string; companionName?: string; companionSigil?: string; freeCurrent?: string }) => {
    const err = validateOrError(onboardingSchema, data);
    if (err) { toast.error(err); return; }
    optimistic(
      prev => ({ ...prev, onboarding: { ...data, completed: true } }),
      () => supabase.from('profiles').update({
        onboarding_completed: true,
        onboarding_reason: data.reason,
        onboarding_style: data.style,
        onboarding_challenge: data.challenge,
        companion_name: data.companionName,
        companion_sigil: data.companionSigil,
        free_current: data.freeCurrent,
      }).eq('user_id', user!.id),
      'onboarding'
    );
  }, [user, optimistic]);

  // FIX: use functional setState to avoid stale closure over state.todayFlow
  const updateTodayFlow = useCallback((updates: Partial<TodayFlow>) => {
    setState(prev => {
      const merged = { ...prev.todayFlow, ...updates };
      const next = { ...prev, todayFlow: merged };
      debouncedSave(next);
      // Fire-and-forget cloud sync with the merged value
      if (user) upsertTodayFlow(user.id, merged).then(({ error }) => {
        if (error && shouldQueueCloudError(error)) enqueuePending(user.id, { type: 'todayFlow', payload: merged });
      });
      return next;
    });
  }, [user]);

  const saveWheel = useCallback((wheel: Omit<Wheel, 'id' | 'createdAt' | 'updatedAt'>) => {
    const err = validateOrError(wheelSchema, wheel);
    if (err) { toast.error(err); return; }
    const now = new Date().toISOString();
    const id = generateId();
    const full: Wheel = { ...wheel, id, createdAt: now, updatedAt: now };
    optimistic(
      prev => ({ ...prev, wheels: [full, ...prev.wheels] }),
      () => supabase.from('wheels').insert({
        user_id: user!.id, title: wheel.title, center_text: wheel.centerText,
        segments: wheel.segments as any, type: wheel.type, completion_status: wheel.completionStatus,
      }),
      'wheel'
    );
  }, [user, optimistic]);

  const saveGatheredSequence = useCallback((seq: Omit<GatheredSequence, 'id' | 'createdAt'>) => {
    const err = validateOrError(gatheredSequenceSchema, seq);
    if (err) { toast.error(err); return; }
    const full = { ...seq, id: generateId(), createdAt: new Date().toISOString() };
    optimistic(
      prev => ({ ...prev, gatheredSequences: [full, ...prev.gatheredSequences] }),
      () => supabase.from('gathered_sequences').insert({
        user_id: user!.id, title: seq.title, lines: seq.lines as any,
        playback_settings: seq.playbackSettings as any,
      }),
      'sequence'
    );
  }, [user, optimistic]);

  const saveMomentumSession = useCallback((session: Omit<MomentumSession, 'id' | 'createdAt'>) => {
    const err = validateOrError(momentumSessionSchema, session);
    if (err) { toast.error(err); return; }
    const full = { ...session, id: generateId(), createdAt: new Date().toISOString() };
    optimistic(
      prev => ({ ...prev, momentumSessions: [full, ...prev.momentumSessions] }),
      () => supabase.from('momentum_sessions').insert({
        user_id: user!.id, id: full.id, phrase: session.phrase, duration: session.duration, completed: session.completed, created_at: full.createdAt,
      }),
      'momentum session',
      { type: 'momentumSession', payload: full }
    );
  }, [user, optimistic]);

  const saveFuturePage = useCallback((page: Omit<FuturePage, 'id' | 'createdAt'>) => {
    const err = validateOrError(futurePageSchema, page);
    if (err) { toast.error(err); return; }
    const full = { ...page, id: generateId(), createdAt: new Date().toISOString() };
    optimistic(
      prev => ({ ...prev, futurePages: [full, ...prev.futurePages] }),
      () => supabase.from('future_pages').insert({
        user_id: user!.id, title: page.title, template: page.template,
        content: page.content, vibe_check: page.vibeCheck,
      }),
      'future page'
    );
  }, [user, optimistic]);

  const saveImagineIfEntry = useCallback((entry: Omit<ImagineIfEntry, 'id' | 'createdAt'>) => {
    const err = validateOrError(imagineIfSchema, entry);
    if (err) { toast.error(err); return; }
    const full = { ...entry, id: generateId(), createdAt: new Date().toISOString() };
    optimistic(
      prev => ({ ...prev, imagineIfEntries: [full, ...prev.imagineIfEntries] }),
      () => supabase.from('imagine_if_entries').insert({ user_id: user!.id, category: entry.category, text: entry.text }),
      'imagine-if entry'
    );
  }, [user, optimistic]);

  const saveOverflowEntry = useCallback((entry: Omit<OverflowEntry, 'id' | 'createdAt'>) => {
    const err = validateOrError(overflowSchema, entry);
    if (err) { toast.error(err); return; }
    const full = { ...entry, id: generateId(), createdAt: new Date().toISOString() };
    optimistic(
      prev => ({ ...prev, overflowEntries: [full, ...prev.overflowEntries] }),
      () => supabase.from('overflow_entries').insert({
        user_id: user!.id, mode: entry.mode, resource_amount: entry.resourceAmount,
        entry_text: entry.entryText, feeling_text: entry.feelingText, resistance_note: entry.resistanceNote,
      }),
      'overflow entry'
    );
  }, [user, optimistic]);

  const saveCustomRitual = useCallback((ritual: Omit<CustomRitual, 'id' | 'createdAt'>) => {
    const err = validateOrError(customRitualSchema, ritual);
    if (err) { toast.error(err); return; }
    const full = { ...ritual, id: generateId(), createdAt: new Date().toISOString() };
    optimistic(
      prev => ({ ...prev, customRituals: [full, ...prev.customRituals] }),
      () => supabase.from('custom_rituals').insert({
        user_id: user!.id, name: ritual.name, steps: ritual.steps as any, duration_estimate: ritual.durationEstimate,
      }),
      'custom ritual'
    );
  }, [user, optimistic]);

  const saveResistanceEntry = useCallback((entry: Omit<ResistanceEntry, 'id' | 'createdAt'>) => {
    const err = validateOrError(resistanceEntrySchema, entry);
    if (err) { toast.error(err); return; }
    const full = { ...entry, id: generateId(), createdAt: new Date().toISOString() };
    optimistic(
      prev => ({ ...prev, resistanceEntries: [full, ...(prev.resistanceEntries || [])] }),
      () => supabase.from('resistance_entries').insert({
        user_id: user!.id, trigger_type: entry.triggerType, body_location: entry.bodyLocation,
        charge_before: entry.chargeBefore, charge_after: entry.chargeAfter,
        clearing_mode: entry.clearingMode, softened_statement: entry.softenedStatement,
      }),
      'resistance entry'
    );
  }, [user, optimistic]);

  const saveThoughtShift = useCallback((shift: Omit<ThoughtShift, 'id' | 'createdAt'>) => {
    const err = validateOrError(thoughtShiftSchema, shift);
    if (err) { toast.error(err); return; }
    const full = { ...shift, id: generateId(), createdAt: new Date().toISOString() };
    optimistic(
      prev => ({ ...prev, thoughtShifts: [full, ...(prev.thoughtShifts || [])] }),
      () => supabase.from('thought_shifts').insert({
        user_id: user!.id, original_thought: shift.originalThought, charge_type: shift.chargeType,
        softer_statement: shift.softerStatement, believable_statement: shift.believableStatement,
        support_statement: shift.supportStatement,
      }),
      'thought shift'
    );
  }, [user, optimistic]);

  // Memoize context value to prevent re-renders when callbacks haven't changed
  const contextValue = useMemo(() => ({
    state, refresh, addCheckIn, completeOnboarding, updateTodayFlow,
    saveWheel, saveGatheredSequence, saveMomentumSession, saveFuturePage,
    saveImagineIfEntry, saveOverflowEntry, saveCustomRitual,
    saveResistanceEntry, saveThoughtShift, pendingSyncCount,
  }), [
    state, refresh, addCheckIn, completeOnboarding, updateTodayFlow,
    saveWheel, saveGatheredSequence, saveMomentumSession, saveFuturePage,
    saveImagineIfEntry, saveOverflowEntry, saveCustomRitual,
    saveResistanceEntry, saveThoughtShift, pendingSyncCount,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

// Batch migrate local data to cloud (eliminates N+1 individual inserts)
async function migrateToCloud(userId: string, local: AppState) {
  const promises: PromiseLike<any>[] = [];

  if (local.onboarding.completed) {
    promises.push(
      supabase.from('profiles').update({
        onboarding_completed: true,
        onboarding_reason: local.onboarding.reason,
        onboarding_style: local.onboarding.style,
        onboarding_challenge: local.onboarding.challenge,
      }).eq('user_id', userId).select()
    );
  }

  // Batch inserts: collect rows per table and insert in one call each
  if (local.checkIns.length > 0) {
    promises.push(supabase.from('check_ins').insert(
      local.checkIns.map(c => ({ user_id: userId, state: c.state, note: c.note }))
    ));
  }
  if (local.wheels.length > 0) {
    promises.push(supabase.from('wheels').insert(
      local.wheels.map(w => ({
        user_id: userId, title: w.title, center_text: w.centerText,
        segments: w.segments as any, type: w.type, completion_status: w.completionStatus,
      }))
    ));
  }
  if (local.gatheredSequences.length > 0) {
    promises.push(supabase.from('gathered_sequences').insert(
      local.gatheredSequences.map(s => ({
        user_id: userId, title: s.title, lines: s.lines as any, playback_settings: s.playbackSettings as any,
      }))
    ));
  }
  if (local.momentumSessions.length > 0) {
    promises.push(supabase.from('momentum_sessions').insert(
      local.momentumSessions.map(m => ({
        user_id: userId, phrase: m.phrase, duration: m.duration, completed: m.completed,
      }))
    ));
  }
  if (local.futurePages.length > 0) {
    promises.push(supabase.from('future_pages').insert(
      local.futurePages.map(f => ({
        user_id: userId, title: f.title, template: f.template, content: f.content, vibe_check: f.vibeCheck,
      }))
    ));
  }
  if (local.imagineIfEntries.length > 0) {
    promises.push(supabase.from('imagine_if_entries').insert(
      local.imagineIfEntries.map(e => ({ user_id: userId, category: e.category, text: e.text }))
    ));
  }
  if (local.overflowEntries.length > 0) {
    promises.push(supabase.from('overflow_entries').insert(
      local.overflowEntries.map(e => ({
        user_id: userId, mode: e.mode, resource_amount: e.resourceAmount,
        entry_text: e.entryText, feeling_text: e.feelingText, resistance_note: e.resistanceNote,
      }))
    ));
  }
  if (local.customRituals.length > 0) {
    promises.push(supabase.from('custom_rituals').insert(
      local.customRituals.map(r => ({
        user_id: userId, name: r.name, steps: r.steps as any, duration_estimate: r.durationEstimate,
      }))
    ));
  }
  if ((local.resistanceEntries || []).length > 0) {
    promises.push(supabase.from('resistance_entries').insert(
      (local.resistanceEntries || []).map(r => ({
        user_id: userId, trigger_type: r.triggerType, body_location: r.bodyLocation,
        charge_before: r.chargeBefore, charge_after: r.chargeAfter,
        clearing_mode: r.clearingMode, softened_statement: r.softenedStatement,
      }))
    ));
  }
  if ((local.thoughtShifts || []).length > 0) {
    promises.push(supabase.from('thought_shifts').insert(
      (local.thoughtShifts || []).map(t => ({
        user_id: userId, original_thought: t.originalThought, charge_type: t.chargeType,
        softer_statement: t.softerStatement, believable_statement: t.believableStatement,
        support_statement: t.supportStatement,
      }))
    ));
  }

  await Promise.allSettled(promises);
}
