import { useColorScheme, StyleSheet } from 'react-native';

import { darkColors, lightColors, type Palette } from './colors';

export function useIsDark(): boolean {
  return useColorScheme() === 'dark';
}

/**
 * The palette for the current scheme. The Appearance setting is applied
 * app-wide through `Appearance.setColorScheme`, so this follows both the
 * system and the user's override.
 */
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
