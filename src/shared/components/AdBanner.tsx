import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { getBannerUnitId, useAdsConsentStore } from '@/app/ads';
import { useAdFree } from '@/shared/hooks/useAdFree';

/** Waits before each retry after a failed load; after the last one the banner stays collapsed. */
const RETRY_DELAYS_MS = [30_000, 60_000, 120_000];

type Props = {
  /** 'anchored': full-width adaptive strip above the tab bar. 'inline': 300x250 in-content rectangle. */
  variant?: 'anchored' | 'inline';
};

/**
 * A banner ad that collapses while a load has failed and tries again a few
 * times with growing gaps, so one no-fill doesn't cost the screen its banner.
 */
export function AdBanner({ variant = 'anchored' }: Props) {
  const [failed, setFailed] = useState(false);
  // Bumping the key remounts BannerAd, which issues a fresh request.
  const [attempt, setAttempt] = useState(0);
  const retries = useRef(0);
  const canRequestAds = useAdsConsentStore((s) => s.canRequestAds);
  const adFree = useAdFree();

  useEffect(() => {
    if (!failed) return;
    const delay = RETRY_DELAYS_MS[retries.current];
    if (delay === undefined) return;
    const timer = setTimeout(() => {
      retries.current += 1;
      setFailed(false);
      setAttempt((n) => n + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [failed]);

  if (Platform.OS === 'web' || failed || !canRequestAds || adFree) return null;

  const inline = variant === 'inline';
  return (
    <View style={inline ? styles.inline : styles.anchored}>
      <BannerAd
        key={attempt}
        unitId={getBannerUnitId()}
        size={inline ? BannerAdSize.MEDIUM_RECTANGLE : BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={() => {
          retries.current = 0;
        }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  anchored: { alignItems: 'center' },
  inline: { minHeight: 250, alignItems: 'center', justifyContent: 'center' },
});
