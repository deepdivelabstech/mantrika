import { daysBetween } from './dateHelpers';

export const ACTIVE_DATES_HISTORY_LIMIT = 30;

export type StreakUpdateInput = {
  today: string; // ISO 'yyyy-mm-dd'
  lastActiveDate: string; // ISO, '' if never active
  streakDays: number;
  activeDates: string[];
};

export type StreakUpdateResult = {
  streakDays: number;
  lastActiveDate: string;
  activeDates: string[];
};

/**
 * Called once per bead tap (idempotent per-day). The streak increments the
 * first time a user counts on a new calendar day that is exactly one day
 * after their last active day; a gap of 2+ days resets it to 1; counting
 * again later the same day is a no-op.
 */
export function updateStreakOnActivity(input: StreakUpdateInput): StreakUpdateResult {
  const { today, lastActiveDate, streakDays, activeDates } = input;

  if (lastActiveDate === today) {
    return { streakDays: Math.max(streakDays, 1), lastActiveDate, activeDates };
  }

  const gap = lastActiveDate ? daysBetween(lastActiveDate, today) : null;
  const nextStreak = gap === 1 ? streakDays + 1 : 1;

  const nextActiveDates = [...activeDates, today].slice(-ACTIVE_DATES_HISTORY_LIMIT);

  return { streakDays: nextStreak, lastActiveDate: today, activeDates: nextActiveDates };
}

/**
 * A streak "survives" a day boundary only through today or yesterday's
 * activity; anything older means the streak already lapsed even though the
 * stored counter hasn't been reset yet (e.g. app was closed for a week).
 */
export function isStreakLapsed(today: string, lastActiveDate: string): boolean {
  if (!lastActiveDate) return false;
  const gap = daysBetween(lastActiveDate, today);
  return gap > 1;
}
