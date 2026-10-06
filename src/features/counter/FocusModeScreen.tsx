import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { endPracticeSession } from '@/app/ads';
import { milestoneText, RoundCelebration } from '@/features/counter/components/RoundCelebration';
import { useBeadCounter, type BeadEvent } from '@/features/counter/hooks/useBeadCounter';
import { CloseIcon } from '@/shared/components/icons';
import { useHaptics } from '@/shared/hooks/useHaptics';
import { useToday } from '@/shared/hooks/useToday';
import { displayName, findMantra, mergeMantras } from '@/shared/lib/mantraDisplay';
import { useMantraStore } from '@/shared/store/useMantraStore';
import {
  selectBeadsToday,
  selectRoundsToday,
  useProgressStore,
} from '@/shared/store/useProgressStore';
import { useSettingsStore } from '@/shared/store/useSettingsStore';
import { fontFamily } from '@/shared/theme';
import { BEADS_PER_ROUND } from '@/shared/types/models';

const HINT_VISIBLE_MS = 4000;
const LONG_PRESS_EXIT_MS = 700;

// Near-black warm palette: on OLED this is as good as dimming the panel, and it
// needs no brightness permission or native module.
const BG = '#0E0806';
const DIM = 'rgba(233,185,135,0.32)';
const FAINT = 'rgba(233,185,135,0.18)';

/**
 * Eyes-closed counting: the whole screen is the bead. Tap anywhere to count
 * (haptics confirm each bead and mark each round), hold to exit. The screen
 * stays awake and nearly black; counts are kept faint so they don't pull the
 * eyes open.
 */
export function FocusModeScreen() {
  useKeepAwake();
  const markFocusDiscovered = useSettingsStore((s) => s.markFocusDiscovered);
  useEffect(markFocusDiscovered, [markFocusDiscovered]);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { tick } = useHaptics();
  const countBead = useBeadCounter();

  const lang = useSettingsStore((s) => s.lang);
  const goalMalas = useSettingsStore((s) => s.dailyGoalMalas);
  const catalog = useMantraStore((s) => s.catalog);
  const custom = useMantraStore((s) => s.custom);
  const currentMantraId = useProgressStore((s) => s.currentMantraId);
  const today = useToday();
  const beadsToday = useProgressStore((s) => selectBeadsToday(s, today));
  const roundsToday = useProgressStore((s) => selectRoundsToday(s, today));

  const customLabel = t('counter.customMantraLabel');
  const mantraName = useMemo(() => {
    const m = findMantra(mergeMantras(catalog, custom, customLabel), currentMantraId);
    return m ? displayName(m, lang) : '';
  }, [catalog, custom, customLabel, currentMantraId, lang]);

  const [celebration, setCelebration] = useState<{ id: number; event: BeadEvent } | null>(null);
  const clearCelebration = useCallback(
    (id: number) => setCelebration((c) => (c?.id === id ? null : c)),
    [],
  );

  const hintOpacity = useSharedValue(1);
  const hintStyle = useAnimatedStyle(() => ({ opacity: hintOpacity.value }));
  useEffect(() => {
    const timer = setTimeout(() => {
      hintOpacity.value = withTiming(0, { duration: 900 });
    }, HINT_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [hintOpacity]);

  const handleTap = useCallback(() => {
    const event = countBead();
    if (event?.milestone) setCelebration({ id: Date.now(), event });
  }, [countBead]);

  const exit = useCallback(() => {
    tick();
    navigation.goBack();
    endPracticeSession();
  }, [navigation, tick]);

  const beadsInRound =
    beadsToday % BEADS_PER_ROUND === 0 && beadsToday > 0
      ? BEADS_PER_ROUND
      : beadsToday % BEADS_PER_ROUND;

  const celebrationText = celebration ? milestoneText(celebration.event, t) : null;

  return (
    <View style={styles.root}>
      <StatusBar hidden style="light" />
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleTap}
        onLongPress={exit}
        delayLongPress={LONG_PRESS_EXIT_MS}
        accessibilityRole="button"
        accessibilityLabel={t('focus.tapAria')}
        accessibilityHint={t('focus.tapHint')}
      >
        <View style={styles.center}>
          <Text style={styles.mantra} numberOfLines={2}>
            {mantraName}
          </Text>
          <Text style={styles.count}>{beadsInRound}</Text>
          <Text style={styles.meta}>
            {t('progress.malasOfGoal', { done: roundsToday, goal: goalMalas })}
          </Text>
        </View>
        <Animated.Text
          style={[styles.hint, { bottom: insets.bottom + 40 }, hintStyle]}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {t('focus.hint')}
        </Animated.Text>
      </Pressable>

      <Pressable
        onPress={exit}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('focus.exitAria')}
        style={[styles.close, { top: insets.top + 12 }]}
      >
        <CloseIcon size={20} color={FAINT} />
      </Pressable>

      {celebration && celebrationText ? (
        <RoundCelebration
          key={celebration.id}
          id={celebration.id}
          title={celebrationText.title}
          subtitle={celebrationText.subtitle}
          tone="dark"
          onDone={clearCelebration}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  mantra: {
    fontFamily: fontFamily.serif400Italic,
    fontSize: 22,
    color: FAINT,
    textAlign: 'center',
  },
  count: {
    marginTop: 12,
    fontFamily: fontFamily.serif400,
    fontSize: 96,
    lineHeight: 104,
    color: DIM,
    fontVariant: ['tabular-nums'],
  },
  meta: { marginTop: 4, fontFamily: fontFamily.sans600, fontSize: 13, color: FAINT },
  hint: {
    position: 'absolute',
    left: 24,
    right: 24,
    textAlign: 'center',
    fontFamily: fontFamily.sans500,
    fontSize: 13,
    color: DIM,
  },
  close: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
