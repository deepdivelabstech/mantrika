import Constants from 'expo-constants';
import { InteractionManager, Platform } from 'react-native';
import mobileAds, { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';

import { shouldShowInterstitial } from '@/shared/lib/adPacing';
import { useAdStore } from '@/shared/store/useAdStore';
import { useProgressStore } from '@/shared/store/useProgressStore';

type AdKind = 'Banner' | 'Interstitial' | 'Rewarded';

const TEST_IDS: Record<AdKind, string> = {
  Banner: TestIds.ADAPTIVE_BANNER,
  Interstitial: TestIds.INTERSTITIAL,
  Rewarded: TestIds.REWARDED,
};

/** Real unit ID for this platform (from `extra.admob<Kind><Platform>`); test ID in dev or when unset. */
function unitId(kind: AdKind): string {
  const extra = Constants.expoConfig?.extra;
  const id = extra?.[`admob${kind}${Platform.OS === 'ios' ? 'Ios' : 'Android'}`] as
    string | undefined;
  return __DEV__ || !id ? TEST_IDS[kind] : id;
}

export const getBannerUnitId = () => unitId('Banner');
export const getRewardedUnitId = () => unitId('Rewarded');

// One preloaded interstitial, reloaded after each show so the next is ready.
let interstitial: InterstitialAd | null = null;
let interstitialReady = false;

function preloadInterstitial() {
  if (!interstitial) {
    interstitial = InterstitialAd.createForAdRequest(unitId('Interstitial'));
    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitialReady = true;
    });
    interstitial.addAdEventListener(AdEventType.ERROR, () => {
      interstitialReady = false;
    });
    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      interstitialReady = false;
      interstitial?.load();
    });
  }
  if (!interstitialReady) interstitial.load();
}

export function initAds() {
  if (Platform.OS === 'web') return;
  void mobileAds()
    .initialize()
    .then(preloadInterstitial)
    .catch(() => undefined);
}

/**
 * Call when a practice session ends (leaving Focus mode, or leaving the
 * Counter tab). Sessions with at least one full round count toward pacing;
 * the interstitial shows only when pacing allows and one is already loaded,
 * so a session end never waits on the network.
 */
export function endPracticeSession() {
  if (Platform.OS === 'web') return;
  const ads = useAdStore.getState();
  if (!ads.endSession()) return;

  const { sessionsSinceInterstitial, lastInterstitialAt } = useAdStore.getState();
  const now = Date.now();
  const due = shouldShowInterstitial({
    now,
    lastShownAt: lastInterstitialAt,
    sessionsSinceShown: sessionsSinceInterstitial,
    activeDays: useProgressStore.getState().activeDates.length,
  });
  if (!due) return;
  if (!interstitial || !interstitialReady) {
    // Missed this one; have one ready for the next session end.
    preloadInterstitial();
    return;
  }

  interstitialReady = false;
  ads.markInterstitialShown(now);
  // Let the navigation transition finish before covering the screen.
  InteractionManager.runAfterInteractions(() => {
    interstitial?.show().catch(() => preloadInterstitial());
  });
}
