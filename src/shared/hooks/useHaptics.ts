import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

import { useSettingsStore } from '@/shared/store/useSettingsStore';

/** Fires a light impact per bead tap, respecting the user's haptics toggle. */
export function useHaptics() {
  const enabled = useSettingsStore((s) => s.haptics);

  const tick = useCallback(() => {
    if (!enabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [enabled]);

  return { tick };
}
