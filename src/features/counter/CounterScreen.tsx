import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { MalaLoop } from '@/features/counter/components/MalaLoop';
import { MantraPickerSheet } from '@/features/counter/components/MantraPickerSheet';
import { RisingMantra } from '@/features/counter/components/RisingMantra';
import { useFloatingChants } from '@/features/counter/hooks/useFloatingChants';
import { Header } from '@/shared/components/Header';
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

  const catalog = useMantraStore((s) => s.catalog);
  const custom = useMantraStore((s) => s.custom);

  const today = useToday();
  const currentMantraId = useProgressStore((s) => s.currentMantraId);
  const beadsToday = useProgressStore((s) => selectBeadsToday(s, today));
  const roundsToday = useProgressStore((s) => selectRoundsToday(s, today));
  const canUndo = useProgressStore((s) => s.undoStack.length > 0);
  const setCurrentMantra = useProgressStore((s) => s.setCurrentMantra);
  const tapBead = useProgressStore((s) => s.tapBead);
  const undoLastBead = useProgressStore((s) => s.undoLastBead);

  const [mainHeight, setMainHeight] = useState(0);
  const mala = useMalaLayout(
    mainHeight > 0 ? mainHeight - TAP_BUTTON_HEIGHT - MAIN_PADDING_BOTTOM - TAP_GAP : 0,
  );
  // Text tracks the canvas scale, but within readable bounds.
  const textScale = Math.min(Math.max(mala.scale, 0.8), 1.3);

  const { tick } = useHaptics();
  const { floats, spawn, remove } = useFloatingChants();

  const [shakeTick, setShakeTick] = useState(0);
  const beadShake = useSharedValue(0);
  const [mantraOrigin, setMantraOrigin] = useState({ x: 103, y: 500, width: 184 });

  useEffect(() => {
    if (shakeTick === 0) return;
    beadShake.value = withSequence(
      withTiming(-1, { duration: 40 }),
      withTiming(1, { duration: 60 }),
      withTiming(-0.5, { duration: 60 }),
      withTiming(0, { duration: 50 }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shakeTick]);

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
    tick();
    tapBead();
    setShakeTick((n) => n + 1);
    if (risingMantra && current) {
      const isCustom = current.id.startsWith('custom-');
      const devanagari = lang === 'hi' && !isCustom && !!current.deva;
      spawn(devanagari ? current.deva : current.chant, animSpeed, devanagari);
    }
  };

  const handleUndo = () => {
    tick();
    undoLastBead();
  };

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
      <Header title={t('appTitle')} />

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
            <Text style={[styles.statValueSmall, scaledFont(32, textScale)]}>{roundsToday}</Text>
          </View>
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

        {floats.map((f) => (
          <RisingMantra
            key={f.key}
            id={f.key}
            chant={f.chant}
            durationMs={f.durationMs}
            dx={f.dx}
            devanagari={f.devanagari}
            onDone={remove}
            originX={mantraOrigin.x}
            originY={mantraOrigin.y}
            originWidth={mantraOrigin.width}
          />
        ))}
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
  fillTrack: {
    height: 4,
    width: '75%',
    borderRadius: 2,
    backgroundColor: colors.line,
    overflow: 'hidden',
    marginVertical: spacing.xs,
  },
  fillBar: { height: 4, borderRadius: 2, backgroundColor: colors.maroon },
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
