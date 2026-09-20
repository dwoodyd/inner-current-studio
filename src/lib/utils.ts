import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Local calendar date (YYYY-MM-DD) in the member's own timezone.
 * Never use `new Date().toISOString().slice(0, 10)` for day-boundary logic —
 * that is UTC and members west of UTC lose "today" for hours each evening.
 */
export function localDateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
