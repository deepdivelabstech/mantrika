import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

/**
 * Crash reporting is env-gated: with no DSN configured (local dev by
 * default) this is a no-op, so nothing is sent unless a build explicitly
 * sets SENTRY_DSN via EAS environment variables.
 */
export function initSentry() {
  const dsn = Constants.expoConfig?.extra?.sentryDsn as string | undefined;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: (Constants.expoConfig?.extra?.appEnv as string | undefined) ?? 'development',
    tracesSampleRate: 0.2,
  });
}
