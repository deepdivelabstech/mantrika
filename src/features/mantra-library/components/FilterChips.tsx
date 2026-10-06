import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors, fontFamily, spacing } from '@/shared/theme';

type Option<T extends string> = { value: T; label: string; count: number };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
};

/** Horizontally scrollable filter pills with a count badge; active pill fills maroon. */
export function FilterChips<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroller}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <TouchableOpacity
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{o.label}</Text>
            <Text style={[styles.count, active && styles.countActive]}>{o.count}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Bleed to the screen edges (the list has spacing.lg side padding) so chips
  // scroll under the edge instead of being clipped by the padding.
  scroller: { marginHorizontal: -spacing.lg },
  row: { gap: 8, paddingHorizontal: spacing.lg },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  label: { fontFamily: fontFamily.sans600, fontSize: 13, color: colors.ink },
  labelActive: { color: colors.ground },
  count: {
    minWidth: 20,
    paddingHorizontal: 5,
    borderRadius: 9,
    overflow: 'hidden',
    textAlign: 'center',
    fontFamily: fontFamily.sans700,
    fontSize: 11,
    lineHeight: 18,
    color: colors.muted,
    backgroundColor: colors.line,
  },
  countActive: { color: colors.maroon, backgroundColor: '#FBE3C5' },
});
