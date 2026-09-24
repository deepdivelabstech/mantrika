import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { getBannerUnitId } from '@/app/ads';

/** Adaptive banner; collapses to nothing if the ad fails to load. */
export function AdBanner() {
  const [failed, setFailed] = useState(false);
  if (Platform.OS === 'web' || failed) return null;

  return (
    <View style={styles.wrap}>
      <BannerAd
        unitId={getBannerUnitId()}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { alignItems: 'center' } });
