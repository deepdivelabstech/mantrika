import React from 'react';
import { View, type ViewProps } from 'react-native';

import { makeStyles, radius, spacing } from '@/shared/theme';

/** The F5EDE3 bordered panel used for every settings row/section in the design. */
export function SettingsCard({ style, ...rest }: ViewProps) {
  const styles = useStyles();
  return <View style={[styles.card, style]} {...rest} />;
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
}));
