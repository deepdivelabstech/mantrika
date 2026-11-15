import {
  AD_FREE_MS,
  canRestoreStreak,
  INTERSTITIAL_MIN_GAP_MS,
  isAdFree,
  isRestorableGap,
  shouldShowInterstitial,
} from '@/shared/lib/adPacing';

describe('shouldShowInterstitial', () => {
  const due = {
    now: INTERSTITIAL_MIN_GAP_MS * 10,
    lastShownAt: 0,
    sessionsSinceShown: 2,
    activeDays: 5,
  };

  it('shows once every condition is met', () => {
    expect(shouldShowInterstitial(due)).toBe(true);
  });

  it('waits for enough completed sessions', () => {
    expect(shouldShowInterstitial({ ...due, sessionsSinceShown: 1 })).toBe(false);
  });

  it('respects the minimum gap since the last one', () => {
    expect(
      shouldShowInterstitial({ ...due, lastShownAt: due.now - INTERSTITIAL_MIN_GAP_MS + 1 }),
    ).toBe(false);
    expect(shouldShowInterstitial({ ...due, lastShownAt: due.now - INTERSTITIAL_MIN_GAP_MS })).toBe(
      true,
    );
  });

  it('spares new practitioners', () => {
    expect(shouldShowInterstitial({ ...due, activeDays: 2 })).toBe(false);
  });
});

describe('canRestoreStreak', () => {
  const ok = {
    today: '2026-01-12',
    lastActiveDate: '2026-01-10',
    streakDays: 5,
    lastRestoreDate: '',
  };

  it('allows a restore after one or two missed days', () => {
    expect(canRestoreStreak(ok)).toBe(true);
    expect(canRestoreStreak({ ...ok, lastActiveDate: '2026-01-09' })).toBe(true);
  });

  it('refuses when no day, or more than two days, were missed', () => {
    expect(canRestoreStreak({ ...ok, lastActiveDate: '2026-01-11' })).toBe(false);
    expect(canRestoreStreak({ ...ok, lastActiveDate: '2026-01-12' })).toBe(false);
    expect(canRestoreStreak({ ...ok, lastActiveDate: '2026-01-08' })).toBe(false);
    expect(canRestoreStreak({ ...ok, lastActiveDate: '' })).toBe(false);
  });

  it('refuses streaks too short to matter', () => {
    expect(canRestoreStreak({ ...ok, streakDays: 1 })).toBe(false);
  });

  it('enforces the three-day cooldown between restores', () => {
    expect(canRestoreStreak({ ...ok, lastRestoreDate: '2026-01-10' })).toBe(false);
    expect(canRestoreStreak({ ...ok, lastRestoreDate: '2026-01-09' })).toBe(true);
  });
});

describe('isRestorableGap', () => {
  it('bridges only gaps of one or two missed days', () => {
    expect([0, 1, 2, 3, 4].map(isRestorableGap)).toEqual([false, false, true, true, false]);
  });
});

describe('isAdFree', () => {
  it('runs until the granted time, then ends', () => {
    const until = 1_000 + AD_FREE_MS;
    expect(isAdFree(1_000, until)).toBe(true);
    expect(isAdFree(until - 1, until)).toBe(true);
    expect(isAdFree(until, until)).toBe(false);
    expect(isAdFree(1_000, 0)).toBe(false);
  });
});
