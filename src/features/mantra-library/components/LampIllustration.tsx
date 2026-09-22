import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

/** Decorative lit-lamp illustration matching the source design's daily recommendation card. */
export function LampIllustration() {
  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={230} viewBox="0 0 307 230">
        <Defs>
          <RadialGradient id="sm-orb" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFE9C4" stopOpacity={0.6} />
            <Stop offset="1" stopColor="#FFE9C4" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="sm-fl" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FF9F3D" stopOpacity={0.45} />
            <Stop offset="1" stopColor="#FF9F3D" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={307} height={230} fill="#1C110C" />
        <Circle cx={80} cy={70} r={74} fill="url(#sm-orb)" />
        <Circle cx={80} cy={70} r={24} fill="#FFF0D2" />
        <Path
          d="M238 30 C 216 58, 258 78, 234 108 S 252 148, 238 170"
          fill="none"
          stroke="#FFEBD2"
          strokeOpacity={0.3}
          strokeWidth={5}
          strokeLinecap="round"
        />
        <Path
          d="M254 44 C 240 62, 268 84, 252 112"
          fill="none"
          stroke="#FFEBD2"
          strokeOpacity={0.18}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <Circle cx={150} cy={150} r={64} fill="url(#sm-fl)" />
        <Rect y={198} width={307} height={32} fill="#2B1911" />
        <Rect y={198} width={307} height={1.5} fill="#4A2C1D" />
        <Path d="M96 178 C 104 214, 196 214, 204 178 Z" fill="#A8552B" />
        <Ellipse cx={150} cy={178} rx={54} ry={9} fill="#C9743F" />
        <Ellipse cx={150} cy={178} rx={44} ry={6} fill="#5A2A14" />
        <Path
          d="M150 118 C 136 140, 134 160, 150 174 C 166 160, 164 140, 150 118Z"
          fill="#FFB347"
        />
        <Path
          d="M150 142 C 144 154, 145 164, 150 170 C 155 164, 156 154, 150 142Z"
          fill="#FFF0C2"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 6, overflow: 'hidden' },
});
