import React, { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { colors, fontFamily, radius, spacing } from '@/shared/theme';

type Props = { onTry: () => void; onDismiss: () => void };

// The header's right button is centred 34pt from the screen edge (12 padding + half
// its 44pt slot). With the tip inset 8pt, a 14pt caret needs 34 - 8 - 7 = 19pt.
const CARET_MARGIN_RIGHT = 19;

/**
 * One-time pointer to eyes-closed mode, shown after the first completed round —
 * when someone is clearly chanting. Sits in the top-right corner only, so the
 * tap button stays reachable and counting can continue underneath.
 */
export function FocusTip({ onTry, onDismiss }: Props) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const shown = useSharedValue(0);

  useEffect(() => {
    shown.value = withTiming(1, { duration: 260 });
    AccessibilityInfo.announceForAccessibility(t('counter.focusTip'));
  }, [shown, t]);

  const style = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: reduceMotion ? 0 : (1 - shown.value) * -8 }],
  }));

  return (
    <Animated.View style={[styles.wrap, style]}>
      <View style={styles.caret} />
      <View style={styles.bubble}>
        <Text style={styles.text}>{t('counter.focusTip')}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onDismiss} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.dismiss}>{t('counter.focusTipDismiss')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onTry} accessibilityRole="button" style={styles.try}>
            <Text style={styles.tryText}>{t('counter.focusTipTry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 4, right: 8, width: 250, alignItems: 'flex-end' },
  caret: {
    marginRight: CARET_MARGIN_RIGHT,
    width: 14,
    height: 14,
    backgroundColor: colors.maroon,
    transform: [{ rotate: '45deg' }],
    marginBottom: -7,
  },
  bubble: {
    alignSelf: 'stretch',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.maroon,
    shadowColor: colors.maroon,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  text: { fontFamily: fontFamily.sans500, fontSize: 14, lineHeight: 20, color: colors.ground },
  actions: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  dismiss: { fontFamily: fontFamily.sans600, fontSize: 13, color: '#E9C9B3' },
  try: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.ground,
  },
  tryText: { fontFamily: fontFamily.sans700, fontSize: 13, color: colors.maroon },
});
