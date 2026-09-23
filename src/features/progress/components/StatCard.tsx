import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, fontFamily, radius } from '@/shared/theme';

type Props = {
  label: string;
  value: string;
  sub: string;
  valueColor?: string;
  decorativeRing?: boolean;
};

/** Full-width 176-tall stat card, matching the source design's stacked Progress cards. */
export function StatCard({ label, value, sub, valueColor = colors.ink, decorativeRing }: Props) {
  return (
    <View style={styles.card}>
      {decorativeRing ? (
        <Svg width={150} height={150} viewBox="0 0 150 150" style={styles.ring}>
          <Circle
            cx={75}
            cy={75}
            r={62}
            fill="none"
            stroke={colors.maroon}
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray="0 16.2"
          />
        </Svg>
      ) : null}
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 176,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    shadowColor: '#5A2819',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  ring: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -75,
    marginTop: -75,
    opacity: 0.14,
  },
  label: {
    fontSize: 12,
    letterSpacing: 1.4,
    color: colors.ink,
    fontFamily: fontFamily.sans600,
    textTransform: 'uppercase',
  },
  value: { marginTop: 10, fontFamily: fontFamily.serif400, fontSize: 58, lineHeight: 61 },
  sub: { marginTop: 8, fontSize: 14, color: colors.muted },
});
