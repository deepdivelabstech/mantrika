import { useCallback, useState } from 'react';

import type { AnimSpeed } from '@/shared/types/models';

const SPEEDS: Record<AnimSpeed, number> = { gentle: 2200, steady: 1500, quick: 1000 };
const SLOT_COUNT = 5;

export type FloatingChant = {
  key: number;
  chant: string;
  durationMs: number;
  dx: number;
  devanagari: boolean;
};

let nextKey = 0;

/** Manages up to SLOT_COUNT concurrent rising-mantra animations, round-robining slots like the design's float indices. */
export function useFloatingChants() {
  const [floats, setFloats] = useState<FloatingChant[]>([]);
  const [nextSlot, setNextSlot] = useState(0);

  const spawn = useCallback(
    (chant: string, speed: AnimSpeed, devanagari: boolean) => {
      const idx = nextSlot % SLOT_COUNT;
      const key = nextKey++;
      const float: FloatingChant = {
        key,
        chant,
        durationMs: SPEEDS[speed],
        dx: ((idx % 3) - 1) * 14,
        devanagari,
      };
      setFloats((prev) => [...prev, float]);
      setNextSlot((n) => n + 1);
      return key;
    },
    [nextSlot],
  );

  const remove = useCallback((key: number) => {
    setFloats((prev) => prev.filter((f) => f.key !== key));
  }, []);

  return { floats, spawn, remove };
}
