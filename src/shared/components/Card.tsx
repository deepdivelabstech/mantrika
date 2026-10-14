import React from 'react';
import { View, type ViewProps } from 'react-native';

import { makeStyles, radius, spacing } from '@/shared/theme';

export function Card({ style, ...rest }: ViewProps) {
  const styles = useStyles();
  return <View style={[styles.card, style]} {...rest} />;
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
  },
}));
