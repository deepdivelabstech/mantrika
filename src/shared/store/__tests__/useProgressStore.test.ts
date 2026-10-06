import {
  migrateProgress,
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
  dailyLog: { '2026-01-10': { 'om-namah-shivaya': 366 } },
  mantraTotals: { 'om-namah-shivaya': 366 },
  bestStreak: 12,
  sankalpa: null,
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

describe('practice log', () => {
  beforeEach(() => {
    useProgressStore.setState({ ...base, undoStack: [] });
  });

  it("logs each bead per day and mantra and reports today's total", () => {
    const { tapBead, setCurrentMantra } = useProgressStore.getState();
    const day = new Date('2026-01-10T09:00:00');
    expect(tapBead(day).todayTotal).toBe(367);
    setCurrentMantra('gayatri-mantra');
    expect(tapBead(day).todayTotal).toBe(368);
    const s = useProgressStore.getState();
    expect(s.dailyLog['2026-01-10']).toEqual({ 'om-namah-shivaya': 367, 'gayatri-mantra': 1 });
    expect(s.mantraTotals).toEqual({ 'om-namah-shivaya': 367, 'gayatri-mantra': 1 });
  });

  it('flags the bead that completes a round', () => {
    useProgressStore.setState({ beadsToday: 107, roundsToday: 0 });
    const r = useProgressStore.getState().tapBead(new Date('2026-01-10T09:00:00'));
    expect(r).toMatchObject({ roundCompleted: true, roundsToday: 1 });
    const next = useProgressStore.getState().tapBead(new Date('2026-01-10T09:00:01'));
    expect(next.roundCompleted).toBe(false);
  });

  it('starts a fresh day entry and keeps the best streak', () => {
    const r = useProgressStore.getState().tapBead(new Date('2026-01-11T07:00:00'));
    expect(r.todayTotal).toBe(1);
    expect(useProgressStore.getState()).toMatchObject({ streakDays: 13, bestStreak: 13 });
  });

  it('undo also reverts the log and totals', () => {
    useProgressStore.getState().tapBead(new Date('2026-01-10T09:00:00'));
    useProgressStore.getState().undoLastBead();
    expect(useProgressStore.getState()).toMatchObject(base);
  });
});

describe('sankalpa', () => {
  beforeEach(() => {
    useProgressStore.setState({ ...base, undoStack: [] });
    useProgressStore
      .getState()
      .setSankalpa(
        { mantraId: 'om-namah-shivaya', targetBeads: 2, days: 3 },
        new Date('2026-01-10T08:00:00'),
      );
  });

  it('counts only the vow mantra and reports completion once', () => {
    const { tapBead, setCurrentMantra } = useProgressStore.getState();
    setCurrentMantra('gayatri-mantra');
    tapBead(new Date('2026-01-10T09:00:00'));
    expect(useProgressStore.getState().sankalpa?.count).toBe(0);

    setCurrentMantra('om-namah-shivaya');
    expect(tapBead(new Date('2026-01-10T09:00:00')).sankalpaCompleted).toBe(false);
    expect(tapBead(new Date('2026-01-10T09:00:00')).sankalpaCompleted).toBe(true);
    expect(tapBead(new Date('2026-01-10T09:00:00')).sankalpaCompleted).toBe(false);
    expect(useProgressStore.getState().sankalpa?.count).toBe(2);
  });

  it('stops counting once the window has passed', () => {
    useProgressStore.getState().tapBead(new Date('2026-01-13T09:00:00'));
    expect(useProgressStore.getState().sankalpa?.count).toBe(0);
  });

  it('starts at day one with a clean undo stack', () => {
    useProgressStore.getState().tapBead(new Date('2026-01-10T09:00:00'));
    useProgressStore
      .getState()
      .setSankalpa(
        { mantraId: 'om-namah-shivaya', targetBeads: 10, days: 3 },
        new Date('2026-01-10T10:00:00'),
      );
    expect(useProgressStore.getState()).toMatchObject({
      sankalpa: { count: 0, startDate: '2026-01-10' },
      undoStack: [],
    });
  });
});

describe('migrateProgress', () => {
  it('seeds the last active day from its round and bead position', () => {
    const v1: Partial<ProgressState> = { ...base, roundsToday: 3, beadsToday: 42 };
    delete v1.dailyLog;
    delete v1.mantraTotals;
    delete v1.bestStreak;
    delete v1.sankalpa;
    const migrated = migrateProgress(v1);
    expect(migrated.dailyLog).toEqual({ '2026-01-10': { 'om-namah-shivaya': 366 } });
    expect(migrated.mantraTotals).toEqual({ 'om-namah-shivaya': 366 });
    expect(migrated.bestStreak).toBe(12);
    expect(migrated.sankalpa).toBeNull();
  });

  it('leaves v2 state untouched', () => {
    expect(migrateProgress(base)).toEqual(base);
  });
});

describe('restoreStreak', () => {
  beforeEach(() => useProgressStore.getState().replaceProgress(base));

  it('bridges exactly one missed day so the next tap extends the streak', () => {
    // Last active Jan 10, missed Jan 11, today Jan 12.
    useProgressStore.getState().restoreStreak(new Date(2026, 0, 12, 9));
    const s = useProgressStore.getState();
    expect(s.lastActiveDate).toBe('2026-01-11');
    expect(selectStreakDays(s, '2026-01-12')).toBe(12);
    expect(s.activeDates).toEqual(['2026-01-10']);

    s.tapBead(new Date(2026, 0, 12, 9));
    expect(useProgressStore.getState().streakDays).toBe(13);
  });

  it('does nothing when the gap is not exactly one missed day', () => {
    useProgressStore.getState().restoreStreak(new Date(2026, 0, 14, 9));
    expect(useProgressStore.getState().lastActiveDate).toBe('2026-01-10');
    useProgressStore.getState().restoreStreak(new Date(2026, 0, 11, 9));
    expect(useProgressStore.getState().lastActiveDate).toBe('2026-01-10');
  });
});
