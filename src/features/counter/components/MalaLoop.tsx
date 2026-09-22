import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { ClipPath, Defs, Image as SvgImage, Pattern, Polygon, Rect } from 'react-native-svg';

import { useMalaGeometry } from '@/shared/hooks/useMalaGeometry';
import { colors } from '@/shared/theme';

const handImage = require('../../../../assets/images/mala-hand.png');
const beadImage = require('../../../../assets/images/rudraksha-bead.png');

const AnimatedPath = Animated.createAnimatedComponent(require('react-native-svg').Path);

const WIDTH = 390;
const HEIGHT = 584;

type Props = { beadsInRound: number };

// clip-path polygon from the source design, given in the hand image's own
// local box — offset here by the image's canvas position (155.5, -35) since
// SVG clipPath coordinates are in the referencing element's user space, not
// the clipped element's local box like CSS clip-path is.
const THUMB_CLIP_POINTS = [
  [167.1, 258.4],
  [174.0, 254.7],
  [183.2, 253.5],
  [192.5, 254.2],
  [198.9, 257.9],
  [203.5, 263.0],
  [205.9, 269.9],
  [205.9, 273.6],
  [198.9, 282.9],
  [194.3, 287.0],
  [186.0, 290.7],
  [177.7, 290.2],
  [169.4, 285.2],
  [164.7, 277.3],
  [164.6, 269.9],
  [165.2, 263.5],
]
  .map(([x, y]) => `${x},${y}`)
  .join(' ');

/** The teardrop-shaped 108-bead loop with a larger "guru" bead, filling as beads are counted. */
export function MalaLoop({ beadsInRound }: Props) {
  const { path, beadDashOffset, guruDashOffset, fullLoopLength } = useMalaGeometry(beadsInRound);
  const beadOffset = useSharedValue(fullLoopLength);
  const guruOffset = useSharedValue(fullLoopLength);

  useEffect(() => {
    beadOffset.value = withTiming(beadDashOffset, { duration: 320 });
    guruOffset.value = withTiming(guruDashOffset, { duration: 320 });
  }, [beadDashOffset, guruDashOffset, beadOffset, guruOffset]);

  const beadAnimatedProps = useAnimatedProps(() => ({ strokeDashoffset: beadOffset.value }));
  const guruAnimatedProps = useAnimatedProps(() => ({ strokeDashoffset: guruOffset.value }));

  return (
    <View style={styles.container}>
      <Image
        source={handImage}
        resizeMode="contain"
        style={styles.hand}
        accessibilityIgnoresInvertColors
        accessible={false}
      />
      <Svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <Pattern
            id="beadTex"
            patternUnits="userSpaceOnUse"
            width={9.7}
            height={9.7}
            x={-4.85}
            y={-4.85}
          >
            <Rect width={9.7} height={9.7} fill={colors.maroon} />
            <SvgImage
              href={beadImage}
              x={-4.85}
              y={-4.85}
              width={19.4}
              height={19.4}
              preserveAspectRatio="xMidYMid slice"
            />
          </Pattern>
          <Pattern
            id="guruTex"
            patternUnits="userSpaceOnUse"
            width={21.7}
            height={21.7}
            x={-10.85}
            y={-10.85}
          >
            <Rect width={21.7} height={21.7} fill={colors.saffronDark} />
            <SvgImage
              href={beadImage}
              x={-10.85}
              y={-10.85}
              width={43.4}
              height={43.4}
              preserveAspectRatio="xMidYMid slice"
            />
          </Pattern>
          {/* Thumb-tip cutout of the hand photo, drawn after the loop below so the
              thumb appears pinching the beads instead of hidden behind them. */}
          <ClipPath id="thumbClip">
            <Polygon points={THUMB_CLIP_POINTS} />
          </ClipPath>
        </Defs>

        {/* Base loop */}
        <AnimatedPath d={path} fill="none" stroke={colors.ink} strokeWidth={1.1} />

        {/* Progress: thin bead track */}
        <AnimatedPath
          d={path}
          fill="none"
          stroke={colors.overlayLight}
          strokeWidth={8.7}
          strokeLinecap="round"
          strokeDasharray={`0 6.258`}
          animatedProps={beadAnimatedProps}
        />
        <AnimatedPath
          d={path}
          fill="none"
          stroke="url(#beadTex)"
          strokeWidth={7.5}
          strokeLinecap="round"
          strokeDasharray={`0 6.258`}
          animatedProps={beadAnimatedProps}
        />

        {/* Guru bead ring (thicker, textured) */}
        <AnimatedPath
          d={path}
          fill="none"
          stroke={colors.overlay}
          strokeWidth={19.6}
          strokeLinecap="round"
          strokeDasharray={`0 ${fullLoopLength}`}
          animatedProps={guruAnimatedProps}
        />
        <AnimatedPath
          d={path}
          fill="none"
          stroke="url(#guruTex)"
          strokeWidth={18.1}
          strokeLinecap="round"
          strokeDasharray={`0 ${fullLoopLength}`}
          animatedProps={guruAnimatedProps}
        />

        <SvgImage
          href={handImage}
          x={155.5}
          y={-35}
          width={236.5}
          height={332.5}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#thumbClip)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: WIDTH, height: HEIGHT, alignSelf: 'center' },
  hand: { position: 'absolute', left: 155.5, top: -35, width: 236.5, height: 332.5 },
});
