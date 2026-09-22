import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/shared/theme';

type Props = { activeDates: string[]; days?: number };

/** Renders the most recent N days as filled/unfilled dots, oldest to newest. */
export function StreakDots({ activeDates, days = 7 }: Props) {
  const today = new Date();
  const cells = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return activeDates.includes(iso);
  });

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${cells.filter(Boolean).length} of ${days} recent days active`}
    >
      {cells.map((active, i) => (
        <View key={i} style={[styles.dot, active && styles.dotActive]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line },
  dotActive: { backgroundColor: colors.maroon },
});
