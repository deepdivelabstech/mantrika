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
    userInterfaceStyle: 'light',
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
        },
      ],
      'expo-localization',
      'expo-audio',
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
          // Falls back to Google's sample app IDs so builds without real IDs
          // still launch (a missing app ID crashes the app at startup).
          androidAppId:
            process.env.ADMOB_ANDROID_APP_ID ?? 'ca-app-pub-3940256099942544~3347511713',
          iosAppId: process.env.ADMOB_IOS_APP_ID ?? 'ca-app-pub-3940256099942544~1458002511',
        },
      ],
      [
        '@sentry/react-native/expo',
        {
          organization: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
        },
      ],
    ],
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
      appEnv: profile,
      sentryDsn: process.env.SENTRY_DSN ?? '',
      admobBannerAndroid: process.env.ADMOB_BANNER_ANDROID ?? '',
      admobBannerIos: process.env.ADMOB_BANNER_IOS ?? '',
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
