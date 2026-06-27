// Lightweight, local-first event tracking for the Reading Bridge.
// Events are appended to localStorage so we can review where users pause or
// drop off without standing up a backend pipeline. The shape is intentionally
// minimal and stable so a future server sync can replay the same payloads.

export type ReadingBridgeEvent =
  | 'bridge_opened'           // user landed on /reading-bridge
  | 'bridge_chapter_selected' // user picked a chapter (selection completed)
  | 'bridge_opted_out'        // user tapped "Not reading it"
  | 'bridge_prompt_shown'     // Home prompt rendered for the first time in a session
  | 'bridge_prompt_dismissed' // user dismissed the Home prompt without selecting
  | 'bridge_note_shown'       // a contextual chapter↔state/current note rendered
  | 'bridge_note_dismissed';  // user dismissed the post-practice note

export interface ReadingBridgeEventRecord {
  event: ReadingBridgeEvent;
  ts: number;
  meta?: Record<string, string | number | boolean | null>;
}

const STORAGE_KEY = 'iw_rb_events_v1';
const MAX_EVENTS = 250;

function safeRead(): ReadingBridgeEventRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(list: ReadingBridgeEventRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-MAX_EVENTS)));
  } catch {
    /* quota or private-mode: silently drop */
  }
}

export function trackBridgeEvent(
  event: ReadingBridgeEvent,
  meta?: ReadingBridgeEventRecord['meta'],
) {
  const record: ReadingBridgeEventRecord = { event, ts: Date.now(), meta };
  const list = safeRead();
  // Suppress duplicate 'shown' events within the same minute to avoid noise
  // from re-renders.
  if (event === 'bridge_prompt_shown' || event === 'bridge_note_shown') {
    const last = list[list.length - 1];
    if (
      last &&
      last.event === event &&
      JSON.stringify(last.meta ?? {}) === JSON.stringify(meta ?? {}) &&
      record.ts - last.ts < 60_000
    ) {
      return;
    }
  }
  list.push(record);
  safeWrite(list);
}

export function readBridgeEvents(): ReadingBridgeEventRecord[] {
  return safeRead();
}

export function clearBridgeEvents() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}
