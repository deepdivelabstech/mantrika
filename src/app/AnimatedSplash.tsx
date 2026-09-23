import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { BrandMark } from '@/shared/components/BrandMark';
import { colors, fontFamily } from '@/shared/theme';

type Props = { onFinish: () => void };

/**
 * In-app continuation of the native splash: same ground colour and brand mark,
 * so the handoff from the OS splash is seamless, then fades away.
 */
export function AnimatedSplash({ onFinish }: Props) {
  const { t } = useTranslation();
  const enter = useSharedValue(0);
  const exit = useSharedValue(1);

  useEffect(() => {
    enter.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    exit.value = withDelay(
      1300,
      withTiming(0, { duration: 350 }, (done) => {
        if (done) runOnJS(onFinish)();
      }),
    );
  }, [enter, exit, onFinish]);

  const container = useAnimatedStyle(() => ({ opacity: exit.value }));
  const content = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ scale: 0.9 + 0.1 * enter.value }],
  }));

  return (
    <Animated.View style={[styles.root, container]} pointerEvents="auto">
      <Animated.View style={[styles.content, content]}>
        <BrandMark size={96} />
        <Text style={styles.title}>Mantrika</Text>
        <Text style={styles.tagline}>{t('onboarding.splashTagline')}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.ground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { alignItems: 'center' },
  title: { marginTop: 20, fontFamily: fontFamily.serif400, fontSize: 36, color: colors.maroon },
  tagline: {
    marginTop: 8,
    fontFamily: fontFamily.sans600,
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.muted,
  },
});
