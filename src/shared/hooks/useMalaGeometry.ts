import { useMemo } from 'react';

/**
 * Teardrop mala loop geometry, ported from the approved visual design.
 * The path is fixed; only the stroke-dashoffset animates per bead, which is
 * what makes the "filling in" effect as beads are counted.
 */
export const MALA_PATH =
  'M189.38 253.64 C 182.4 253.6, 179.4 265.9, 179.4 280.7 C 179.4 324.9, 120.4 349.4, 120.4 418.2 ' +
  'C 120.4 491.9, 152.4 541.0, 189.4 541.0 C 226.4 541.0, 258.4 491.9, 258.4 418.2 ' +
  'C 258.4 349.4, 199.4 324.9, 199.4 280.7 C 199.4 265.9, 196.4 253.6, 189.4 253.6 Z';

const PER_BEAD_LENGTH = 6.2581;
const FULL_LOOP_LENGTH = 675.877;

export function useMalaGeometry(beadsInRound: number) {
  return useMemo(() => {
    const beadDashOffset = Math.max(0, beadsInRound * PER_BEAD_LENGTH - 0.03);
    const guruDashOffset = beadDashOffset; // guru ring mirrors the same fraction
    return {
      path: MALA_PATH,
      beadDashOffset,
      guruDashOffset,
      fullLoopLength: FULL_LOOP_LENGTH,
    };
  }, [beadsInRound]);
}
