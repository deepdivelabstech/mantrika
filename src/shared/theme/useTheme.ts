import { useColorScheme, StyleSheet } from 'react-native';

import { useSettingsStore } from '@/shared/store/useSettingsStore';

import { darkColors, lightColors, type Palette } from './colors';

/**
 * Resolved from the user's Appearance setting first. `Appearance.setColorScheme`
 * (applied in App for native UI) doesn't notify `useColorScheme` subscribers,
 * so an override must not depend on it; the system scheme is only consulted
 * when the setting is "system".
 */
export function useIsDark(): boolean {
  const appearance = useSettingsStore((s) => s.appearance);
  const system = useColorScheme();
  return appearance === 'system' ? system === 'dark' : appearance === 'dark';
}

/** The palette for the current scheme. */
export function useColors(): Palette {
  return useIsDark() ? darkColors : lightColors;
}

/**
 * Builds a component's stylesheet from the palette. Each palette's sheet is
 * created once and reused, so this costs no more per render than a
 * module-level `StyleSheet.create`.
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (colors: Palette) => T) {
  const cache = new Map<Palette, T>();
  return function useStyles(): T {
    const colors = useColors();
    let sheet = cache.get(colors);
    if (!sheet) {
      sheet = StyleSheet.create(factory(colors));
      cache.set(colors, sheet);
    }
    return sheet;
  };
}
