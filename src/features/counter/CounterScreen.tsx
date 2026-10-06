import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {
  FloatingChantLayer,
  type FloatingChantLayerHandle,
} from '@/features/counter/components/FloatingChantLayer';
import { FocusTip } from '@/features/counter/components/FocusTip';
import { MalaLoop } from '@/features/counter/components/MalaLoop';
import { MantraPickerSheet } from '@/features/counter/components/MantraPickerSheet';
import {
  CELEBRATION_MS,
  milestoneText,
  RoundCelebration,
} from '@/features/counter/components/RoundCelebration';
import { useBeadCounter, type BeadEvent } from '@/features/counter/hooks/useBeadCounter';
import { Header } from '@/shared/components/Header';
import { EyesClosedIcon } from '@/shared/components/icons';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useHaptics } from '@/shared/hooks/useHaptics';
import { MALA_CANVAS, useMalaLayout } from '@/shared/hooks/useMalaGeometry';
import { useToday } from '@/shared/hooks/useToday';
import { fillFraction } from '@/shared/lib/beadMath';
import { displayName, findMantra, mergeMantras } from '@/shared/lib/mantraDisplay';
import { useMantraStore } from '@/shared/store/useMantraStore';
import {
  selectBeadsToday,
  selectRoundsToday,
  useProgressStore,
} from '@/shared/store/useProgressStore';
import { useSettingsStore } from '@/shared/store/useSettingsStore';
import { colors, fontFamily, radius, spacing, typeScale } from '@/shared/theme';
import { BEADS_PER_ROUND } from '@/shared/types/models';

const beadImage = require('../../../assets/images/rudraksha-bead.png');

const TAP_BUTTON_HEIGHT = 80;
const MAIN_PADDING_BOTTOM = 22;
const TAP_GAP = 12;

