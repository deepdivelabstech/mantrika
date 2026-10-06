import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ProgressRing } from '@/shared/components/ProgressRing';
import { dailyFocusFraction } from '@/shared/lib/beadMath';
import { colors, fontFamily, spacing } from '@/shared/theme';
import { BEADS_PER_ROUND } from '@/shared/types/models';

type Props = { todayTotal: number; goalMalas: number; onEditGoal: () => void };

/** Today against the daily sankalpa: every bead counted today, across mantras. */
export const DailyFocusCard = React.memo(function DailyFocusCard({
  todayTotal,
  goalMalas,
  onEditGoal,
}: Props) {
  const { t } = useTranslation();
  const goalBeads = goalMalas * BEADS_PER_ROUND;
  const met = todayTotal >= goalBeads;
  const malasDone = Math.floor(todayTotal / BEADS_PER_ROUND);

  return (
    <View style={styles.card}>
      <View style={styles.headRow}>
        <Text style={styles.label}>{t('progress.dailyFocus')}</Text>
        <TouchableOpacity onPress={onEditGoal} accessibilityRole="button" hitSlop={10}>
          <Text style={styles.edit}>{t('progress.editGoal')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.ringWrap}>
        <ProgressRing
          fraction={dailyFocusFraction(todayTotal, goalBeads)}
          size={200}
          strokeWidth={9}
          trackColor="#E0CEBB"
          progressColor={met ? colors.saffronDark : colors.maroon}
        >
          <View style={StyleSheet.absoluteFill}>
            <View style={styles.center}>
              <Text style={styles.value}>{todayTotal.toLocaleString()}</Text>
              <Text style={styles.ofBeads}>
                {t('progress.ofGoalBeads', { goal: goalBeads.toLocaleString() })}
              </Text>
            </View>
          </View>
        </ProgressRing>
      </View>
      <Text style={[styles.status, met && styles.statusMet]}>
        {met
          ? t('progress.goalMet')
          : t('progress.malasOfGoal', { done: malasDone, goal: goalMalas })}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#F0E7DC',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
  },
  headRow: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 15, fontFamily: fontFamily.sans500, lineHeight: 20, color: colors.ink },
  edit: { fontSize: 13, fontFamily: fontFamily.sans600, lineHeight: 20, color: colors.maroon },
  ringWrap: { marginTop: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  value: { fontFamily: fontFamily.serif400, fontSize: 44, lineHeight: 46, color: colors.ink },
  ofBeads: { marginTop: 4, fontSize: 13, color: colors.muted },
  status: {
    marginTop: spacing.md,
    fontSize: 14,
    fontFamily: fontFamily.sans600,
    color: colors.muted,
  },
  statusMet: { color: colors.saffronDark },
});
