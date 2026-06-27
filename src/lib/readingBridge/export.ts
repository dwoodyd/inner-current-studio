// Local export helpers — let a user download everything Inner Wake knows
// about their Reading Bridge journey (chapter, progress timeline, event log).
// All data comes from localStorage; no network call required.

import { CHAPTERS, type ChapterId } from './config';
import { readBridgeEvents, type ReadingBridgeEventRecord } from './analytics';
import type { ChapterProgressEntry } from './useReadingBridge';

export interface BridgeExportPayload {
  exportedAt: string;
  app: 'inner-wake';
  feature: 'reading-bridge';
  version: 1;
  chapter: ChapterId | null;
  optedOut: boolean;
  promptDismissed: boolean;
  progress: ChapterProgressEntry[];
  events: ReadingBridgeEventRecord[];
}

function readLocal(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

export function buildExportPayload(): BridgeExportPayload {
  const stored = readLocal('iw_rb_chapter_v1');
  const chapter = stored && stored !== 'none' ? (stored as ChapterId) : null;
  const optedOut = stored === 'none';
  const promptDismissed = readLocal('iw_rb_prompt_v1') === '1';
  let progress: ChapterProgressEntry[] = [];
  try { progress = JSON.parse(readLocal('iw_rb_progress_v1') ?? '[]'); } catch { /* ignore */ }
  return {
    exportedAt: new Date().toISOString(),
    app: 'inner-wake',
    feature: 'reading-bridge',
    version: 1,
    chapter,
    optedOut,
    promptDismissed,
    progress: Array.isArray(progress) ? progress : [],
    events: readBridgeEvents(),
  };
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportBridgeAsJSON() {
  const payload = buildExportPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  download(blob, `inner-wake-reading-bridge-${Date.now()}.json`);
}

const CHAPTER_LABEL: Record<string, string> = Object.fromEntries(
  CHAPTERS.map((c) => [c.id, c.label]),
);

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportBridgeAsCSV() {
  const payload = buildExportPayload();
  const lines: string[] = [];
  lines.push('# Reading Bridge — Progress');
  lines.push('chapter_id,chapter_label,first_at,last_at,visits');
  for (const p of payload.progress) {
    lines.push([
      p.chapter,
      CHAPTER_LABEL[p.chapter] ?? p.chapter,
      new Date(p.firstAt).toISOString(),
      new Date(p.lastAt).toISOString(),
      p.visits,
    ].map(csvEscape).join(','));
  }
  lines.push('');
  lines.push('# Reading Bridge — Events');
  lines.push('timestamp,event,meta');
  for (const e of payload.events) {
    lines.push([new Date(e.ts).toISOString(), e.event, e.meta ?? null].map(csvEscape).join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  download(blob, `inner-wake-reading-bridge-${Date.now()}.csv`);
}
