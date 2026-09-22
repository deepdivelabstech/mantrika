import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors } from '@/shared/theme';

type Props = { value: boolean; onChange: (v: boolean) => void; accessibilityLabel: string };

/** Custom pill switch matching the design (a native Switch renders differently per platform). */
export function ToggleSwitch({ value, onChange, accessibilityLabel }: Props) {
  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={styles.hitArea}
    >
      <View style={[styles.track, { backgroundColor: value ? colors.maroon : '#D8C7B4' }]}>
        <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hitArea: { width: 56, height: 44, alignItems: 'flex-end', justifyContent: 'center' },
  track: { width: 52, height: 30, borderRadius: 15, justifyContent: 'center' },
  knob: {
    position: 'absolute',
    top: 3,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.ground,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  knobOff: { left: 3 },
  knobOn: { left: 25 },
});
