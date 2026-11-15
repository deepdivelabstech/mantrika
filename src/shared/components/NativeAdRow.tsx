import React, { useEffect, useState } from 'react';
import { Image, Platform, Text, View } from 'react-native';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
} from 'react-native-google-mobile-ads';
import { useTranslation } from 'react-i18next';

import { getNativeUnitId, useAdsConsentStore } from '@/app/ads';
import { useAdFree } from '@/shared/hooks/useAdFree';
import { fontFamily, makeStyles, radius, spacing } from '@/shared/theme';

/**
 * A native ad styled like a library row, so it sits in the list without
 * shouting. Renders nothing until an ad has loaded, and nothing at all on web,
 * without consent, during rewarded ad-free time, or when no unit is configured.
 */
export function NativeAdRow() {
  const styles = useStyles();
  const { t } = useTranslation();
  const canRequestAds = useAdsConsentStore((s) => s.canRequestAds);
  const adFree = useAdFree();
  const unitId = getNativeUnitId();
  const enabled = Platform.OS !== 'web' && canRequestAds && !adFree && unitId !== null;
  const [ad, setAd] = useState<NativeAd | null>(null);

  useEffect(() => {
    if (!enabled || !unitId) return;
    let cancelled = false;
    let loaded: NativeAd | null = null;
    NativeAd.createForAdRequest(unitId)
      .then((next) => {
        if (cancelled) {
          next.destroy();
          return;
        }
        loaded = next;
        setAd(next);
      })
      .catch(() => {
        // No fill or network error: the row simply isn't there.
      });
    return () => {
      cancelled = true;
      setAd(null);
      loaded?.destroy();
    };
  }, [enabled, unitId]);

  if (!enabled || !ad) return null;

  return (
    // The native ad view ignores borderRadius on Android, so the card shape lives on a wrapper.
    <View style={styles.card}>
      <NativeAdView nativeAd={ad} style={styles.row}>
        {ad.icon ? (
          <NativeAsset assetType={NativeAssetType.ICON}>
            <Image source={{ uri: ad.icon.url }} style={styles.icon} />
          </NativeAsset>
        ) : null}
        <View style={styles.main}>
          <View style={styles.titleLine}>
            <Text style={styles.badge}>{t('ads.badge')}</Text>
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Text style={styles.headline} numberOfLines={1}>
                {ad.headline}
              </Text>
            </NativeAsset>
          </View>
          {ad.body ? (
            <NativeAsset assetType={NativeAssetType.BODY}>
              <Text style={styles.body} numberOfLines={2}>
                {ad.body}
              </Text>
            </NativeAsset>
          ) : null}
          {ad.advertiser ? (
            <NativeAsset assetType={NativeAssetType.ADVERTISER}>
              <Text style={styles.advertiser} numberOfLines={1}>
                {ad.advertiser}
              </Text>
            </NativeAsset>
          ) : null}
        </View>
        {ad.callToAction ? (
          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <Text style={styles.cta} numberOfLines={1}>
              {ad.callToAction}
            </Text>
          </NativeAsset>
        ) : null}
      </NativeAdView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  icon: { width: 44, height: 44, borderRadius: radius.md },
  main: { flex: 1 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    overflow: 'hidden',
    fontFamily: fontFamily.sans700,
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.highlightInk,
    backgroundColor: colors.highlight,
  },
  headline: {
    flexShrink: 1,
    fontFamily: fontFamily.serif400,
    fontSize: 17,
    lineHeight: 22,
    color: colors.ink,
  },
  body: { marginTop: 4, fontSize: 13, lineHeight: 18.5, color: colors.muted },
  advertiser: { marginTop: 4, fontFamily: fontFamily.sans600, fontSize: 11, color: colors.muted },
  cta: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    fontFamily: fontFamily.sans700,
    fontSize: 12,
    color: colors.onAccent,
    backgroundColor: colors.maroon,
  },
}));
