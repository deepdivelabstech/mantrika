import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { asyncStorageAdapter } from './persist';

type AdStore = {
  lastInterstitialAt: number;
  sessionsSinceInterstitial: number;
  lastStreakRestoreDate: string;
  /** Rounds completed since the current practice session began; session-only, never persisted. */
  roundsThisSession: number;
  noteRoundCompleted: () => void;
  /** Ends the session; returns whether it counted (at least one full round). */
  endSession: () => boolean;
  markInterstitialShown: (now: number) => void;
  markStreakRestored: (today: string) => void;
};

/** Ad pacing state. Device-local on purpose: it is not part of backups. */
export const useAdStore = create<AdStore>()(
  persist(
    (set, get) => ({
      lastInterstitialAt: 0,
      sessionsSinceInterstitial: 0,
      lastStreakRestoreDate: '',
      roundsThisSession: 0,
      noteRoundCompleted: () => set((s) => ({ roundsThisSession: s.roundsThisSession + 1 })),
      endSession: () => {
        const counted = get().roundsThisSession > 0;
        set((s) => ({
          roundsThisSession: 0,
          sessionsSinceInterstitial: s.sessionsSinceInterstitial + (counted ? 1 : 0),
        }));
        return counted;
      },
      markInterstitialShown: (now) =>
        set({ lastInterstitialAt: now, sessionsSinceInterstitial: 0 }),
      markStreakRestored: (today) => set({ lastStreakRestoreDate: today }),
    }),
    {
      name: 'mantrika.ads.v1',
      storage: asyncStorageAdapter,
      partialize: (s) => ({
        lastInterstitialAt: s.lastInterstitialAt,
        sessionsSinceInterstitial: s.sessionsSinceInterstitial,
        lastStreakRestoreDate: s.lastStreakRestoreDate,
      }),
    },
  ),
);
