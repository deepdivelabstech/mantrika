import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/components/Button';
import { sankalpaStatus } from '@/shared/lib/practiceLog';
import { colors, fontFamily, radius, spacing } from '@/shared/theme';
import type { Sankalpa } from '@/shared/types/models';

type Props = {
  sankalpa: Sankalpa | null;
  today: string;
  mantraName: string;
  devanagari: boolean;
  onSet: () => void;
  onEnd: () => void;
};

/** The long vow: progress, day N of M, and the daily pace needed to finish on time. */
export const SankalpaCard = React.memo(function SankalpaCard({
  sankalpa,
  today,
  mantraName,
  devanagari,
  onSet,
  onEnd,
}: Props) {
  const { t } = useTranslation();

  if (!sankalpa) {
    return (
      <View style={styles.card}>
        <Text style={styles.ctaTitle}>{t('sankalpa.ctaTitle')}</Text>
        <Text style={styles.ctaDesc}>{t('sankalpa.ctaDesc')}</Text>
        <Button label={t('sankalpa.ctaAction')} onPress={onSet} style={styles.button} />
      </View>
    );
  }

  const status = sankalpaStatus(sankalpa, today);
  const finished = status.completed || status.expired;
  const confirmEnd = () =>
    Alert.alert(t('sankalpa.endTitle'), t('sankalpa.endDesc'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('sankalpa.endAction'), style: 'destructive', onPress: onEnd },
    ]);

  return (
    <View style={styles.card}>
      <View style={styles.headRow}>
        <Text style={styles.eyebrow}>{t('sankalpa.title')}</Text>
        {!finished ? (
          <TouchableOpacity onPress={confirmEnd} accessibilityRole="button" hitSlop={10}>
            <Text style={styles.end}>{t('sankalpa.endAction')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={[styles.mantra, devanagari && styles.devanagari]} numberOfLines={2}>
        {mantraName}
      </Text>
      <Text style={styles.count}>
        {sankalpa.count.toLocaleString()}
        <Text style={styles.target}> / {sankalpa.targetBeads.toLocaleString()}</Text>
      </Text>
      <View
        style={styles.track}
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: sankalpa.targetBeads, now: sankalpa.count }}
      >
        <View
          style={[
            styles.fill,
            status.completed && styles.fillDone,
            { width: `${status.fraction * 100}%` },
          ]}
        />
      </View>
      {status.completed ? (
        <Text style={styles.done}>{t('sankalpa.completed')}</Text>
      ) : status.expired ? (
        <Text style={styles.meta}>{t('sankalpa.expired', { days: sankalpa.days })}</Text>
      ) : (
        <>
          <Text style={styles.meta}>
            {t('sankalpa.dayOf', { day: status.dayNumber, days: sankalpa.days })}
          </Text>
          <Text style={styles.pace}>
            {t('sankalpa.perDay', { count: status.perDayNeeded.toLocaleString() })}
          </Text>
        </>
      )}
      {finished ? (
        <Button label={t('sankalpa.newAction')} onPress={onSet} style={styles.button} />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
  },
  ctaTitle: { fontFamily: fontFamily.serif500, fontSize: 22, color: colors.ink },
  ctaDesc: { marginTop: spacing.xs, fontSize: 14, lineHeight: 20, color: colors.muted },
  button: { marginTop: spacing.md },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.muted,
    fontFamily: fontFamily.sans700,
    textTransform: 'uppercase',
  },
  end: { fontSize: 13, fontFamily: fontFamily.sans600, color: colors.maroon },
  mantra: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.serif400Italic,
    fontSize: 24,
    color: colors.ink,
  },
  devanagari: { fontFamily: fontFamily.devanagari400Italic },
  count: {
    marginTop: spacing.sm,
    fontFamily: fontFamily.serif400,
    fontSize: 30,
    color: colors.ink,
  },
  target: { fontSize: 18, color: colors.muted },
  track: {
    marginTop: spacing.xs,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.maroon },
  fillDone: { backgroundColor: colors.saffronDark },
  meta: { marginTop: spacing.sm, fontSize: 13, fontFamily: fontFamily.sans600, color: colors.ink },
  pace: { marginTop: 2, fontSize: 13, color: colors.muted },
  done: {
    marginTop: spacing.sm,
    fontSize: 15,
    fontFamily: fontFamily.sans700,
    color: colors.saffronDark,
  },
});
