import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CounterScreen } from '@/features/counter/CounterScreen';
import { MantraLibraryScreen } from '@/features/mantra-library/MantraLibraryScreen';
import { ProgressScreen } from '@/features/progress/ProgressScreen';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { colors, fontFamily } from '@/shared/theme';

export type TabParamList = {
  Counter: undefined;
  Mantras: undefined;
  Progress: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

function withBoundary(Screen: React.ComponentType, label: string) {
  return function Wrapped() {
    return (
      <ErrorBoundary label={label}>
        <Screen />
      </ErrorBoundary>
    );
  };
}

function TabIcon({ glyph, focused }: { glyph: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Text style={[styles.iconGlyph, focused && styles.iconGlyphActive]}>{glyph}</Text>
    </View>
  );
}

export function TabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4A2118',
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.ground, borderTopColor: colors.line },
        tabBarLabelStyle: { fontFamily: fontFamily.sans600, fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="Counter"
        component={withBoundary(CounterScreen, 'Counter')}
        options={{
          tabBarLabel: t('nav.counter'),
          tabBarIcon: ({ focused }) => <TabIcon glyph="◉" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Mantras"
        component={withBoundary(MantraLibraryScreen, 'Mantras')}
        options={{
          tabBarLabel: t('nav.mantras'),
          tabBarIcon: ({ focused }) => <TabIcon glyph="ॐ" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Progress"
        component={withBoundary(ProgressScreen, 'Progress')}
        options={{
          tabBarLabel: t('nav.progress'),
          tabBarIcon: ({ focused }) => <TabIcon glyph="↗" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  iconWrapActive: { backgroundColor: colors.saffron },
  iconGlyph: { fontSize: 16, color: colors.muted },
  iconGlyphActive: { color: '#4A2118' },
});
