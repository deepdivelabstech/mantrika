import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { TabNavigator } from '@/app/TabNavigator';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

export type RootStackParamList = {
  Tabs: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function SettingsWithBoundary() {
  return (
    <ErrorBoundary label="Settings">
      <SettingsScreen />
    </ErrorBoundary>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="Settings"
        component={SettingsWithBoundary}
        options={{ presentation: 'card' }}
      />
    </Stack.Navigator>
  );
}
