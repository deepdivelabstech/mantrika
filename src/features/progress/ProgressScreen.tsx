import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DailyFocusCard } from '@/features/progress/components/DailyFocusCard';
import { StatCard } from '@/features/progress/components/StatCard';
import { StreakDots } from '@/features/progress/components/StreakDots';
import { Card } from '@/shared/components/Card';
import { Header } from '@/shared/components/Header';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useProgressStore } from '@/shared/store/useProgressStore';
import { colors, fontFamily, spacing, typeScale } from '@/shared/theme';

export function ProgressScreen() {
  const { t } = useTranslation();
  const totalBeadsLifetime = useProgressStore((s) => s.totalBeadsLifetime);
  const roundsToday = useProgressStore((s) => s.roundsToday);
  const beadsToday = useProgressStore((s) => s.beadsToday);
  const streakDays = useProgressStore((s) => s.streakDays);
  const activeDates = useProgressStore((s) => s.activeDates);

  return (
    <ScreenContainer>
      <Header title={t('progress.title')} showSettings />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.row}>
          <StatCard
            label={t('progress.totalBeads')}
            value={String(totalBeadsLifetime)}
            sub={t('progress.lifeToDate')}
          />
          <StatCard
            label={t('progress.roundsDone')}
            value={String(roundsToday)}
            sub={t('progress.malaCompletions')}
          />
        </View>

        <Card style={styles.streakCard}>
          <View>
            <Text style={styles.streakLabel}>{t('progress.currentStreak')}</Text>
            <Text style={styles.streakValue}>
              {streakDays} <Text style={styles.streakUnit}>{t('progress.days')}</Text>
            </Text>
          </View>
          <StreakDots activeDates={activeDates} />
        </Card>

        <DailyFocusCard beadsToday={beadsToday} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  streakCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakLabel: {
    ...typeScale.caption,
    fontFamily: fontFamily.sans600,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  streakValue: {
    fontFamily: fontFamily.serif400,
    fontSize: 32,
    color: colors.saffronDark,
    marginTop: spacing.xxs,
  },
  streakUnit: { ...typeScale.caption, color: colors.muted },
});
