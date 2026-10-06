import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { advanceBead } from '@/shared/lib/beadMath';
import { daysBetween, toLocalDateString } from '@/shared/lib/dateHelpers';
import { dayTotal, isInSankalpaWindow, recordBead } from '@/shared/lib/practiceLog';
import { isStreakLapsed, updateStreakOnActivity } from '@/shared/lib/streak';
import { BEADS_PER_ROUND, type ProgressState, type Sankalpa } from '@/shared/types/models';

import { asyncStorageAdapter } from './persist';

const DEFAULT_PROGRESS: ProgressState = {
  currentMantraId: 'om-namah-shivaya',
  beadsToday: 0,
  roundsToday: 0,
  totalBeadsLifetime: 0,
  streakDays: 0,
  lastActiveDate: '',
  activeDates: [],
  dailyLog: {},
  mantraTotals: {},
  bestStreak: 0,
  sankalpa: null,
};

const UNDO_LIMIT = 20;
const PROGRESS_VERSION = 2;

type TapSnapshot = Omit<ProgressState, 'currentMantraId'>;

/** What a tap did, so the counter can mark rounds, goals and vows as they happen. */
export type TapResult = {
  roundCompleted: boolean;
  roundsToday: number;
  /** All beads counted today, across mantras and rounds. */
  todayTotal: number;
  sankalpaCompleted: boolean;
};

export type NewSankalpa = Pick<Sankalpa, 'mantraId' | 'targetBeads' | 'days'>;

type ProgressStore = ProgressState & {
  /** Pre-tap snapshots for "undo last bead"; session-only, never persisted. */
  undoStack: TapSnapshot[];
  setCurrentMantra: (id: string) => void;
  /** One bead tap: advances the mala position, logs the bead, rolls daily/streak counters, bumps totals. */
  tapBead: (now?: Date) => TapResult;
  /** Reverts the most recent tap exactly (including any streak/day rollover it caused). */
  undoLastBead: () => void;
  resetToday: (now?: Date) => void;
  setSankalpa: (next: NewSankalpa, now?: Date) => void;
  clearSankalpa: () => void;
  /**
   * Bridges a single missed day (last practice was the day before yesterday)
   * so the streak continues. The missed day is not logged as practice.
   */
  restoreStreak: (now?: Date) => void;
  /** Replaces all progress with an imported backup. */
  replaceProgress: (next: ProgressState) => void;
};

/** The persisted fields of the store, without actions or session-only state. */
export function pickProgress(s: ProgressState): ProgressState {
  return {
    currentMantraId: s.currentMantraId,
    beadsToday: s.beadsToday,
    roundsToday: s.roundsToday,
    totalBeadsLifetime: s.totalBeadsLifetime,
    streakDays: s.streakDays,
    lastActiveDate: s.lastActiveDate,
    activeDates: s.activeDates,
    dailyLog: s.dailyLog,
    mantraTotals: s.mantraTotals,
    bestStreak: s.bestStreak,
    sankalpa: s.sankalpa,
  };
}

/**
 * Upgrades v1 progress (no per-day log). The last active day's count is
 * recoverable from its round/bead position, so it seeds the log; older days
 * only survive as `activeDates`, and older lifetime beads stay unattributed.
 */
