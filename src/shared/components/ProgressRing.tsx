import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, fontFamily } from '@/shared/theme';

type Props = {
  fraction: number; // 0..1
  size?: number;
  strokeWidth?: number;
  label?: string;
  trackColor?: string;
  progressColor?: string;
  children?: React.ReactNode;
};

export function ProgressRing({
  fraction,
  size = 120,
  strokeWidth = 10,
  label,
  trackColor = colors.line,
  progressColor = colors.saffronDark,
  children,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, fraction));
  const dashOffset = circumference * (1 - clamped);

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          fill="none"
        />
      </Svg>
      {children ??
        (label ? (
          <View style={StyleSheet.absoluteFill}>
            <View style={styles.center}>
              <Text style={styles.label}>{label}</Text>
            </View>
          </View>
        ) : null)}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fontFamily.serif400, fontSize: 20, color: colors.ink },
});
