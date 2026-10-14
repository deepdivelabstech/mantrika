import React from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

import { makeStyles, radius, spacing } from '@/shared/theme';

type Props = ViewProps & {
  /** Makes the whole card a button, with a warm highlight while pressed. */
  onPress?: () => void;
  accessibilityLabel?: string;
};

/** The F5EDE3 bordered panel used for every settings row/section in the design. */
export function SettingsCard({ style, onPress, ...rest }: Props) {
  const styles = useStyles();
  if (!onPress) return <View style={[styles.card, style]} {...rest} />;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}
      {...rest}
    />
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  pressed: {
    backgroundColor: colors.highlight,
    borderColor: colors.highlightBorder,
    transform: [{ scale: 0.985 }],
  },
}));
