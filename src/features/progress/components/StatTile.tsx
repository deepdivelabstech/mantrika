import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, radius } from '@/shared/theme';

type Props = { label: string; value: string; sub?: string; valueColor?: string };

/** Compact stat for the three-up row on Progress. */
export const StatTile = React.memo(function StatTile({
  label,
  value,
  sub,
  valueColor = colors.ink,
}: Props) {
  return (
    <View
      style={styles.tile}
      accessible
      accessibilityLabel={`${label}: ${value}${sub ? `. ${sub}` : ''}`}
    >
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      <Text style={[styles.value, { color: valueColor }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {sub ? (
        <Text style={styles.sub} numberOfLines={3}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 112,
    paddingHorizontal: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
  },
  label: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.muted,
    fontFamily: fontFamily.sans600,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  value: { marginTop: 6, fontFamily: fontFamily.serif400, fontSize: 34, lineHeight: 38 },
  sub: { marginTop: 2, fontSize: 11, lineHeight: 14, color: colors.muted, textAlign: 'center' },
});