export function CounterScreen() {
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const lang = useSettingsStore((s) => s.lang);
  const risingMantra = useSettingsStore((s) => s.risingMantra);
  const animSpeed = useSettingsStore((s) => s.animSpeed);
  const goalMalas = useSettingsStore((s) => s.dailyGoalMalas);
  const focusDiscovered = useSettingsStore((s) => s.focusDiscovered);
  const markFocusDiscovered = useSettingsStore((s) => s.markFocusDiscovered);

  const catalog = useMantraStore((s) => s.catalog);
  const custom = useMantraStore((s) => s.custom);

  const today = useToday();
  const currentMantraId = useProgressStore((s) => s.currentMantraId);
  const beadsToday = useProgressStore((s) => selectBeadsToday(s, today));
  const roundsToday = useProgressStore((s) => selectRoundsToday(s, today));
  const canUndo = useProgressStore((s) => s.undoStack.length > 0);
  const setCurrentMantra = useProgressStore((s) => s.setCurrentMantra);
  const undoLastBead = useProgressStore((s) => s.undoLastBead);

  const [mainHeight, setMainHeight] = useState(0);
  const mala = useMalaLayout(
    mainHeight > 0 ? mainHeight - TAP_BUTTON_HEIGHT - MAIN_PADDING_BOTTOM - TAP_GAP : 0,
  );
  // Text tracks the canvas scale, but within readable bounds.
  const textScale = Math.min(Math.max(mala.scale, 0.8), 1.3);

  const { tick } = useHaptics();
  const countBead = useBeadCounter();
  const floatLayer = useRef<FloatingChantLayerHandle>(null);
  const navigation = useNavigation();

  const [celebration, setCelebration] = useState<{ id: number; event: BeadEvent } | null>(null);
  const clearCelebration = useCallback(
    (id: number) => setCelebration((c) => (c?.id === id ? null : c)),
    [],
  );

  // Eyes-closed mode discovery: the header button pulses until the mode has been
  // found, and a one-time tip appears after the first round (once the
  // celebration has played, so they don't overlap).
  const reduceMotion = useReducedMotion();
  const focusPulse = useSharedValue(1);
  useEffect(() => {
    if (focusDiscovered || reduceMotion) return;
    focusPulse.value = withDelay(
      600,
      withRepeat(
        withSequence(withTiming(1.18, { duration: 380 }), withTiming(1, { duration: 380 })),
        3,
      ),
    );
  }, [focusDiscovered, reduceMotion, focusPulse]);
  const focusPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusPulse.value }],
  }));

  const [showTip, setShowTip] = useState(false);
  const tipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (tipTimer.current) clearTimeout(tipTimer.current);
    },
    [],
  );
  const openFocus = useCallback(() => {
    setShowTip(false);
    markFocusDiscovered();
    navigation.navigate('Focus' as never);
  }, [markFocusDiscovered, navigation]);
  const dismissTip = useCallback(() => {
    setShowTip(false);
    markFocusDiscovered();
  }, [markFocusDiscovered]);

  const beadShake = useSharedValue(0);
  const [mantraOrigin, setMantraOrigin] = useState({ x: 103, y: 500, width: 184 });

  // Started straight from the tap handler: no state, so no extra render per bead.
  const shakeBead = () => {
    beadShake.value = withSequence(
      withTiming(-1, { duration: 40 }),
      withTiming(1, { duration: 60 }),
      withTiming(-0.5, { duration: 60 }),
      withTiming(0, { duration: 50 }),
    );
  };

  const beadShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: beadShake.value }],
  }));

  const customLabel = t('counter.customMantraLabel');
  const allMantras = useMemo(
    () => mergeMantras(catalog, custom, customLabel),
    [catalog, custom, customLabel],
  );
  const current = useMemo(
    () => findMantra(allMantras, currentMantraId) ?? allMantras[0],
    [allMantras, currentMantraId],
  );

  const beadsInRound =
    beadsToday % BEADS_PER_ROUND === 0 && beadsToday > 0
      ? BEADS_PER_ROUND
      : beadsToday % BEADS_PER_ROUND;

  const handleTap = () => {
    const event = countBead();
    if (!event) return; // paused after a round
    if (event.milestone) setCelebration({ id: Date.now(), event });
    if (event.roundCompleted && !focusDiscovered && !showTip && !tipTimer.current) {
      tipTimer.current = setTimeout(() => {
        tipTimer.current = null;
        setShowTip(true);
      }, CELEBRATION_MS);
    }
    shakeBead();
    if (risingMantra && current) {
      const isCustom = current.id.startsWith('custom-');
      const devanagari = lang === 'hi' && !isCustom && !!current.deva;
      floatLayer.current?.spawn(devanagari ? current.deva : current.chant, animSpeed, devanagari);
    }
  };

  const handleUndo = () => {
    tick();
    undoLastBead();
  };

  // Memoized so Header (React.memo) doesn't re-render on every bead.
  const focusButton = useMemo(
    () => (
      <TouchableOpacity
        onPress={openFocus}
        accessibilityRole="button"
        accessibilityLabel={t('counter.focusAria')}
        style={styles.focusButton}
      >
        <Animated.View style={focusPulseStyle}>
          <EyesClosedIcon size={20} color={colors.maroon} />
        </Animated.View>
        <Text style={styles.focusLabel} numberOfLines={1}>
          {t('counter.focusLabel')}
        </Text>
      </TouchableOpacity>
    ),
    [openFocus, focusPulseStyle, t],
  );

  const closeSheet = useCallback(() => setSheetOpen(false), []);
  const pickMantra = useCallback(
    (id: string) => {
      setCurrentMantra(id);
      setSheetOpen(false);
    },
    [setCurrentMantra],
  );

  const curName = current ? displayName(current, lang) : '';
  const curIsCustom = current?.id.startsWith('custom-');
  const curDevanagari = lang === 'hi' && !curIsCustom && !!current?.deva;

  return (
    <ScreenContainer>
      <Header title={t('appTitle')} right={focusButton} />

      <View
        style={styles.main}
        onLayout={(e) => {
          const h = Math.round(e.nativeEvent.layout.height);
          setMainHeight((prev) => (prev === h ? prev : h));
        }}
      >
        <View style={[styles.malaWrap, { width: mala.width, height: mala.height }]}>
          <MalaLoop beadsInRound={beadsInRound} scale={mala.scale} />

          <TouchableOpacity
            onPress={() => setSheetOpen(true)}
            accessibilityRole="button"
            style={[
              styles.mantraSelector,
              { left: 20 * mala.scale, top: 24 * mala.scale, width: 190 * mala.scale },
            ]}
          >
            <Text style={styles.mantraLabel}>{t('counter.currentMantra')} ▾</Text>
            <Text
              style={[
                styles.mantraName,
                curDevanagari && styles.devanagari,
                scaledFont(curName.length > 17 ? 26 : 32, textScale, 36),
              ]}
              numberOfLines={2}
            >
              {curName}
            </Text>
          </TouchableOpacity>

          <View
            style={[
              styles.statCard,
              {
                right: (MALA_CANVAS.width - 382) * mala.scale,
                top: 388 * mala.scale,
                width: Math.max(96, 112 * textScale),
              },
            ]}
          >
            <Text style={styles.statLabel}>{t('counter.beads')}</Text>
            <Text style={[styles.statValue, scaledFont(46, textScale)]}>{beadsToday}</Text>
            <View style={styles.fillTrack}>
              <View style={[styles.fillBar, { width: `${fillFraction(beadsInRound) * 100}%` }]} />
            </View>
            <Text style={styles.statLabel}>{t('counter.rounds')}</Text>
            <Text
              style={[styles.statValueSmall, scaledFont(32, textScale)]}
              accessibilityLabel={t('progress.malasOfGoal', { done: roundsToday, goal: goalMalas })}
            >
              {roundsToday}
              <Text style={[styles.statGoal, scaledFont(16, textScale)]}>/{goalMalas}</Text>
            </Text>
          </View>

          {celebration ? (
            <RoundCelebration
              key={celebration.id}
              id={celebration.id}
              {...milestoneText(celebration.event, t)}
              onDone={clearCelebration}
            />
          ) : null}
        </View>

        <TouchableOpacity
          onPress={handleTap}
          onLayout={(e) => {
            const { x, y, width } = e.nativeEvent.layout;
            setMantraOrigin((prev) =>
              prev.x === x && prev.y === y && prev.width === width ? prev : { x, y, width },
            );
          }}
          accessibilityRole="button"
          accessibilityLabel={t('counter.countAria')}
          style={styles.tapButton}
        >
          <Animated.View style={[styles.tapButtonInner, beadShakeStyle]}>
            <Image source={beadImage} style={styles.tapButtonBead} resizeMode="cover" />
          </Animated.View>
        </TouchableOpacity>

        {canUndo ? (
          <TouchableOpacity
            onPress={handleUndo}
            accessibilityRole="button"
            accessibilityLabel={t('counter.undoAria')}
            hitSlop={8}
            style={styles.undoButton}
          >
            <Text style={styles.undoGlyph}>↺</Text>
          </TouchableOpacity>
        ) : null}

        <FloatingChantLayer
          ref={floatLayer}
          originX={mantraOrigin.x}
          originY={mantraOrigin.y}
          originWidth={mantraOrigin.width}
        />

        {showTip ? <FocusTip onTry={openFocus} onDismiss={dismissTip} /> : null}
      </View>

      <MantraPickerSheet
        visible={sheetOpen}
        onClose={closeSheet}
        options={allMantras}
        currentId={currentMantraId}
        lang={lang}
        onPick={pickMantra}
      />
    </ScreenContainer>
  );
}

