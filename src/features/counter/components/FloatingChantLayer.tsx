import React, { useImperativeHandle, type Ref } from 'react';

import { RisingMantra } from '@/features/counter/components/RisingMantra';
import { useFloatingChants } from '@/features/counter/hooks/useFloatingChants';
import type { AnimSpeed } from '@/shared/types/models';

export type FloatingChantLayerHandle = {
  spawn: (chant: string, speed: AnimSpeed, devanagari: boolean) => void;
};

type Props = {
  ref?: Ref<FloatingChantLayerHandle>;
  originX: number;
  originY: number;
  originWidth: number;
};

/**
 * Owns the rising-chant state so each chant's spawn and removal re-renders
 * only this layer, not the whole counter screen (mala SVG, stats, sheet).
 */
export const FloatingChantLayer = React.memo(function FloatingChantLayer({
  ref,
  originX,
  originY,
  originWidth,
}: Props) {
  const { floats, spawn, remove } = useFloatingChants();
  useImperativeHandle(ref, () => ({ spawn }), [spawn]);

  return floats.map((f) => (
    <RisingMantra
      key={f.key}
      id={f.key}
      chant={f.chant}
      durationMs={f.durationMs}
      dx={f.dx}
      devanagari={f.devanagari}
      onDone={remove}
      originX={originX}
      originY={originY}
      originWidth={originWidth}
    />
  ));
});
