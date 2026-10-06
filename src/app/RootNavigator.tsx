import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { TabNavigator } from '@/app/TabNavigator';
import { FocusModeScreen } from '@/features/counter/FocusModeScreen';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { useSettingsStore } from '@/shared/store/useSettingsStore';

export type RootStackParamList = {
  Tabs: undefined;
  Focus: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const onboarded = useSettingsStore((s) => s.onboarded);
  if (!onboarded) return <OnboardingScreen />;
  return (
    // freezeOnBlur: while eyes-closed mode counts, the tabs underneath skip per-bead re-renders.
    <Stack.Navigator screenOptions={{ headerShown: false, freezeOnBlur: true }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="Focus"
        component={FocusModeScreen}
        options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
