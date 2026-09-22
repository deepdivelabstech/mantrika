import { BEADS_PER_ROUND } from '@/shared/types/models';

export type BeadAdvanceResult = {
  beads: number;
  roundsCompleted: number; // rounds completed by THIS tap (0 or 1)
};

/**
 * Advances the bead counter by one tap. A round completes at bead 108, after
 * which the bead counter wraps back to 1 (mala counting starts a fresh loop
 * rather than continuing to climb).
 */
export function advanceBead(currentBeads: number): BeadAdvanceResult {
  const next = currentBeads >= BEADS_PER_ROUND ? 1 : currentBeads + 1;
  return { beads: next, roundsCompleted: next === BEADS_PER_ROUND ? 1 : 0 };
}

export function fillFraction(beads: number): number {
  return Math.min(1, Math.max(0, beads / BEADS_PER_ROUND));
}

export function dailyFocusFraction(beadsToday: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(1, Math.max(0, beadsToday / target));
}