function scaledFont(fontSize: number, scale: number, lineHeight?: number) {
  return lineHeight
    ? { fontSize: Math.round(fontSize * scale), lineHeight: Math.round(lineHeight * scale) }
    : { fontSize: Math.round(fontSize * scale) };
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: MAIN_PADDING_BOTTOM,
  },
  malaWrap: { position: 'relative', overflow: 'hidden' },
  mantraSelector: { position: 'absolute' },
  mantraLabel: {
    ...typeScale.caption,
    color: colors.muted,
    fontFamily: fontFamily.sans600,
    letterSpacing: 2,
  },
  mantraName: {
    fontFamily: fontFamily.serif400Italic,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  devanagari: { fontFamily: fontFamily.devanagari400Italic },
  statCard: {
    position: 'absolute',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,252,247,0.92)',
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
  },
  statLabel: {
    ...typeScale.caption,
    fontSize: 10,
    color: colors.muted,
    fontFamily: fontFamily.sans600,
  },
  statValue: { fontFamily: fontFamily.serif400, color: colors.ink },
  statValueSmall: { fontFamily: fontFamily.serif400, color: colors.saffronDark },
  statGoal: { fontFamily: fontFamily.serif400, color: colors.muted },
  fillTrack: {
    height: 4,
    width: '75%',
    borderRadius: 2,
    backgroundColor: colors.line,
    overflow: 'hidden',
    marginVertical: spacing.xs,
  },
  fillBar: { height: 4, borderRadius: 2, backgroundColor: colors.maroon },
  focusButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  focusLabel: {
    marginTop: 1,
    fontFamily: fontFamily.sans600,
    fontSize: 10,
    lineHeight: 12,
    color: colors.maroon,
  },
  tapButton: {
    width: 184,
    height: TAP_BUTTON_HEIGHT,
    borderRadius: TAP_BUTTON_HEIGHT / 2,
    backgroundColor: colors.maroon,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.maroon,
    shadowOpacity: 0.3,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  tapButtonInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tapButtonBead: { width: 54, height: 54 },
  // Sits beside the tap button, far enough from it that a missed tap doesn't land here.
  undoButton: {
    position: 'absolute',
    left: '50%',
    marginLeft: 92 + 20,
    bottom: MAIN_PADDING_BOTTOM + (TAP_BUTTON_HEIGHT - 44) / 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  undoGlyph: { fontSize: 22, color: colors.muted, marginTop: -2 },
});