export function migrateProgress(old: Partial<ProgressState>): ProgressState {
  const merged = { ...DEFAULT_PROGRESS, ...old };
  if (old.dailyLog) return merged;
  const seeded = merged.roundsToday * BEADS_PER_ROUND + (merged.beadsToday % BEADS_PER_ROUND);
  const seed = merged.lastActiveDate && seeded > 0;
  return {
    ...merged,
    dailyLog: seed ? { [merged.lastActiveDate]: { [merged.currentMantraId]: seeded } } : {},
    mantraTotals: seed ? { [merged.currentMantraId]: seeded } : {},
    bestStreak: Math.max(merged.bestStreak, merged.streakDays),
  };
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_PROGRESS,
      undoStack: [],
      setCurrentMantra: (currentMantraId) => set({ currentMantraId }),
      tapBead: (now = new Date()) => {
        const state = get();
        const today = toLocalDateString(now);
        const mantraId = state.currentMantraId;
        const dayRolledOver = state.lastActiveDate !== '' && state.lastActiveDate !== today;
        const beadsBase = dayRolledOver ? 0 : state.beadsToday;
        const roundsBase = dayRolledOver ? 0 : state.roundsToday;

        const { beads, roundsCompleted } = advanceBead(beadsBase);
        const streak = updateStreakOnActivity({
          today,
          lastActiveDate: state.lastActiveDate,
          streakDays: state.streakDays,
          activeDates: state.activeDates,
        });
        const dailyLog = recordBead(state.dailyLog, today, mantraId);

        const vow = state.sankalpa;
        const countsForVow =
          !!vow &&
          vow.mantraId === mantraId &&
          vow.count < vow.targetBeads &&
          isInSankalpaWindow(vow, today);
        const sankalpa = countsForVow ? { ...vow, count: vow.count + 1 } : vow;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { currentMantraId: _id, ...snapshot } = pickProgress(state);
        const roundsToday = roundsBase + roundsCompleted;

        set({
          beadsToday: beads,
          roundsToday,
          totalBeadsLifetime: state.totalBeadsLifetime + 1,
          streakDays: streak.streakDays,
          lastActiveDate: streak.lastActiveDate,
          activeDates: streak.activeDates,
          dailyLog,
          mantraTotals: {
            ...state.mantraTotals,
            [mantraId]: (state.mantraTotals[mantraId] ?? 0) + 1,
          },
          bestStreak: Math.max(state.bestStreak, streak.streakDays),
          sankalpa,
          undoStack: [...state.undoStack, snapshot].slice(-UNDO_LIMIT),
        });

        return {
          roundCompleted: roundsCompleted > 0,
          roundsToday,
          todayTotal: dayTotal(dailyLog[today]),
          sankalpaCompleted: countsForVow && sankalpa!.count === sankalpa!.targetBeads,
        };
      },
      undoLastBead: () => {
        const { undoStack } = get();
        const prev = undoStack[undoStack.length - 1];
        if (!prev) return;
        set({ ...prev, undoStack: undoStack.slice(0, -1) });
      },
      resetToday: (now = new Date()) => {
        set({
          beadsToday: 0,
          roundsToday: 0,
          lastActiveDate: toLocalDateString(now),
          undoStack: [],
        });
      },
      // Vow changes clear undo: a snapshot from before would restore the old vow.
      setSankalpa: (next, now = new Date()) =>
        set({
          sankalpa: { ...next, startDate: toLocalDateString(now), count: 0 },
          undoStack: [],
        }),
      clearSankalpa: () => set({ sankalpa: null, undoStack: [] }),
      restoreStreak: (now = new Date()) => {
        const { lastActiveDate } = get();
        if (!lastActiveDate || daysBetween(lastActiveDate, toLocalDateString(now)) !== 2) return;
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        set({ lastActiveDate: toLocalDateString(yesterday), undoStack: [] });
      },
      replaceProgress: (next) => set({ ...migrateProgress(next), undoStack: [] }),
    }),
    {
      name: 'mantrika.progress.v1',
      version: PROGRESS_VERSION,
      storage: asyncStorageAdapter,
      migrate: (persisted) => migrateProgress(persisted as Partial<ProgressState>),
      partialize: (state) => pickProgress(state),
    },
  ),
);

// Stored daily counters only reset on the next tap, so reads must check the
// date: yesterday's beads are not today's.
export const selectBeadsToday = (s: ProgressState, today: string) =>
  s.lastActiveDate === today ? s.beadsToday : 0;

export const selectRoundsToday = (s: ProgressState, today: string) =>
  s.lastActiveDate === today ? s.roundsToday : 0;

/** Every bead counted today, across mantras and rounds. */
export const selectTodayTotal = (s: ProgressState, today: string) => dayTotal(s.dailyLog[today]);

/** Stored streak, or 0 once it has lapsed (no activity today or yesterday). */
export const selectStreakDays = (s: ProgressState, today: string) =>
  isStreakLapsed(today, s.lastActiveDate) ? 0 : s.streakDays;
