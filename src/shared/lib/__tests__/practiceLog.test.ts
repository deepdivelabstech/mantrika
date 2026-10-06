import {
  addDays,
  DAILY_LOG_DAYS,
  dayTotal,
  lastNDates,
  recordBead,
  sankalpaStatus,
} from '@/shared/lib/practiceLog';
import type { Sankalpa } from '@/shared/types/models';

describe('date helpers', () => {
  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('lists the last n dates oldest first', () => {
    expect(lastNDates('2026-03-02', 3)).toEqual(['2026-02-28', '2026-03-01', '2026-03-02']);
  });
});

describe('recordBead', () => {
  it('increments the mantra for the day without mutating the input', () => {
    const log = { '2026-01-10': { a: 2 } };
    const next = recordBead(log, '2026-01-10', 'a');
    expect(next['2026-01-10']).toEqual({ a: 3 });
    expect(log['2026-01-10']).toEqual({ a: 2 });
    expect(dayTotal(recordBead(next, '2026-01-10', 'b')['2026-01-10'])).toBe(4);
  });

  it('prunes days older than the retention window on a new day', () => {
    const old = addDays('2026-01-10', -DAILY_LOG_DAYS);
    const kept = addDays('2026-01-10', -(DAILY_LOG_DAYS - 1));
    const next = recordBead({ [old]: { a: 1 }, [kept]: { a: 1 } }, '2026-01-10', 'a');
    expect(Object.keys(next).sort()).toEqual([kept, '2026-01-10'].sort());
  });
});

describe('sankalpaStatus', () => {
  const vow: Sankalpa = {
    mantraId: 'a',
    targetBeads: 1000,
    days: 10,
    startDate: '2026-01-01',
    count: 400,
  };

  it('reports the day, pace and progress mid-vow', () => {
    expect(sankalpaStatus(vow, '2026-01-05')).toMatchObject({
      dayNumber: 5,
      daysLeft: 6,
      fraction: 0.4,
      perDayNeeded: 100,
      completed: false,
      expired: false,
    });
  });

  it('marks expiry after the last day and completion at the target', () => {
    expect(sankalpaStatus(vow, '2026-01-11')).toMatchObject({ expired: true, dayNumber: 10 });
    expect(sankalpaStatus({ ...vow, count: 1000 }, '2026-01-11')).toMatchObject({
      completed: true,
      expired: false,
    });
  });
});
