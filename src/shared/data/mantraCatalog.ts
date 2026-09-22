import Constants from 'expo-constants';

import type { Mantra } from '@/shared/types/models';

import localCatalog from './mantraCatalog.json';

export const BUNDLED_CATALOG: Mantra[] = localCatalog;

function isMantraArray(value: unknown): value is Mantra[] {
  return (
    Array.isArray(value) &&
    value.every(
      (m) =>
        m &&
        typeof m === 'object' &&
        typeof (m as Mantra).id === 'string' &&
        typeof (m as Mantra).name === 'string' &&
        typeof (m as Mantra).chant === 'string',
    )
  );
}

/**
 * Fetches a remote catalog when `remoteCatalogUrl` is configured, falling
 * back to the bundled JSON on any failure (missing config, offline, bad
 * shape) — the app must never block counting on network availability.
 */
export async function loadMantraCatalog(): Promise<Mantra[]> {
  const remoteUrl = Constants.expoConfig?.extra?.remoteCatalogUrl as string | undefined;
  if (!remoteUrl) return BUNDLED_CATALOG;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(remoteUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return BUNDLED_CATALOG;
    const json = await res.json();
    return isMantraArray(json) ? json : BUNDLED_CATALOG;
  } catch {
    return BUNDLED_CATALOG;
  }
}
