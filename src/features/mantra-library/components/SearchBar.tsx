import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { colors, radius, spacing, typeScale } from '@/shared/theme';

type Props = {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  accessibilityLabel: string;
};

export function SearchBar({ value, onChange, placeholder, accessibilityLabel }: Props) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      accessibilityLabel={accessibilityLabel}
      style={styles.input}
      placeholderTextColor={colors.muted}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...typeScale.body,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    color: colors.ink,
  },
});
