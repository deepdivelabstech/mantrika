import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Dynamic Expo config. Values that differ per environment (dev/preview/production)
 * are read from EAS environment variables at build/update time — nothing here is a secret.
 * See `.env.example` for the full list of variables this file and the app read.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const profile = process.env.APP_ENV ?? 'development';
  const isProd = profile === 'production';

  return {
    ...config,
    name: isProd ? 'Mantrika' : `Mantrika (${profile})`,
    slug: 'mantrika',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    scheme: 'mantrika',
    backgroundColor: '#FBF7F1',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.deepdivelabs.mantrika',
    },
    android: {
      package: 'com.deepdivelabs.mantrika',
      adaptiveIcon: {
        backgroundColor: '#3A1812',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      // Added by prebuild defaults (expo-audio recording, RN dev overlay) but never used;
      // a mic permission in a counter app trips Play review and Data safety checks.
      blockedPermissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.SYSTEM_ALERT_WINDOW',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-font',
      'expo-secure-store',
      [
        'expo-splash-screen',
        {
          image: './assets/splash-icon.png',
          imageWidth: 120,
          resizeMode: 'contain',
          backgroundColor: '#FBF7F1',
          dark: { image: './assets/splash-icon.png', backgroundColor: '#150D09' },
        },
      ],
      'expo-localization',
      ['expo-audio', { microphonePermission: false, recordAudioAndroid: false }],
      '@react-native-community/datetimepicker',
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#6B2F25',
        },
      ],
      [
        'react-native-google-mobile-ads',
        {
          // Live Android app ID; iOS falls back to Google's sample app ID so
          // builds without a real ID still launch (a missing app ID crashes at startup).
          androidAppId:
            process.env.ADMOB_ANDROID_APP_ID ?? 'ca-app-pub-5747186985760540~6992342734',
          iosAppId: process.env.ADMOB_IOS_APP_ID ?? 'ca-app-pub-3940256099942544~1458002511',
          // Hold measurement until the UMP consent flow in src/app/ads.ts has run.
          delayAppMeasurementInit: true,
        },
      ],
    ],
    extra: {
      eas: {
        // Not a secret: identifies the EAS project so any machine or CI can build.
        projectId: process.env.EAS_PROJECT_ID ?? 'd0f5c96e-5812-4671-82d5-dc1c0d3de9bf',
      },
      appEnv: profile,
      admobBannerAndroid:
        process.env.ADMOB_BANNER_ANDROID ?? 'ca-app-pub-5747186985760540/5884109346',
      admobBannerIos: process.env.ADMOB_BANNER_IOS ?? '',
      admobInterstitialAndroid:
        process.env.ADMOB_INTERSTITIAL_ANDROID ?? 'ca-app-pub-5747186985760540/1321334765',
      admobInterstitialIos: process.env.ADMOB_INTERSTITIAL_IOS ?? '',
      admobRewardedAndroid:
        process.env.ADMOB_REWARDED_ANDROID ?? 'ca-app-pub-5747186985760540/4908603863',
      admobRewardedIos: process.env.ADMOB_REWARDED_IOS ?? '',
      remoteCatalogUrl: process.env.REMOTE_CATALOG_URL ?? '',
    },
    updates: {
      url: process.env.EAS_UPDATE_URL,
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
  };
};
