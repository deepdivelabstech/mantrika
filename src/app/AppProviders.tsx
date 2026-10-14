import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { I18nextProvider } from 'react-i18next';
import React, { useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import i18n from '@/shared/i18n';
import { useColors, useIsDark } from '@/shared/theme';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  const isDark = useIsDark();
  // Screen backgrounds behind transitions follow the palette, so nothing flashes white at night.
  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.maroon,
        background: colors.ground,
        card: colors.ground,
        text: colors.ink,
        border: colors.line,
      },
    };
  }, [colors, isDark]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <NavigationContainer theme={navTheme}>{children}</NavigationContainer>
        </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
