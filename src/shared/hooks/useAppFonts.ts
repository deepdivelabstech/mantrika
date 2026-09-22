import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import {
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
  Newsreader_500Medium,
} from '@expo-google-fonts/newsreader';
import {
  TiroDevanagariHindi_400Regular,
  TiroDevanagariHindi_400Regular_Italic,
} from '@expo-google-fonts/tiro-devanagari-hindi';
import { useFonts } from 'expo-font';

/**
 * These packages bundle real local .ttf files (resolved by Metro like any
 * other asset) — not a runtime fetch from Google's CDN, which is what the
 * design spec rules out for a native app.
 */
export function useAppFonts() {
  return useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Newsreader_400Regular,
    Newsreader_400Regular_Italic,
    Newsreader_500Medium,
    TiroDevanagariHindi_400Regular,
    TiroDevanagariHindi_400Regular_Italic,
  });
}
