import React, { useEffect, useState } from 'react';
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
import { useSound } from '@/shared/hooks/useSound';
import { fillFraction } from '@/shared/lib/beadMath';
import { displayName, findMantra, mergeMantras } from '@/shared/lib/mantraDisplay';
import { useMantraStore } from '@/shared/store/useMantraStore';
import { useProgressStore } from '@/shared/store/useProgressStore';
import { useSettingsStore } from '@/shared/store/useSettingsStore';
import { colors, fontFamily, radius, spacing, typeScale } from '@/shared/theme';
import { BEADS_PER_ROUND } from '@/shared/types/models';

const beadImage = require('../../../assets/images/rudraksha-bead.png');

export function CounterScreen() {
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const lang = useSettingsStore((s) => s.lang);
  const risingMantra = useSettingsStore((s) => s.risingMantra);
  const animSpeed = useSettingsStore((s) => s.animSpeed);

  const catalog = useMantraStore((s) => s.catalog);
  const custom = useMantraStore((s) => s.custom);

  const currentMantraId = useProgressStore((s) => s.currentMantraId);
  const beadsToday = useProgressStore((s) => s.beadsToday);
  const roundsToday = useProgressStore((s) => s.roundsToday);
  const setCurrentMantra = useProgressStore((s) => s.setCurrentMantra);
  const tapBead = useProgressStore((s) => s.tapBead);

  const { tick } = useHaptics();
  useSound();
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

  const allMantras = mergeMantras(catalog, custom, t('counter.customMantraLabel'));
  const current = findMantra(allMantras, currentMantraId) ?? allMantras[0];

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

  const curName = current ? displayName(current, lang) : '';
  const curIsCustom = current?.id.startsWith('custom-');
  const curDevanagari = lang === 'hi' && !curIsCustom && !!current?.deva;

  return (
    <ScreenContainer>
      <Header title={t('appTitle')} showSettings />

      <View style={styles.main}>
        <View style={styles.malaWrap}>
          <MalaLoop beadsInRound={beadsInRound} />

          <TouchableOpacity
            onPress={() => setSheetOpen(true)}
            accessibilityRole="button"
            style={styles.mantraSelector}
          >
            <Text style={styles.mantraLabel}>{t('counter.currentMantra')} ▾</Text>
            <Text
              style={[
                styles.mantraName,
                curDevanagari && styles.devanagari,
                curName.length > 17 && styles.mantraNameSmall,
              ]}
              numberOfLines={2}
            >
              {curName}
            </Text>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('counter.beads')}</Text>
            <Text style={styles.statValue}>{beadsToday}</Text>
            <View style={styles.fillTrack}>
              <View style={[styles.fillBar, { width: `${fillFraction(beadsInRound) * 100}%` }]} />
            </View>
            <Text style={styles.statLabel}>{t('counter.rounds')}</Text>
            <Text style={styles.statValueSmall}>{roundsToday}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleTap}
          onLayout={(e) => {
            const { x, y, width } = e.nativeEvent.layout;
            setMantraOrigin({ x, y, width });
          }}
          accessibilityRole="button"
          accessibilityLabel={t('counter.countAria')}
          style={styles.tapButton}
        >
          <Animated.View style={[styles.tapButtonInner, beadShakeStyle]}>
            <Image source={beadImage} style={styles.tapButtonBead} resizeMode="cover" />
          </Animated.View>
        </TouchableOpacity>

        {floats.map((f) => (
          <RisingMantra
            key={f.key}
            chant={f.chant}
            durationMs={f.durationMs}
            dx={f.dx}
            devanagari={f.devanagari}
            onDone={() => remove(f.key)}
            originX={mantraOrigin.x}
            originY={mantraOrigin.y}
            originWidth={mantraOrigin.width}
          />
        ))}
      </View>

      <MantraPickerSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        options={allMantras}
        currentId={currentMantraId}
        lang={lang}
        onPick={(id) => {
          setCurrentMantra(id);
          setSheetOpen(false);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 22,
  },
  malaWrap: { width: 390, height: 584, position: 'relative', overflow: 'hidden' },
  mantraSelector: { position: 'absolute', left: 20, top: 24, width: 190 },
  mantraLabel: {
    ...typeScale.caption,
    color: colors.muted,
    fontFamily: fontFamily.sans600,
    letterSpacing: 2,
  },
  mantraName: {
    fontFamily: fontFamily.serif400Italic,
    fontSize: 32,
    lineHeight: 36,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  mantraNameSmall: { fontSize: 26 },
  devanagari: { fontFamily: fontFamily.devanagari400Italic },
  statCard: {
    position: 'absolute',
    left: 270,
    top: 388,
    width: 112,
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
  statValue: { fontFamily: fontFamily.serif400, fontSize: 46, color: colors.ink },
  statValueSmall: { fontFamily: fontFamily.serif400, fontSize: 32, color: colors.saffronDark },
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
    height: 80,
    borderRadius: 40,
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
});
