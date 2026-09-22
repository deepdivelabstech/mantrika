import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

const BEAD_POSITIONS: Array<{ cx: number; cy: number; r: number }> = [
  { cx: -2.5, cy: 144.1, r: 13.0 },
  { cx: 28.3, cy: 119.7, r: 13.5 },
  { cx: 60.9, cy: 107.5, r: 14.0 },
  { cx: 95.1, cy: 104.4, r: 14.5 },
  { cx: 130.7, cy: 107.1, r: 15.0 },
  { cx: 167.8, cy: 112.5, r: 15.5 },
  { cx: 206.0, cy: 117.3, r: 16.0 },
  { cx: 245.3, cy: 118.5, r: 16.5 },
  { cx: 285.6, cy: 112.7, r: 17.0 },
  { cx: 326.7, cy: 96.8, r: 17.5 },
  { cx: 368.5, cy: 67.6, r: 18.0 },
];

/** Decorative illustration matching the source design — purely ornamental. */
export function MalaIllustration() {
  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={190} viewBox="0 0 350 190">
        <Defs>
          <RadialGradient id="sd-bg" cx="30%" cy="25%" r="90%">
            <Stop offset="0" stopColor="#C27A57" />
            <Stop offset="1" stopColor="#7C3F2A" />
          </RadialGradient>
          <RadialGradient id="sd-bead" cx="35%" cy="30%" r="75%">
            <Stop offset="0" stopColor="#E7A27A" />
            <Stop offset="0.45" stopColor="#8E3F2B" />
            <Stop offset="1" stopColor="#4A1E14" />
          </RadialGradient>
        </Defs>
        <Rect width={350} height={190} fill="url(#sd-bg)" />
        {BEAD_POSITIONS.map((b, i) => (
          <Circle key={`shadow-${i}`} cx={b.cx} cy={b.cy + 5} r={b.r} fill="rgba(0,0,0,0.2)" />
        ))}
        <Path d="M-14 150 C90 20 230 200 380 50" fill="none" stroke="#3A1D16" strokeWidth={2} />
        {BEAD_POSITIONS.map((b, i) => (
          <Circle key={`bead-${i}`} cx={b.cx + 1.5} cy={b.cy - 5} r={b.r} fill="url(#sd-bead)" />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 24, marginHorizontal: 20, height: 190, borderRadius: 12, overflow: 'hidden' },
});
