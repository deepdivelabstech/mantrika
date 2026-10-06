import {
  selectBeadsToday,
  selectRoundsToday,
  selectStreakDays,
  useProgressStore,
} from '@/shared/store/useProgressStore';
import type { ProgressState } from '@/shared/types/models';

const base: ProgressState = {
  currentMantraId: 'om-namah-shivaya',
  beadsToday: 42,
  roundsToday: 3,
  totalBeadsLifetime: 1000,
  streakDays: 12,
  lastActiveDate: '2026-01-10',
  activeDates: ['2026-01-10'],
};

describe('progress selectors', () => {
  it('report stored daily counts on the same day', () => {
    expect(selectBeadsToday(base, '2026-01-10')).toBe(42);
    expect(selectRoundsToday(base, '2026-01-10')).toBe(3);
  });

  it('report zero daily counts once the day has rolled over', () => {
    expect(selectBeadsToday(base, '2026-01-11')).toBe(0);
    expect(selectRoundsToday(base, '2026-01-11')).toBe(0);
  });

  it('keep the streak through yesterday and drop it after a gap', () => {
    expect(selectStreakDays(base, '2026-01-11')).toBe(12);
    expect(selectStreakDays(base, '2026-01-17')).toBe(0);
  });
});

describe('undoLastBead', () => {
  beforeEach(() => {
    useProgressStore.setState({ ...base, undoStack: [] });
  });

  it('reverts taps one at a time', () => {
    const { tapBead, undoLastBead } = useProgressStore.getState();
    const day = new Date('2026-01-10T09:00:00');
    tapBead(day);
    tapBead(day);
    expect(useProgressStore.getState().beadsToday).toBe(44);

    undoLastBead();
    expect(useProgressStore.getState().beadsToday).toBe(43);
    undoLastBead();
    expect(useProgressStore.getState()).toMatchObject(base);
    expect(useProgressStore.getState().undoStack).toHaveLength(0);
  });

  it('restores streak and daily counts when undoing a day-rollover tap', () => {
    useProgressStore.getState().tapBead(new Date('2026-01-11T07:00:00'));
    expect(useProgressStore.getState()).toMatchObject({ beadsToday: 1, streakDays: 13 });

    useProgressStore.getState().undoLastBead();
    expect(useProgressStore.getState()).toMatchObject(base);
  });

  it('is a no-op with nothing to undo', () => {
    useProgressStore.getState().undoLastBead();
    expect(useProgressStore.getState()).toMatchObject(base);
  });
});
