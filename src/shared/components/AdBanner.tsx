import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { getBannerUnitId } from '@/app/ads';

type Props = {
  /** 'anchored': full-width adaptive strip above the tab bar. 'inline': 300x250 in-content rectangle. */
  variant?: 'anchored' | 'inline';
};

/** A banner ad that collapses entirely if the ad fails to load. */
export function AdBanner({ variant = 'anchored' }: Props) {
  const [failed, setFailed] = useState(false);
  if (Platform.OS === 'web' || failed) return null;

  const inline = variant === 'inline';
  return (
    <View style={inline ? styles.inline : styles.anchored}>
      <BannerAd
        unitId={getBannerUnitId()}
        size={inline ? BannerAdSize.MEDIUM_RECTANGLE : BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  anchored: { alignItems: 'center' },
  inline: { minHeight: 250, alignItems: 'center', justifyContent: 'center' },
});
