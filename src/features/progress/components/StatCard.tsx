import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Card } from '@/shared/components/Card';
import { colors, fontFamily, spacing, typeScale } from '@/shared/theme';

type Props = { label: string; value: string; sub: string };

export function StatCard({ label, value, sub }: Props) {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, alignItems: 'flex-start' },
  label: {
    ...typeScale.caption,
    fontFamily: fontFamily.sans600,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  value: {
    fontFamily: fontFamily.serif400,
    fontSize: 32,
    color: colors.ink,
    marginTop: spacing.xxs,
  },
  sub: { ...typeScale.caption, color: colors.muted, marginTop: spacing.xxs },
});
