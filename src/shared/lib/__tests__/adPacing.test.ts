import {
  canRestoreStreak,
  INTERSTITIAL_MIN_GAP_MS,
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

  it('allows a restore after exactly one missed day', () => {
    expect(canRestoreStreak(ok)).toBe(true);
  });

  it('refuses when no day, or more than one day, was missed', () => {
    expect(canRestoreStreak({ ...ok, lastActiveDate: '2026-01-11' })).toBe(false);
    expect(canRestoreStreak({ ...ok, lastActiveDate: '2026-01-09' })).toBe(false);
    expect(canRestoreStreak({ ...ok, lastActiveDate: '' })).toBe(false);
  });

  it('refuses streaks too short to matter', () => {
    expect(canRestoreStreak({ ...ok, streakDays: 1 })).toBe(false);
  });

  it('enforces the cooldown between restores', () => {
    expect(canRestoreStreak({ ...ok, lastRestoreDate: '2026-01-08' })).toBe(false);
    expect(canRestoreStreak({ ...ok, lastRestoreDate: '2026-01-05' })).toBe(true);
  });
});
