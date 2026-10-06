import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { CounterScreen } from '@/features/counter/CounterScreen';
import { MantraLibraryScreen } from '@/features/mantra-library/MantraLibraryScreen';
import { ProgressScreen } from '@/features/progress/ProgressScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { AdBanner } from '@/shared/components/AdBanner';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import {
  CounterTabIcon,
  MantrasTabIcon,
  ProgressTabIcon,
  SettingsIcon,
} from '@/shared/components/icons';
import { colors, fontFamily } from '@/shared/theme';

export type TabParamList = {
  Counter: undefined;
  Mantras: undefined;
  Progress: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const ACTIVE_TEXT = '#4A2118';
const HIGHLIGHT = '#FBE3C5';
const BAR_PADDING = 12;
const INDICATOR_INSET = 6;
const SPRING = { damping: 18, stiffness: 220, mass: 0.6 };

type IconComponent = React.ComponentType<{ size?: number; color: string }>;

const TAB_ICONS: Record<keyof TabParamList, IconComponent> = {
  Counter: CounterTabIcon,
  Mantras: MantrasTabIcon,
  Progress: ProgressTabIcon,
  Settings: SettingsIcon,
};

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
const SettingsTab = withBoundary(SettingsScreen, 'Settings');

function TabItem({
  Icon,
  label,
  focused,
  onPress,
}: {
  Icon: IconComponent;
  label: string;
  focused: boolean;
  onPress: () => void;
}) {
  const lift = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    lift.value = withTiming(focused ? 1 : 0, { duration: 220 });
  }, [focused, lift]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -2 * lift.value }, { scale: 1 + 0.08 * lift.value }],
  }));

  const color = focused ? ACTIVE_TEXT : colors.muted;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      style={styles.item}
    >
      <Animated.View style={iconStyle}>
        <Icon size={22} color={focused ? colors.maroon : colors.muted} />
      </Animated.View>
      <Text style={[styles.label, focused && styles.labelActive, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

// Custom bar: a single highlight pill slides between tabs instead of each tab
// toggling its own background, so the active state reads as one moving piece.
function MantrikaTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [rowWidth, setRowWidth] = useState(0);
  const tabWidth = rowWidth / state.routes.length;
  const x = useSharedValue(0);

  useEffect(() => {
    if (tabWidth > 0) x.value = withSpring(state.index * tabWidth, SPRING);
  }, [state.index, tabWidth, x]);

  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  // No ads while counting: the Counter is the meditation surface.
  const showAd = state.routes[state.index]?.name !== 'Counter';

  return (
    <View style={styles.wrap}>
      {showAd ? <AdBanner /> : null}
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View
          style={styles.row}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            // Jump (not spring) into place on first measure.
            if (rowWidth === 0) x.set(state.index * (w / state.routes.length));
            setRowWidth(w);
          }}
        >
          {tabWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[styles.indicator, { width: tabWidth - INDICATOR_INSET * 2 }, indicatorStyle]}
            />
          ) : null}
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const tabBarLabel = descriptors[route.key]?.options.tabBarLabel;
            const label = typeof tabBarLabel === 'string' ? tabBarLabel : route.name;
            return (
              <TabItem
                key={route.key}
                Icon={TAB_ICONS[route.name as keyof TabParamList]}
                label={label}
                focused={focused}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
                }}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const renderTabBar = (props: BottomTabBarProps) => <MantrikaTabBar {...props} />;

export function TabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        // Unfocused tabs (e.g. Progress) skip re-renders from per-tap store updates.
        freezeOnBlur: true,
      }}
    >
      <Tab.Screen
        name="Counter"
        component={CounterTab}
        options={{ tabBarLabel: t('nav.counter') }}
      />
      <Tab.Screen
        name="Mantras"
        component={MantrasTab}
        options={{ tabBarLabel: t('nav.mantras') }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressTab}
        options={{ tabBarLabel: t('nav.progress') }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsTab}
        options={{ tabBarLabel: t('nav.settings') }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.ground },
  bar: {
    paddingHorizontal: BAR_PADDING,
    paddingTop: 8,
    backgroundColor: colors.ground,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  row: { flexDirection: 'row', height: 58 },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: INDICATOR_INSET,
    borderRadius: 18,
    backgroundColor: HIGHLIGHT,
    borderWidth: 1,
    borderColor: 'rgba(240,162,84,0.45)',
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  label: { fontFamily: fontFamily.sans600, fontSize: 11, letterSpacing: 0.4 },
  labelActive: { fontFamily: fontFamily.sans700 },
});
