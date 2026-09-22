import { advanceBead, dailyFocusFraction, fillFraction } from '@/shared/lib/beadMath';

describe('advanceBead', () => {
  it('increments by one bead', () => {
    expect(advanceBead(0)).toEqual({ beads: 1, roundsCompleted: 0 });
    expect(advanceBead(50)).toEqual({ beads: 51, roundsCompleted: 0 });
  });

  it('completes a round at bead 108 and wraps to 1 on the next tap', () => {
    expect(advanceBead(107)).toEqual({ beads: 108, roundsCompleted: 1 });
    expect(advanceBead(108)).toEqual({ beads: 1, roundsCompleted: 0 });
  });
});

describe('fillFraction', () => {
  it('is 0 at the start of a round and 1 at bead 108', () => {
    expect(fillFraction(0)).toBe(0);
    expect(fillFraction(108)).toBe(1);
  });

  it('clamps out-of-range input', () => {
    expect(fillFraction(-5)).toBe(0);
    expect(fillFraction(200)).toBe(1);
  });
});

describe('dailyFocusFraction', () => {
  it('divides beads today by the target', () => {
    expect(dailyFocusFraction(504, 1008)).toBe(0.5);
  });

  it('never exceeds 1 even past the target', () => {
    expect(dailyFocusFraction(2000, 1008)).toBe(1);
  });

  it('guards against a zero/negative target', () => {
    expect(dailyFocusFraction(10, 0)).toBe(0);
  });
});
