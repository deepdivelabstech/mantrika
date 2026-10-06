import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CounterScreen } from '@/features/counter/CounterScreen';
import { MantraLibraryScreen } from '@/features/mantra-library/MantraLibraryScreen';
import { ProgressScreen } from '@/features/progress/ProgressScreen';
import { AdBanner } from '@/shared/components/AdBanner';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { CounterTabIcon, MantrasTabIcon, ProgressTabIcon } from '@/shared/components/icons';
import { colors, fontFamily } from '@/shared/theme';

export type TabParamList = {
  Counter: undefined;
  Mantras: undefined;
  Progress: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const ACTIVE_TEXT = '#4A2118';

function withBoundary(Screen: React.ComponentType, label: string) {
  return function Wrapped() {
    return (
      <ErrorBoundary label={label}>
        <Screen />
      </ErrorBoundary>
    );
  };
}

// Wrapped once at module scope: creating them inside render would give each
// tab a new component type on every TabNavigator render and remount it.
const CounterTab = withBoundary(CounterScreen, 'Counter');
const MantrasTab = withBoundary(MantraLibraryScreen, 'Mantras');
const ProgressTab = withBoundary(ProgressScreen, 'Progress');

// Matches the design's nav pill: icon + label share one rounded background,
// not the default bottom-tabs layout of a bare icon over a small caption.
function TabPillButton({
  Icon,
  label,
  focused,
  onPress,
}: {
  Icon: React.ComponentType<{ size?: number; color: string }>;
  label: string;
  focused: boolean;
  onPress?: PressableProps['onPress'];
}) {
  const color = focused ? ACTIVE_TEXT : colors.muted;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      style={[styles.pill, focused && styles.pillActive]}
    >
      <Icon size={22} color={color} />
      <Text style={[styles.pillLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function TabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={(props) => (
        <View style={styles.tabBarWrap}>
          <AdBanner />
          <BottomTabBar {...props} />
        </View>
      )}
      screenOptions={{
        headerShown: false,
        // Unfocused tabs (e.g. Progress) skip re-renders from per-tap store updates.
        freezeOnBlur: true,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Counter"
        component={CounterTab}
        options={{
          tabBarLabel: t('nav.counter'),
          tabBarButton: ({ onPress, 'aria-selected': selected }) => (
            <TabPillButton
              Icon={CounterTabIcon}
              label={t('nav.counter')}
              focused={!!selected}
              onPress={onPress}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Mantras"
        component={MantrasTab}
        options={{
          tabBarLabel: t('nav.mantras'),
          tabBarButton: ({ onPress, 'aria-selected': selected }) => (
            <TabPillButton
              Icon={MantrasTabIcon}
              label={t('nav.mantras')}
              focused={!!selected}
              onPress={onPress}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressTab}
        options={{
          tabBarLabel: t('nav.progress'),
          tabBarButton: ({ onPress, 'aria-selected': selected }) => (
            <TabPillButton
              Icon={ProgressTabIcon}
              label={t('nav.progress')}
              focused={!!selected}
              onPress={onPress}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: { backgroundColor: colors.ground },
  tabBar: {
    height: 84,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: colors.ground,
    borderTopColor: colors.line,
  },
  pill: {
    flex: 1,
    minWidth: 84,
    height: 54,
    marginTop: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pillActive: { backgroundColor: colors.saffron },
  pillLabel: { fontFamily: fontFamily.sans600, fontSize: 11, letterSpacing: 0.4 },
});
