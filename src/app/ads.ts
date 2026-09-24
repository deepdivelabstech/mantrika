import Constants from 'expo-constants';
import { Platform } from 'react-native';
import mobileAds, { TestIds } from 'react-native-google-mobile-ads';

/** Real banner unit ID for this platform; test ID in dev or when unset. */
export function getBannerUnitId(): string {
  const extra = Constants.expoConfig?.extra;
  const id = (Platform.OS === 'ios' ? extra?.admobBannerIos : extra?.admobBannerAndroid) as
    string | undefined;
  return __DEV__ || !id ? TestIds.BANNER : id;
}

export function initAds() {
  if (Platform.OS === 'web') return;
  void mobileAds().initialize();
}
