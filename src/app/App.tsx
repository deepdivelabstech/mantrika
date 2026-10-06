import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';

import { AnimatedSplash } from '@/app/AnimatedSplash';
import { initAds } from '@/app/ads';
import { AppProviders } from '@/app/AppProviders';
import { RootNavigator } from '@/app/RootNavigator';
import i18n from '@/shared/i18n';
import { useAppFonts } from '@/shared/hooks/useAppFonts';
import { useSound } from '@/shared/hooks/useSound';
import { useSettingsStore } from '@/shared/store/useSettingsStore';

void SplashScreen.preventAutoHideAsync();
initAds();

function LanguageSync() {
  const lang = useSettingsStore((s) => s.lang);
  useEffect(() => {
    void i18n.changeLanguage(lang);
  }, [lang]);
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
      <SoundscapePlayer />
      <RootNavigator />
      <StatusBar style="dark" />
      {!splashDone && <AnimatedSplash onFinish={finishSplash} />}
    </AppProviders>
  );
}
