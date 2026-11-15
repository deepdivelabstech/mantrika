import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { AD_FREE_MS } from '@/shared/lib/adPacing';
import { SOUND_UNLOCK_MS, type SoundUnlocks } from '@/shared/lib/soundAccess';
import type { PremiumSoundId, SoundscapeId } from '@/shared/types/models';

import { asyncStorageAdapter } from './persist';

type AdStore = {
  lastInterstitialAt: number;
  sessionsSinceInterstitial: number;
  lastStreakRestoreDate: string;
  lastReviewPromptDate: string;
  /** Epoch ms until which banners and interstitials are hidden (rewarded "ad-free day"). */
  adFreeUntil: number;
  /** Expiry per rewarded-unlocked premium soundscape. */
  soundUnlocks: SoundUnlocks;
  /** Soundscape being previewed in Settings; session-only. The main soundscape pauses meanwhile. */
  previewSound: SoundscapeId | null;
  /** Rounds completed since the current practice session began; session-only, never persisted. */
  roundsThisSession: number;
  noteRoundCompleted: () => void;
  /** Ends the session; returns whether it counted (at least one full round). */
  endSession: () => boolean;
  markInterstitialShown: (now: number) => void;
  markStreakRestored: (today: string) => void;
  markReviewPrompted: (today: string) => void;
  grantAdFree: (now: number) => void;
  unlockSound: (id: PremiumSoundId, now: number) => void;
  setPreviewSound: (id: SoundscapeId | null) => void;
};

/** Ad and rating-prompt pacing state. Device-local on purpose: it is not part of backups. */
export const useAdStore = create<AdStore>()(
  persist(
    (set, get) => ({
      lastInterstitialAt: 0,
      sessionsSinceInterstitial: 0,
      lastStreakRestoreDate: '',
      lastReviewPromptDate: '',
      adFreeUntil: 0,
      soundUnlocks: {},
      previewSound: null,
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
      markReviewPrompted: (today) => set({ lastReviewPromptDate: today }),
      grantAdFree: (now) => set({ adFreeUntil: now + AD_FREE_MS }),
      unlockSound: (id, now) =>
        set((s) => ({ soundUnlocks: { ...s.soundUnlocks, [id]: now + SOUND_UNLOCK_MS } })),
      setPreviewSound: (id) => set({ previewSound: id }),
    }),
    {
      name: 'mantrika.ads.v1',
      storage: asyncStorageAdapter,
      partialize: (s) => ({
        lastInterstitialAt: s.lastInterstitialAt,
        sessionsSinceInterstitial: s.sessionsSinceInterstitial,
        lastStreakRestoreDate: s.lastStreakRestoreDate,
        lastReviewPromptDate: s.lastReviewPromptDate,
        adFreeUntil: s.adFreeUntil,
        soundUnlocks: s.soundUnlocks,
      }),
    },
  ),
);
