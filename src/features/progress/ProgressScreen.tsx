import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DailyFocusCard } from '@/features/progress/components/DailyFocusCard';
import { StatCard } from '@/features/progress/components/StatCard';
import { StreakDots } from '@/features/progress/components/StreakDots';
import { Header } from '@/shared/components/Header';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useProgressStore } from '@/shared/store/useProgressStore';
import { colors, fontFamily, radius, spacing } from '@/shared/theme';

export function ProgressScreen() {
  const { t } = useTranslation();
  const totalBeadsLifetime = useProgressStore((s) => s.totalBeadsLifetime);
  const roundsToday = useProgressStore((s) => s.roundsToday);
  const beadsToday = useProgressStore((s) => s.beadsToday);
  const streakDays = useProgressStore((s) => s.streakDays);
  const activeDates = useProgressStore((s) => s.activeDates);

  return (
    <ScreenContainer>
      <Header title={t('appTitle')} showSettings />
      <ScrollView contentContainerStyle={styles.content}>
        <StatCard
          label={t('progress.totalBeads')}
          value={totalBeadsLifetime.toLocaleString()}
          sub={t('progress.lifeToDate')}
        />

        <StatCard
          label={t('progress.roundsDone')}
          value={String(roundsToday)}
          sub={t('progress.malaCompletions')}
          valueColor={colors.saffronDark}
          decorativeRing
        />

        <View style={styles.streakCard}>
          <Text style={styles.streakLabel}>{t('progress.currentStreak')}</Text>
          <View style={styles.streakValueRow}>
            <Text style={styles.streakValue}>{streakDays}</Text>
            <Text style={styles.streakUnit}>{t('progress.days')}</Text>
          </View>
          <View style={styles.dotsWrap}>
            <StreakDots activeDates={activeDates} />
          </View>
        </View>

        <DailyFocusCard beadsToday={beadsToday} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, gap: spacing.lg },
  streakCard: {
    height: 176,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    shadowColor: '#5A2819',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  streakLabel: {
    fontSize: 12,
    letterSpacing: 1.4,
    color: colors.ink,
    fontFamily: fontFamily.sans600,
    textTransform: 'uppercase',
  },
  streakValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs, marginTop: 10 },
  streakValue: { fontFamily: fontFamily.serif400, fontSize: 58, lineHeight: 61, color: colors.ink },
  streakUnit: { fontSize: 15, color: colors.muted },
  dotsWrap: { marginTop: 12 },
});
