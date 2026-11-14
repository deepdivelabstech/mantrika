import * as Application from 'expo-application';

export type AppVersion = { version: string; build: string | null };

/**
 * The installed binary's version name and build number, as baked in at build
 * time: Android `versionName` / `versionCode`, iOS `CFBundleShortVersionString`
 * / `CFBundleVersion`. `version` in app.config.ts and EAS's remote build
 * counter stay the source of truth; nothing is duplicated here.
 * Null when unavailable (web, or a binary built without expo-application).
 */
export function readAppVersion(): AppVersion | null {
  return normalizeVersion(Application.nativeApplicationVersion, Application.nativeBuildVersion);
}

export function normalizeVersion(
  version: string | null | undefined,
  build: string | null | undefined,
): AppVersion | null {
  const v = version?.trim();
  if (!v) return null;
  const b = build?.trim();
  return { version: v, build: b ? b : null };
}
