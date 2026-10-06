import React, { useCallback, useEffect, useRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { colors, fontFamily } from '@/shared/theme';

const ring = require('../../assets/images/splash-ring.png');

// Must match `imageWidth` of the expo-splash-screen plugin in app.config.ts so
// the ring starts exactly where the native splash left it.
const RING_SIZE = 120;
const HALO_SIZE = 280;
const RING_LIFT = 56;
const WORDMARK_WIDTH = 320;

const EXIT_AT = 1900;
const EXIT_MS = 380;

const ease = Easing.out(Easing.cubic);

type Props = { onFinish: () => void };

/**
 * In-app continuation of the native splash. It opens on the identical bead
 * ring (same image, size and centre), so the hand-off is invisible. Then a
 * saffron halo blooms, the ring rises and turns a few beads as if counted,
 * and the wordmark settles in beneath it before everything fades away.
 * Tap anywhere to skip.
 */
export function AnimatedSplash({ onFinish }: Props) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  // Read through a ref so a re-render of the parent (which passes an inline
  // callback) can't restart the animation, and a tap-to-skip can't fire twice.
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);
  const finished = useRef(false);
  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onFinishRef.current();
  }, []);

  const halo = useSharedValue(0);
  const lift = useSharedValue(0);
  const turn = useSharedValue(0);
  const title = useSharedValue(0);
  const rule = useSharedValue(0);
  const tagline = useSharedValue(0);
  const exit = useSharedValue(0);

  useEffect(() => {
    const done = (finished?: boolean) => {
      'worklet';
      if (finished) runOnJS(finish)();
    };

    if (reduceMotion) {
      title.value = withTiming(1, { duration: 300 });
      rule.value = withTiming(1, { duration: 300 });
      tagline.value = withTiming(1, { duration: 300 });
      halo.value = withTiming(1, { duration: 300 });
      lift.value = 1;
      exit.value = withDelay(1400, withTiming(1, { duration: 250 }, done));
      return;
    }

    halo.value = withTiming(1, { duration: 900, easing: ease });
    turn.value = withTiming(1, { duration: EXIT_AT + EXIT_MS, easing: Easing.inOut(Easing.sin) });
    lift.value = withDelay(250, withTiming(1, { duration: 650, easing: ease }));
    title.value = withDelay(500, withTiming(1, { duration: 600, easing: ease }));
    rule.value = withDelay(750, withTiming(1, { duration: 500, easing: ease }));
    tagline.value = withDelay(900, withTiming(1, { duration: 600, easing: ease }));
    exit.value = withDelay(
      EXIT_AT,
      withTiming(1, { duration: EXIT_MS, easing: Easing.in(Easing.quad) }, done),
    );
  }, [reduceMotion, finish, halo, lift, turn, title, rule, tagline, exit]);

  const rootStyle = useAnimatedStyle(() => ({ opacity: 1 - exit.value }));

  const groupStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -RING_LIFT * lift.value }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: halo.value * (1 - exit.value * 0.5),
    transform: [{ scale: 0.55 + 0.45 * halo.value + 0.25 * exit.value }],
  }));

  // 18 beads around the ring: 40° turns it two beads, like counting on a mala.
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${40 * turn.value}deg` }, { scale: 1 + 0.12 * exit.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: title.value,
    transform: [{ translateY: 14 * (1 - title.value) }],
  }));
  const ruleStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: rule.value }] }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: tagline.value,
    transform: [{ translateY: 10 * (1 - tagline.value) }],
  }));

  return (
    <Animated.View style={[styles.root, rootStyle]}>
      <Pressable
        style={styles.fill}
        onPress={finish}
        accessibilityRole="button"
        accessibilityLabel="Mantrika"
      >
        <View style={styles.center}>
          {/* Halo and wordmark are absolutely positioned around the ring so
              they rise with it and never shift its starting centre. */}
          <Animated.View style={[styles.group, groupStyle]}>
            <Animated.View style={[styles.halo, haloStyle]} pointerEvents="none">
              <Svg width={HALO_SIZE} height={HALO_SIZE}>
                <Defs>
                  <RadialGradient id="splashHalo" cx="50%" cy="50%" r="50%">
                    <Stop offset="0" stopColor={colors.saffron} stopOpacity={0.38} />
                    <Stop offset="0.55" stopColor={colors.saffron} stopOpacity={0.14} />
                    <Stop offset="1" stopColor={colors.saffron} stopOpacity={0} />
                  </RadialGradient>
                </Defs>
                <Circle
                  cx={HALO_SIZE / 2}
                  cy={HALO_SIZE / 2}
                  r={HALO_SIZE / 2}
                  fill="url(#splashHalo)"
                />
              </Svg>
            </Animated.View>

            <Animated.View style={ringStyle}>
              <Image source={ring} style={styles.ring} accessibilityIgnoresInvertColors />
            </Animated.View>

            <View style={styles.wordmark} pointerEvents="none">
              <Animated.Text style={[styles.title, titleStyle]}>Mantrika</Animated.Text>
              <Animated.View style={[styles.rule, ruleStyle]} />
              <Animated.View style={taglineStyle}>
                <Text style={styles.tagline}>{t('onboarding.splashTagline')}</Text>
              </Animated.View>
            </View>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, backgroundColor: colors.ground },
  fill: { flex: 1 },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    left: (RING_SIZE - HALO_SIZE) / 2,
    top: (RING_SIZE - HALO_SIZE) / 2,
    width: HALO_SIZE,
    height: HALO_SIZE,
  },
  group: { width: RING_SIZE, height: RING_SIZE },
  ring: { width: RING_SIZE, height: RING_SIZE },
  wordmark: {
    position: 'absolute',
    top: RING_SIZE + 26,
    left: (RING_SIZE - WORDMARK_WIDTH) / 2,
    width: WORDMARK_WIDTH,
    alignItems: 'center',
  },
  title: {
    fontFamily: fontFamily.serif400,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: 0.5,
    color: colors.maroon,
  },
  rule: {
    width: 44,
    height: 1.5,
    marginTop: 14,
    marginBottom: 14,
    borderRadius: 1,
    backgroundColor: colors.saffron,
  },
  tagline: {
    fontFamily: fontFamily.sans600,
    fontSize: 12,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: colors.muted,
  },
});
