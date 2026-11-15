import Constants from 'expo-constants';
import { InteractionManager, Platform } from 'react-native';
import mobileAds, {
  AdEventType,
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';
import { create } from 'zustand';

import { isAdFree, shouldShowInterstitial } from '@/shared/lib/adPacing';
import { toLocalDateString } from '@/shared/lib/dateHelpers';
import { useAdStore } from '@/shared/store/useAdStore';
import { useProgressStore } from '@/shared/store/useProgressStore';

type AdKind = 'Banner' | 'Interstitial' | 'Rewarded' | 'Native';

const TEST_IDS: Record<AdKind, string> = {
  Banner: TestIds.ADAPTIVE_BANNER,
  Interstitial: TestIds.INTERSTITIAL,
  Rewarded: TestIds.REWARDED,
  Native: TestIds.NATIVE,
};

function configuredUnitId(kind: AdKind): string | undefined {
  const extra = Constants.expoConfig?.extra;
  return (
    (extra?.[`admob${kind}${Platform.OS === 'ios' ? 'Ios' : 'Android'}`] as string) || undefined
  );
}

/** Real unit ID for this platform (from `extra.admob<Kind><Platform>`); test ID in dev or when unset. */
function unitId(kind: AdKind): string {
  const id = configuredUnitId(kind);
  return __DEV__ || !id ? TEST_IDS[kind] : id;
}

/**
 * Consent state from Google's UMP flow. Session-only: UMP itself persists the
 * user's choice, and every launch re-reads it. No ad is requested until
 * `canRequestAds` is true.
 */
export const useAdsConsentStore = create<{
  canRequestAds: boolean;
  privacyOptionsRequired: boolean;
}>(() => ({ canRequestAds: false, privacyOptionsRequired: false }));

export const getBannerUnitId = () => unitId('Banner');
export const getRewardedUnitId = () => unitId('Rewarded');
/** Native unit, or null in a release build that has none configured (then no native ad shows). */
export const getNativeUnitId = (): string | null =>
  __DEV__ ? TEST_IDS.Native : (configuredUnitId('Native') ?? null);

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

async function syncConsentInfo() {
  const info = await AdsConsent.getConsentInfo();
  useAdsConsentStore.setState({
    canRequestAds: info.canRequestAds,
    privacyOptionsRequired:
      info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
  });
  return info.canRequestAds;
}

let adsStarted = false;
async function startAds() {
  if (adsStarted) return;
  adsStarted = true;
  await mobileAds().initialize();
  preloadInterstitial();
}

export function initAds() {
  if (Platform.OS === 'web') return;
  void (async () => {
    try {
      // Shows Google's consent form only where required (EEA/UK); a no-op elsewhere.
      await AdsConsent.gatherConsent();
    } catch {
      // Network or form errors: fall through and use whatever consent is already stored.
    }
    try {
      if (await syncConsentInfo()) await startAds();
    } catch {
      // Ads never block the app.
    }
  })();
}

/** Reopens the consent form from Settings (only offered when UMP says it is required). */
export async function showAdPrivacyOptions() {
  if (Platform.OS === 'web') return;
  try {
    await AdsConsent.showPrivacyOptionsForm();
  } catch {
    // Form unavailable: keep the current choice.
  }
  try {
    if (await syncConsentInfo()) await startAds();
  } catch {
    // Ads never block the app.
  }
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
  if (!useAdsConsentStore.getState().canRequestAds) return;

  const { sessionsSinceInterstitial, lastInterstitialAt, lastReviewPromptDate, adFreeUntil } =
    useAdStore.getState();
  const now = Date.now();
  // Earned with a rewarded video: honour it fully.
  if (isAdFree(now, adFreeUntil)) return;
  // A session that ended in the rating dialog doesn't also end in an ad.
  if (lastReviewPromptDate === toLocalDateString(new Date(now))) return;
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
