import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useRewardedAd } from 'react-native-google-mobile-ads';

import { getRewardedUnitId, useAdsConsentStore } from '@/app/ads';

/** After a no-fill or error, wait this long before asking again (never a tight loop). */
const RETRY_MS = 60 * 1000;

/**
 * One rewarded video, preloaded while consent allows and reloaded after each
 * show. `show(onEarned)` runs `onEarned` once if the viewer earns the reward;
 * closing early grants nothing. Use one per screen and share it, so a screen
 * never preloads several videos at once.
 */
export function useRewardedUnlock(enabled = true) {
  const canRequestAds = useAdsConsentStore((s) => s.canRequestAds);
  const active = enabled && canRequestAds && Platform.OS !== 'web';
  const { status, earnedReward, load, show } = useRewardedAd({
    adUnitId: getRewardedUnitId(),
    autoLoad: active,
  });
  const pending = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!earnedReward || !pending.current) return;
    const grant = pending.current;
    pending.current = null;
    grant();
  }, [earnedReward]);

  useEffect(() => {
    if (!active) return;
    if (status === 'closed') {
      // Closed without earning: drop the callback so a later reward can't fire it.
      pending.current = null;
      load();
      return;
    }
    if (status === 'no-fill' || status === 'error') {
      const timer = setTimeout(load, RETRY_MS);
      return () => clearTimeout(timer);
    }
  }, [active, status, load]);

  const showAd = useCallback(
    (onEarned: () => void) => {
      if (!active || status !== 'loaded') return;
      pending.current = onEarned;
      show();
    },
    [active, status, show],
  );

  return { ready: active && status === 'loaded', show: showAd };
}
