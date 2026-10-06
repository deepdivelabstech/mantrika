import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

import { useSettingsStore } from '@/shared/store/useSettingsStore';

/** Bead-tap and milestone haptics, respecting the user's haptics toggle. */
export function useHaptics() {
  const enabled = useSettingsStore((s) => s.haptics);

  const tick = useCallback(() => {
    if (!enabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [enabled]);

  /** A distinctly stronger pattern for a completed round, felt even with eyes closed. */
  const milestone = useCallback(() => {
    if (!enabled) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [enabled]);

  return { tick, milestone };
}
