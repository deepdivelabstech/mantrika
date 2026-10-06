import { useCallback, useRef } from 'react';

import { useChime } from '@/shared/hooks/useChime';
import { useHaptics } from '@/shared/hooks/useHaptics';
import { useAdStore } from '@/shared/store/useAdStore';
import { useProgressStore, type TapResult } from '@/shared/store/useProgressStore';
import { useSettingsStore } from '@/shared/store/useSettingsStore';
import { BEADS_PER_ROUND } from '@/shared/types/models';

export const ROUND_PAUSE_MS = 2000;

export type Milestone = 'round' | 'goal' | 'sankalpa';

export type BeadEvent = TapResult & {
  /** The biggest thing this tap achieved, if anything. */
  milestone: Milestone | null;
};

/**
 * One bead, with its feedback: a light tick per bead, and a distinct haptic +
 * temple chime when a round completes. With "pause after round" on, taps are
 * ignored briefly after each round so a practitioner doesn't run on into the
 * next one by momentum. Returns null for an ignored tap.
 */
export function useBeadCounter() {
  const tapBead = useProgressStore((s) => s.tapBead);
  const goalBeads = useSettingsStore((s) => s.dailyGoalMalas) * BEADS_PER_ROUND;
  const pauseAfterRound = useSettingsStore((s) => s.pauseAfterRound);
  const { tick, milestone } = useHaptics();
  const chime = useChime();
  const lockedUntil = useRef(0);

  return useCallback((): BeadEvent | null => {
    const now = Date.now();
    if (now < lockedUntil.current) return null;

    const result = tapBead();
    if (result.roundCompleted) useAdStore.getState().noteRoundCompleted();
    // Exactly-equal checks: each fires once, on the bead that crosses the line.
    const kind: Milestone | null = result.sankalpaCompleted
      ? 'sankalpa'
      : result.todayTotal === goalBeads
        ? 'goal'
        : result.roundCompleted
          ? 'round'
          : null;

    if (kind) {
      milestone();
      chime();
      if (pauseAfterRound && result.roundCompleted) lockedUntil.current = now + ROUND_PAUSE_MS;
    } else {
      tick();
    }
    return { ...result, milestone: kind };
  }, [tapBead, goalBeads, pauseAfterRound, tick, milestone, chime]);
}
