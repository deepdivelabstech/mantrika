import React from 'react';
import { StyleSheet, TouchableOpacity, type TouchableOpacityProps } from 'react-native';

type Props = TouchableOpacityProps & {
  accessibilityLabel: string;
  size?: number;
};

/** Every icon-only control in the app should go through this so a11y labels aren't forgotten. */
export function IconButton({ accessibilityLabel, size = 44, style, children, ...rest }: Props) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={[styles.base, { width: size, height: size }, style]}
      {...rest}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
