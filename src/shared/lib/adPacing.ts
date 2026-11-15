import { daysBetween } from './dateHelpers';

/** At most one session-end interstitial per this window. */
export const INTERSTITIAL_MIN_GAP_MS = 10 * 60 * 1000;
/** Only every Nth completed session can end in an interstitial. */
export const SESSIONS_PER_INTERSTITIAL = 2;
/** New practitioners see no full-screen ads until they've practiced this many days. */
export const INTERSTITIAL_MIN_ACTIVE_DAYS = 3;

/** A rewarded streak restore can be used at most once per this many days. */
export const STREAK_RESTORE_COOLDOWN_DAYS = 3;
/** A lapsed streak can be restored when at most this many days were missed. */
export const STREAK_RESTORE_MAX_MISSED = 2;
/** How long one rewarded "ad-free" video hides banners and interstitials. */
export const AD_FREE_MS = 24 * 60 * 60 * 1000;

/** Whether ad-free time granted by a rewarded video is still running. */
export function isAdFree(now: number, adFreeUntil: number): boolean {
  return now < adFreeUntil;
}

/** True when a gap of `daysSinceActive` (1 = yesterday) can be bridged by a restore. */
export function isRestorableGap(daysSinceActive: number): boolean {
  return daysSinceActive >= 2 && daysSinceActive <= STREAK_RESTORE_MAX_MISSED + 1;
}
/** Streaks shorter than this aren't worth an ad to restore. */
export const STREAK_RESTORE_MIN_DAYS = 2;

export type InterstitialPacingInput = {
  now: number;
  lastShownAt: number; // epoch ms, 0 if never
  /** Completed sessions since the last interstitial, including the one just ending. */
  sessionsSinceShown: number;
  activeDays: number;
};

export function shouldShowInterstitial(input: InterstitialPacingInput): boolean {
  const { now, lastShownAt, sessionsSinceShown, activeDays } = input;
  return (
    activeDays >= INTERSTITIAL_MIN_ACTIVE_DAYS &&
    sessionsSinceShown >= SESSIONS_PER_INTERSTITIAL &&
    now - lastShownAt >= INTERSTITIAL_MIN_GAP_MS
  );
}

export type StreakRestoreInput = {
  today: string; // ISO 'yyyy-mm-dd'
  lastActiveDate: string;
  streakDays: number;
  lastRestoreDate: string; // '' if never
};

/**
 * A lapsed streak can be restored when one or two days were missed (last
 * practice was two or three days ago), and not again within the cooldown.
 */
export function canRestoreStreak(input: StreakRestoreInput): boolean {
  const { today, lastActiveDate, streakDays, lastRestoreDate } = input;
  if (!lastActiveDate || streakDays < STREAK_RESTORE_MIN_DAYS) return false;
  if (!isRestorableGap(daysBetween(lastActiveDate, today))) return false;
  return !lastRestoreDate || daysBetween(lastRestoreDate, today) >= STREAK_RESTORE_COOLDOWN_DAYS;
}
