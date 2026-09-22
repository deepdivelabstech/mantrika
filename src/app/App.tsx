import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';

import { AppProviders } from '@/app/AppProviders';
import { initSentry } from '@/app/sentry';
import { RootNavigator } from '@/app/RootNavigator';
import i18n from '@/shared/i18n';
import { useAppFonts } from '@/shared/hooks/useAppFonts';
import { useSettingsStore } from '@/shared/store/useSettingsStore';

void SplashScreen.preventAutoHideAsync();
initSentry();

function LanguageSync() {
  const lang = useSettingsStore((s) => s.lang);
  useEffect(() => {
    void i18n.changeLanguage(lang);
  }, [lang]);
  return null;
}

export default function App() {
  const [fontsLoaded, fontError] = useAppFonts();
  const [storeHydrated, setStoreHydrated] = useState(useSettingsStore.persist.hasHydrated());

  useEffect(() => {
    return useSettingsStore.persist.onFinishHydration(() => setStoreHydrated(true));
  }, []);

  const ready = (fontsLoaded || !!fontError) && storeHydrated;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <AppProviders>
      <LanguageSync />
      <RootNavigator />
      <StatusBar style="dark" />
    </AppProviders>
  );
}
