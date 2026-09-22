import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, fontFamily, radius } from '@/shared/theme';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  columns: 2 | 3;
  disabled?: boolean;
};

/** Grid of pill toggle buttons (sound, language, animation speed) — active fills solid maroon. */
export function PillGrid<T extends string>({
  options,
  value,
  onChange,
  columns,
  disabled,
}: Props<T>) {
  const rows: Option<T>[][] = [];
  for (let i = 0; i < options.length; i += columns) rows.push(options.slice(i, i + columns));

  return (
    <View style={styles.grid}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((opt) => {
            const active = opt.value === value;
            return (
              <TouchableOpacity
                key={opt.value}
                disabled={disabled}
                onPress={() => onChange(opt.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: active, disabled: !!disabled }}
                style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
              >
                <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  pill: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  pillInactive: { backgroundColor: colors.ground, borderColor: '#E1D2C0' },
  label: { fontFamily: fontFamily.sans600, fontSize: 13, color: colors.ink },
  labelActive: { color: colors.ground },
});
