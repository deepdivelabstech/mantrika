import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import React from 'react';
import { Appearance } from 'react-native';

import { AnimatedSplash } from '@/app/AnimatedSplash';
import { initAds } from '@/app/ads';
import { AppProviders } from '@/app/AppProviders';
import { RootNavigator } from '@/app/RootNavigator';
import i18n from '@/shared/i18n';
import { useAppFonts } from '@/shared/hooks/useAppFonts';
import { useSound } from '@/shared/hooks/useSound';
import { useSettingsStore } from '@/shared/store/useSettingsStore';
import { useColors } from '@/shared/theme';

void SplashScreen.preventAutoHideAsync();
initAds();

function LanguageSync() {
  const lang = useSettingsStore((s) => s.lang);
  useEffect(() => {
    void i18n.changeLanguage(lang);
  }, [lang]);
  return null;
}

// Applied app-wide so native UI (alerts, keyboard, date picker) follows too.
function AppearanceSync() {
  const appearance = useSettingsStore((s) => s.appearance);
  const ground = useColors().ground;
  useEffect(() => {
    Appearance.setColorScheme(appearance === 'system' ? 'unspecified' : appearance);
  }, [appearance]);
  // The window behind the screens, seen during transitions and keyboard moves.
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(ground);
  }, [ground]);
  return null;
}

// Lives at the root, not in a screen: tab screens freeze while unfocused, so a
// soundscape chosen in Settings must not wait for the Counter tab to refocus.
function SoundscapePlayer() {
  useSound();
  return null;
}

export default function App() {
  const [fontsLoaded, fontError] = useAppFonts();
  const [storeHydrated, setStoreHydrated] = useState(useSettingsStore.persist.hasHydrated());

  useEffect(() => {
    return useSettingsStore.persist.onFinishHydration(() => setStoreHydrated(true));
  }, []);

  const [splashDone, setSplashDone] = useState(false);
  const finishSplash = useCallback(() => setSplashDone(true), []);
  const ready = (fontsLoaded || !!fontError) && storeHydrated;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <AppProviders>
      <LanguageSync />
      <AppearanceSync />
      <SoundscapePlayer />
      <RootNavigator />
      <StatusBar style="auto" />
      {!splashDone && <AnimatedSplash onFinish={finishSplash} />}
    </AppProviders>
  );
}
