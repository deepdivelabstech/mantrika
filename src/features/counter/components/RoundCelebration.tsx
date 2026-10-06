import React, { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import type { BeadEvent } from '@/features/counter/hooks/useBeadCounter';
import { colors, fontFamily } from '@/shared/theme';

export const CELEBRATION_MS = 1900;

type Props = {
  id: number;
  title: string;
  subtitle?: string;
  /** Colour scheme: light for the Counter, dark for eyes-closed mode. */
  tone?: 'light' | 'dark';
  onDone: (id: number) => void;
};

/**
 * The round-complete moment: a warm halo blooms and the milestone text rises
 * and fades. Never intercepts touches — practitioners keep counting through
 * it — and is announced to screen readers. Reduced motion keeps the fade only.
 */
export const RoundCelebration = React.memo(function RoundCelebration({
  id,
  title,
  subtitle,
  tone = 'light',
  onDone,
}: Props) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(subtitle ? `${title}. ${subtitle}` : title);
    progress.value = withTiming(1, {
      duration: CELEBRATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withSequence(
      withTiming(1, { duration: 280 }),
      withDelay(
        CELEBRATION_MS - 280 - 520,
        withTiming(0, { duration: 520 }, (finished) => {
          if (finished) runOnJS(onDone)(id);
        }),
      ),
    );
    // Runs once per celebration; a new milestone mounts a new instance (keyed by id).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.55,
    transform: [{ scale: reduceMotion ? 1 : 0.6 + progress.value * 0.8 }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: reduceMotion ? 0 : 12 - progress.value * 18 }],
  }));

  const dark = tone === 'dark';
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.center}>
        <Animated.View style={[styles.halo, dark && styles.haloDark, haloStyle]} />
        <Animated.View style={[styles.textBlock, dark && styles.textBlockDark, textStyle]}>
          <Text style={[styles.title, dark && styles.titleDark]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, dark && styles.subtitleDark]}>{subtitle}</Text>
          ) : null}
        </Animated.View>
      </View>
    </View>
  );
});

type TFn = (key: string, options?: Record<string, unknown>) => string;

/** Headline for a milestone tap: the biggest achievement leads, the round follows. */
export function milestoneText(event: BeadEvent, t: TFn): { title: string; subtitle?: string } {
  const round = t('counter.roundComplete', { count: event.roundsToday });
  switch (event.milestone) {
    case 'sankalpa':
      return {
        title: t('counter.sankalpaDone'),
        subtitle: event.roundCompleted ? round : undefined,
      };
    case 'goal':
      return { title: t('counter.goalReached'), subtitle: round };
    default:
      return { title: round };
  }
}

const HALO = 260;

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: HALO,
    height: HALO,
    borderRadius: HALO / 2,
    backgroundColor: '#F7C98F',
    shadowColor: colors.saffron,
    shadowOpacity: 0.9,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  haloDark: { backgroundColor: '#5A2A16', shadowColor: colors.saffronDark },
  textBlock: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(251,247,241,0.94)',
    alignItems: 'center',
  },
  textBlockDark: { backgroundColor: 'transparent' },
  title: { fontFamily: fontFamily.serif400Italic, fontSize: 26, color: colors.maroon },
  titleDark: { color: '#E9B987' },
  subtitle: { marginTop: 2, fontFamily: fontFamily.sans600, fontSize: 13, color: colors.muted },
  subtitleDark: { color: '#9C7A63' },
});
