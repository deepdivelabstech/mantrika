import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { advanceBead } from '@/shared/lib/beadMath';
import { toLocalDateString } from '@/shared/lib/dateHelpers';
import { isStreakLapsed, updateStreakOnActivity } from '@/shared/lib/streak';
import type { ProgressState } from '@/shared/types/models';

import { asyncStorageAdapter } from './persist';

const DEFAULT_PROGRESS: ProgressState = {
  currentMantraId: 'om-namah-shivaya',
  beadsToday: 0,
  roundsToday: 0,
  totalBeadsLifetime: 0,
  streakDays: 0,
  lastActiveDate: '',
  activeDates: [],
};

const UNDO_LIMIT = 20;

type TapSnapshot = Omit<ProgressState, 'currentMantraId'>;

type ProgressStore = ProgressState & {
  /** Pre-tap snapshots for "undo last bead"; session-only, never persisted. */
  undoStack: TapSnapshot[];
  setCurrentMantra: (id: string) => void;
  /** One bead tap: advances the mala position, rolls the daily/streak counters, and bumps lifetime total. */
  tapBead: (now?: Date) => void;
  /** Reverts the most recent tap exactly (including any streak/day rollover it caused). */
  undoLastBead: () => void;
  resetToday: (now?: Date) => void;
  /** Replaces all progress with an imported backup. */
  replaceProgress: (next: ProgressState) => void;
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_PROGRESS,
      undoStack: [],
      setCurrentMantra: (currentMantraId) => set({ currentMantraId }),
      tapBead: (now = new Date()) => {
        const state = get();
        const today = toLocalDateString(now);
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

        const snapshot: TapSnapshot = {
          beadsToday: state.beadsToday,
          roundsToday: state.roundsToday,
          totalBeadsLifetime: state.totalBeadsLifetime,
          streakDays: state.streakDays,
          lastActiveDate: state.lastActiveDate,
          activeDates: state.activeDates,
        };

        set({
          beadsToday: beads,
          roundsToday: roundsBase + roundsCompleted,
          totalBeadsLifetime: state.totalBeadsLifetime + 1,
          streakDays: streak.streakDays,
          lastActiveDate: streak.lastActiveDate,
          activeDates: streak.activeDates,
          undoStack: [...state.undoStack, snapshot].slice(-UNDO_LIMIT),
        });
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
      replaceProgress: (next) => set({ ...next, undoStack: [] }),
    }),
    {
      name: 'mantrika.progress.v1',
      storage: asyncStorageAdapter,
      partialize: ({ undoStack: _undoStack, ...rest }) => rest,
    },
  ),
);

// Stored daily counters only reset on the next tap, so reads must check the
// date: yesterday's beads are not today's.
export const selectBeadsToday = (s: ProgressState, today: string) =>
  s.lastActiveDate === today ? s.beadsToday : 0;

export const selectRoundsToday = (s: ProgressState, today: string) =>
  s.lastActiveDate === today ? s.roundsToday : 0;

/** Stored streak, or 0 once it has lapsed (no activity today or yesterday). */
export const selectStreakDays = (s: ProgressState, today: string) =>
  isStreakLapsed(today, s.lastActiveDate) ? 0 : s.streakDays;
