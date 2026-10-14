import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { makeStyles } from '@/shared/theme';

type Props = { children: React.ReactNode; style?: ViewStyle };

export function ScreenContainer({ children, style }: Props) {
  const styles = useStyles();
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.ground },
  container: { flex: 1, backgroundColor: colors.ground },
}));
