import React from 'react';
import { Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native';

import { makeStyles, radius, spacing, typeScale } from '@/shared/theme';

type Variant = 'primary' | 'secondary';

type Props = TouchableOpacityProps & {
  label: string;
  variant?: Variant;
};

export function Button({ label, variant = 'primary', style, ...rest }: Props) {
  const styles = useStyles();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.base, variant === 'secondary' ? styles.secondary : styles.primary, style]}
      {...rest}
    >
      <Text style={[styles.text, variant === 'secondary' && styles.textSecondary]}>{label}</Text>
    </TouchableOpacity>
  );
}

const useStyles = makeStyles((colors) => ({
  base: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.maroon },
  secondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  text: { ...typeScale.bodyStrong, color: colors.onAccent },
  textSecondary: { color: colors.ink },
}));
