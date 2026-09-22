import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { advanceBead } from '@/shared/lib/beadMath';
import { toLocalDateString } from '@/shared/lib/dateHelpers';
import { updateStreakOnActivity } from '@/shared/lib/streak';
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

type ProgressStore = ProgressState & {
  setCurrentMantra: (id: string) => void;
  /** One bead tap: advances the mala position, rolls the daily/streak counters, and bumps lifetime total. */
  tapBead: (now?: Date) => void;
  resetToday: (now?: Date) => void;
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_PROGRESS,
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

        set({
          beadsToday: beads,
          roundsToday: roundsBase + roundsCompleted,
          totalBeadsLifetime: state.totalBeadsLifetime + 1,
          streakDays: streak.streakDays,
          lastActiveDate: streak.lastActiveDate,
          activeDates: streak.activeDates,
        });
      },
      resetToday: (now = new Date()) => {
        set({ beadsToday: 0, roundsToday: 0, lastActiveDate: toLocalDateString(now) });
      },
    }),
    { name: 'mantrika.progress.v1', storage: asyncStorageAdapter },
  ),
);
