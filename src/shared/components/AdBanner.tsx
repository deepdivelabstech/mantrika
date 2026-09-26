import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { getBannerUnitId } from '@/app/ads';

/** Fixed-height (50) banner so every placement is the same size; collapses if the ad fails to load. */
export function AdBanner() {
  const [failed, setFailed] = useState(false);
  if (Platform.OS === 'web' || failed) return null;

  return (
    <View style={styles.wrap}>
      <BannerAd
        unitId={getBannerUnitId()}
        size={BannerAdSize.BANNER}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 50, alignItems: 'center', padding: 0, margin: 0 },
});
