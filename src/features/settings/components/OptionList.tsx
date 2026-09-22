import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radius, spacing, typeScale } from '@/shared/theme';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
};

/** A vertical single-select list (radio-style rows) — used for sound and language pickers. */
export function OptionList<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.list}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={[styles.row, active && styles.rowActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
            {active ? <Text style={styles.check}>✓</Text> : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rowActive: { backgroundColor: colors.card, borderColor: colors.maroon },
  label: { ...typeScale.body, color: colors.ink },
  labelActive: { color: colors.ink },
  check: { color: colors.maroon, fontSize: 16 },
});
