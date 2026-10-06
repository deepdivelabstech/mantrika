import type { DailyLog, Sankalpa } from '@/shared/types/models';

import { daysBetween, toLocalDateString } from './dateHelpers';

/** A year of weekly columns, so the Progress heatmap and week chart never run out of history. */
export const DAILY_LOG_DAYS = 371;

/** ISO date `n` days after `iso` (negative to go back), in local time. */
export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toLocalDateString(d);
}

/** The last `n` ISO dates ending with `today`, oldest first. */
export function lastNDates(today: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - (n - 1)));
}

export function dayTotal(entry: Record<string, number> | undefined): number {
  if (!entry) return 0;
  let sum = 0;
  for (const k in entry) sum += entry[k] ?? 0;
  return sum;
}

function pruneLog(log: DailyLog, today: string): DailyLog {
  const cutoff = addDays(today, -(DAILY_LOG_DAYS - 1));
  const out: DailyLog = {};
  for (const date in log) {
    if (date >= cutoff) out[date] = log[date]!;
  }
  return out;
}

/**
 * Adds one bead for `mantraId` on `today`. Runs on every tap, so it copies only
 * the outer map and today's entry; pruning happens once, on a day's first bead.
 */
export function recordBead(log: DailyLog, today: string, mantraId: string): DailyLog {
  const entry = log[today];
  const base = entry ? log : pruneLog(log, today);
  return { ...base, [today]: { ...entry, [mantraId]: (entry?.[mantraId] ?? 0) + 1 } };
}

export function isInSankalpaWindow(s: Sankalpa, today: string): boolean {
  const offset = daysBetween(s.startDate, today);
  return offset >= 0 && offset < s.days;
}

export type SankalpaStatus = {
  dayNumber: number; // 1-based, clamped to the vow's length
  daysLeft: number; // including today
  fraction: number;
  remaining: number;
  /** Beads per day (including today) needed to finish on time. */
  perDayNeeded: number;
  completed: boolean;
  expired: boolean;
};

export function sankalpaStatus(s: Sankalpa, today: string): SankalpaStatus {
  const offset = daysBetween(s.startDate, today);
  const dayNumber = Math.min(Math.max(offset + 1, 1), s.days);
  const daysLeft = Math.max(0, s.days - Math.max(offset, 0));
  const remaining = Math.max(0, s.targetBeads - s.count);
  const completed = remaining === 0;
  return {
    dayNumber,
    daysLeft,
    fraction: s.targetBeads > 0 ? Math.min(1, s.count / s.targetBeads) : 0,
    remaining,
    perDayNeeded: daysLeft > 0 ? Math.ceil(remaining / daysLeft) : remaining,
    completed,
    expired: !completed && daysLeft === 0,
  };
}
