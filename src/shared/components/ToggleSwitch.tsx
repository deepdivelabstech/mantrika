import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/shared/theme';

type Props = { value: boolean; onChange: (v: boolean) => void; accessibilityLabel: string };

const TRACK_WIDTH = 52;
const KNOB = 24;
const INSET = 3;
const TRAVEL = TRACK_WIDTH - KNOB - INSET * 2;
const TRACK_OFF = '#D8C7B4';
// Slightly overdamped: settles quickly with no visible wobble.
const SPRING = { damping: 20, stiffness: 260, mass: 0.7 };

/**
 * Custom pill switch matching the design (a native Switch renders differently
 * per platform). Knob slide, track colour and press squash all run on the UI
 * thread, so the switch stays smooth even while JS re-renders the screen.
 */
export function ToggleSwitch({ value, onChange, accessibilityLabel }: Props) {
  const progress = useSharedValue(value ? 1 : 0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, SPRING);
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [TRACK_OFF, colors.maroon]),
  }));

  // The knob stretches a little while held, like iOS, so the press feels physical.
  const knobStyle = useAnimatedStyle(() => {
    const stretch = pressed.value * 4;
    return {
      width: KNOB + stretch,
      transform: [{ translateX: progress.value * (TRAVEL - stretch) }],
    };
  });

  return (
    <Pressable
      onPress={() => onChange(!value)}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 120 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 160 });
      }}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={styles.hitArea}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.knob, knobStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hitArea: { width: 56, height: 44, alignItems: 'flex-end', justifyContent: 'center' },
  track: { width: TRACK_WIDTH, height: 30, borderRadius: 15, justifyContent: 'center' },
  knob: {
    position: 'absolute',
    top: INSET,
    left: INSET,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: colors.ground,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
