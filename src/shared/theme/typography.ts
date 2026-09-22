import { Platform } from 'react-native';

/**
 * Font family names as registered by expo-font / @expo-google-fonts/*.
 * `system` is the fallback used before fonts finish loading (see
 * shared/hooks/useAppFonts.ts) so the app never blocks first paint on fonts.
 */
export const fontFamily = {
  system: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),

  sans400: 'Manrope_400Regular',
  sans500: 'Manrope_500Medium',
  sans600: 'Manrope_600SemiBold',
  sans700: 'Manrope_700Bold',

  serif400: 'Newsreader_400Regular',
  serif400Italic: 'Newsreader_400Regular_Italic',
  serif500: 'Newsreader_500Medium',

  devanagari400: 'TiroDevanagariHindi_400Regular',
  devanagari400Italic: 'TiroDevanagariHindi_400Regular_Italic',
} as const;

/**
 * Label style: uppercase, 11px, 600 weight, .16em tracking, muted color.
 * Devanagari conjuncts break visually under tracked-out letter-spacing, so
 * this MUST be zeroed for Hindi — pass `lang` rather than hardcoding a variant.
 */
export function labelStyle(lang: 'en' | 'hi') {
  return {
    fontFamily: fontFamily.sans600,
    fontSize: 11,
    letterSpacing: lang === 'hi' ? 0 : 0.16 * 11,
    textTransform: 'uppercase' as const,
  };
}

export const typeScale = {
  displayLarge: { fontFamily: fontFamily.serif400, fontSize: 46, lineHeight: 50 },
  displayMedium: { fontFamily: fontFamily.serif400, fontSize: 32, lineHeight: 36 },
  displaySmall: { fontFamily: fontFamily.serif400, fontSize: 24, lineHeight: 28 },
  body: { fontFamily: fontFamily.sans500, fontSize: 15, lineHeight: 21 },
  bodyStrong: { fontFamily: fontFamily.sans600, fontSize: 15, lineHeight: 21 },
  caption: { fontFamily: fontFamily.sans500, fontSize: 13, lineHeight: 18 },
} as const;
