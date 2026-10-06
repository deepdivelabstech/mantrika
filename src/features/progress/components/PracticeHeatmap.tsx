import React, { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { addDays, dayTotal } from '@/shared/lib/practiceLog';
import { colors, fontFamily, radius, spacing } from '@/shared/theme';
import type { DailyLog } from '@/shared/types/models';

type Props = { dailyLog: DailyLog; activeDates: string[]; today: string; goalBeads: number };

const WEEKS = 18;
const GAP = 3;
const MAX_CELL = 18;
// Screen gutter + card padding on both sides (spacing.lg each).
const HORIZONTAL_CHROME = spacing.lg * 4;
const LEVELS = ['#EDE3D6', '#F6D3A8', colors.saffron, colors.saffronDark, colors.maroon];

/** 0 = no practice; 1–4 scale with the share of the daily goal reached. */
function level(total: number, active: boolean, goal: number): number {
  if (total <= 0) return active ? 1 : 0; // pre-v2 days: known active, count unknown
  const f = total / goal;
  return f < 0.5 ? 1 : f < 1 ? 2 : f < 2 ? 3 : 4;
}

/** GitHub-style calendar: columns are weeks (Sun→Sat), most recent on the right. */
export const PracticeHeatmap = React.memo(function PracticeHeatmap({
  dailyLog,
  activeDates,
  today,
  goalBeads,
}: Props) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const cell = Math.min(
    MAX_CELL,
    Math.floor((width - HORIZONTAL_CHROME - GAP * (WEEKS - 1)) / WEEKS),
  );

  const { columns, activeCount } = useMemo(() => {
    const active = new Set(activeDates);
    const weekday = new Date(`${today}T00:00:00`).getDay();
    const start = addDays(today, -weekday - (WEEKS - 1) * 7);
    let count = 0;
    const cols = Array.from({ length: WEEKS }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const date = addDays(start, w * 7 + d);
        if (date > today) return -1; // future
        const lv = level(dayTotal(dailyLog[date]), active.has(date), goalBeads);
        if (lv > 0) count += 1;
        return lv;
      }),
    );
    return { columns: cols, activeCount: count };
  }, [dailyLog, activeDates, today, goalBeads]);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t('progress.calendar')}</Text>
      <View
        style={[styles.grid, { gap: GAP }]}
        accessible
        accessibilityLabel={t('progress.calendarAria', { count: activeCount, weeks: WEEKS })}
      >
        {columns.map((col, w) => (
          <View key={w} style={{ gap: GAP }}>
            {col.map((lv, d) => (
              <View
                key={d}
                style={{
                  width: cell,
                  height: cell,
                  borderRadius: 3,
                  backgroundColor: lv < 0 ? 'transparent' : LEVELS[lv],
                }}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.legend} importantForAccessibility="no-hide-descendants">
        <Text style={styles.legendText}>{t('progress.less')}</Text>
        {LEVELS.map((c) => (
          <View key={c} style={[styles.swatch, { backgroundColor: c }]} />
        ))}
        <Text style={styles.legendText}>{t('progress.more')}</Text>
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
  grid: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: spacing.sm,
  },
  legendText: { fontSize: 11, color: colors.muted, marginHorizontal: 2 },
  swatch: { width: 10, height: 10, borderRadius: 2 },
});
