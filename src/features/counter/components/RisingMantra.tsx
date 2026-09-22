import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, fontFamily } from '@/shared/theme';

type Props = {
  chant: string;
  durationMs: number;
  dx: number;
  devanagari: boolean;
  onDone: () => void;
};

/** One floating chant instance: rises from the mala and fades out, then unmounts itself. */
export function RisingMantra({ chant, durationMs, dx, devanagari, onDone }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(
      1,
      { duration: durationMs, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(onDone)();
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => {
    const translateY = -140 * progress.value;
    const scale = 0.94 + 0.1 * progress.value;
    const opacity =
      progress.value < 0.16
        ? progress.value / 0.16
        : progress.value < 0.62
          ? 1
          : 1 - (progress.value - 0.62) / 0.38;
    return {
      opacity: Math.max(0, opacity),
      transform: [{ translateX: dx }, { translateY }, { scale }],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, style]}>
      <Text
        style={[
          styles.text,
          devanagari && styles.devanagari,
          { fontSize: chant.length > 24 ? 17 : 21 },
        ]}
      >
        {chant}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 189, top: 462, alignItems: 'center' },
  text: { fontFamily: fontFamily.serif400Italic, color: colors.maroon },
  devanagari: { fontFamily: fontFamily.devanagari400Italic },
});
