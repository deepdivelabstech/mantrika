import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { dayTotal, lastNDates } from '@/shared/lib/practiceLog';
import { colors, fontFamily, radius, spacing } from '@/shared/theme';
import type { DailyLog } from '@/shared/types/models';

type Props = { dailyLog: DailyLog; today: string; goalBeads: number };

const CHART_HEIGHT = 110;
const LABEL_ROW = 22; // weekday label height + its top margin

/** Last seven days as bars against the daily goal line. */
export const WeekChart = React.memo(function WeekChart({ dailyLog, today, goalBeads }: Props) {
  const { t } = useTranslation();
  const weekdays = t('progress.weekdays', { returnObjects: true }) as string[];

  const days = useMemo(
    () =>
      lastNDates(today, 7).map((date) => ({
        date,
        total: dayTotal(dailyLog[date]),
        weekday: new Date(`${date}T00:00:00`).getDay(),
        spoken: new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        }),
      })),
    [dailyLog, today],
  );
  const max = Math.max(goalBeads, ...days.map((d) => d.total), 1);
  const goalY = (goalBeads / max) * CHART_HEIGHT;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t('progress.thisWeek')}</Text>
      <View style={styles.chart}>
        <View style={[styles.goalLine, { bottom: goalY + LABEL_ROW }]} pointerEvents="none" />
        {days.map((d) => {
          const met = d.total >= goalBeads;
          return (
            <View
              key={d.date}
              style={styles.col}
              accessible
              accessibilityLabel={t('progress.dayAria', {
                day: d.spoken,
                count: d.total.toLocaleString(),
              })}
            >
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    met && styles.barMet,
                    { height: d.total > 0 ? Math.max(4, (d.total / max) * CHART_HEIGHT) : 0 },
                  ]}
                />
              </View>
              <Text style={[styles.day, d.date === today && styles.today]}>
                {weekdays[d.weekday] ?? ''}
              </Text>
            </View>
          );
        })}
      </View>
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
  label: { fontSize: 15, fontFamily: fontFamily.sans500, color: colors.ink },
  chart: { flexDirection: 'row', marginTop: spacing.md, gap: 8 },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.saffronDark,
    opacity: 0.6,
  },
  col: { flex: 1, alignItems: 'center' },
  barTrack: { height: CHART_HEIGHT, width: '100%', justifyContent: 'flex-end' },
  bar: {
    width: '100%',
    borderRadius: radius.sm / 2,
    backgroundColor: colors.maroon,
    opacity: 0.75,
  },
  barMet: { backgroundColor: colors.saffronDark, opacity: 1 },
  day: {
    marginTop: LABEL_ROW - 16,
    height: 16,
    fontSize: 11,
    fontFamily: fontFamily.sans600,
    color: colors.muted,
  },
  today: { color: colors.ink, fontFamily: fontFamily.sans700 },
});
