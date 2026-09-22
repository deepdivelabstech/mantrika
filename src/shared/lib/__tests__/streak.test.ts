import { isStreakLapsed, updateStreakOnActivity } from '@/shared/lib/streak';

describe('updateStreakOnActivity', () => {
  it('starts a streak at 1 on first-ever activity', () => {
    const result = updateStreakOnActivity({
      today: '2026-01-10',
      lastActiveDate: '',
      streakDays: 0,
      activeDates: [],
    });
    expect(result).toEqual({
      streakDays: 1,
      lastActiveDate: '2026-01-10',
      activeDates: ['2026-01-10'],
    });
  });

  it('increments the streak on the very next calendar day', () => {
    const result = updateStreakOnActivity({
      today: '2026-01-11',
      lastActiveDate: '2026-01-10',
      streakDays: 1,
      activeDates: ['2026-01-10'],
    });
    expect(result.streakDays).toBe(2);
    expect(result.activeDates).toEqual(['2026-01-10', '2026-01-11']);
  });

  it('resets to 1 after a gap of two or more days', () => {
    const result = updateStreakOnActivity({
      today: '2026-01-15',
      lastActiveDate: '2026-01-10',
      streakDays: 5,
      activeDates: ['2026-01-10'],
    });
    expect(result.streakDays).toBe(1);
  });

  it('is a no-op for a second tap on the same day', () => {
    const result = updateStreakOnActivity({
      today: '2026-01-10',
      lastActiveDate: '2026-01-10',
      streakDays: 3,
      activeDates: ['2026-01-09', '2026-01-10'],
    });
    expect(result.streakDays).toBe(3);
    expect(result.activeDates).toEqual(['2026-01-09', '2026-01-10']);
  });

  it('caps the stored active-dates history', () => {
    const activeDates = Array.from(
      { length: 30 },
      (_, i) => `2026-01-${String(i + 1).padStart(2, '0')}`,
    );
    const result = updateStreakOnActivity({
      today: '2026-02-01',
      lastActiveDate: '2026-01-30',
      streakDays: 30,
      activeDates,
    });
    expect(result.activeDates.length).toBe(30);
    expect(result.activeDates[result.activeDates.length - 1]).toBe('2026-02-01');
  });
});

describe('isStreakLapsed', () => {
  it('is false with no prior activity', () => {
    expect(isStreakLapsed('2026-01-10', '')).toBe(false);
  });

  it('is false for today or yesterday', () => {
    expect(isStreakLapsed('2026-01-10', '2026-01-10')).toBe(false);
    expect(isStreakLapsed('2026-01-10', '2026-01-09')).toBe(false);
  });

  it('is true after a gap of two or more days', () => {
    expect(isStreakLapsed('2026-01-10', '2026-01-07')).toBe(true);
  });
});
