import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { TabNavigator } from '@/app/TabNavigator';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { useSettingsStore } from '@/shared/store/useSettingsStore';

export type RootStackParamList = {
  Tabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const onboarded = useSettingsStore((s) => s.onboarded);
  if (!onboarded) return <OnboardingScreen />;
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
    </Stack.Navigator>
  );
}
