import React, { useCallback, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DailyFocusCard } from '@/features/progress/components/DailyFocusCard';
import { MantraBreakdown } from '@/features/progress/components/MantraBreakdown';
import { PracticeHeatmap } from '@/features/progress/components/PracticeHeatmap';
import { SankalpaCard } from '@/features/progress/components/SankalpaCard';
import { SankalpaSheet, type SankalpaDraft } from '@/features/progress/components/SankalpaSheet';
import { StatTile } from '@/features/progress/components/StatTile';
import { StreakRestoreCard } from '@/features/progress/components/StreakRestoreCard';
import { WeekChart } from '@/features/progress/components/WeekChart';
import { AdBanner } from '@/shared/components/AdBanner';
import { Header } from '@/shared/components/Header';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useToday } from '@/shared/hooks/useToday';
import { canRestoreStreak } from '@/shared/lib/adPacing';
import { displayName, findMantra, mergeMantras } from '@/shared/lib/mantraDisplay';
import { useAdStore } from '@/shared/store/useAdStore';
import { useMantraStore } from '@/shared/store/useMantraStore';
import {
  selectStreakDays,
  selectTodayTotal,
  useProgressStore,
} from '@/shared/store/useProgressStore';
import { useSettingsStore } from '@/shared/store/useSettingsStore';
import { colors, spacing } from '@/shared/theme';
import { BEADS_PER_ROUND } from '@/shared/types/models';

// The tab is frozen while blurred (freezeOnBlur), so none of this recomputes
// during counting; every derived value is memoized on stable store references.
export function ProgressScreen() {
  const { t } = useTranslation();
  const today = useToday();

  const lang = useSettingsStore((s) => s.lang);
  const goalMalas = useSettingsStore((s) => s.dailyGoalMalas);
  const setDailyGoalMalas = useSettingsStore((s) => s.setDailyGoalMalas);

  const catalog = useMantraStore((s) => s.catalog);
  const custom = useMantraStore((s) => s.custom);

  const dailyLog = useProgressStore((s) => s.dailyLog);
  const activeDates = useProgressStore((s) => s.activeDates);
  const mantraTotals = useProgressStore((s) => s.mantraTotals);
  const totalBeadsLifetime = useProgressStore((s) => s.totalBeadsLifetime);
  const bestStreak = useProgressStore((s) => s.bestStreak);
  const sankalpa = useProgressStore((s) => s.sankalpa);
  const currentMantraId = useProgressStore((s) => s.currentMantraId);
  const setSankalpa = useProgressStore((s) => s.setSankalpa);
  const clearSankalpa = useProgressStore((s) => s.clearSankalpa);
  const todayTotal = useProgressStore((s) => selectTodayTotal(s, today));
  const streakDays = useProgressStore((s) => selectStreakDays(s, today));
  const streakPaused = useProgressStore(
    (s) => s.streakDays > 0 && selectStreakDays(s, today) === 0,
  );

  const storedStreak = useProgressStore((s) => s.streakDays);
  const lastActiveDate = useProgressStore((s) => s.lastActiveDate);
  const restoreStreak = useProgressStore((s) => s.restoreStreak);
  const lastStreakRestoreDate = useAdStore((s) => s.lastStreakRestoreDate);
  const markStreakRestored = useAdStore((s) => s.markStreakRestored);
  const canRestore =
    Platform.OS !== 'web' &&
    canRestoreStreak({
      today,
      lastActiveDate,
      streakDays: storedStreak,
      lastRestoreDate: lastStreakRestoreDate,
    });
  // Keeps the card up (as a confirmation) after the restore makes it ineligible.
  const [restored, setRestored] = useState(false);
  const handleRestore = useCallback(() => {
    restoreStreak();
    markStreakRestored(today);
    setRestored(true);
  }, [restoreStreak, markStreakRestored, today]);

  const customLabel = t('counter.customMantraLabel');
  const mantras = useMemo(
    () => mergeMantras(catalog, custom, customLabel),
    [catalog, custom, customLabel],
  );
  const nameOf = useCallback(
    (id: string) => {
      const m = findMantra(mantras, id);
      return {
        name: m ? displayName(m, lang) : t('progress.removedMantra'),
        devanagari: lang === 'hi' && !!m && !id.startsWith('custom-'),
      };
    },
    [mantras, lang, t],
  );
  const vowMantra = sankalpa ? nameOf(sankalpa.mantraId) : null;
  const current = nameOf(currentMantraId);

  const [sheet, setSheet] = useState<{ withVow: boolean } | null>(null);
  const openGoal = useCallback(() => setSheet({ withVow: false }), []);
  const openVow = useCallback(() => setSheet({ withVow: true }), []);
  const closeSheet = useCallback(() => setSheet(null), []);
  const save = useCallback(
    (draft: SankalpaDraft) => {
      setDailyGoalMalas(draft.dailyGoalMalas);
      if (draft.vow) setSankalpa({ mantraId: currentMantraId, ...draft.vow });
      setSheet(null);
    },
    [setDailyGoalMalas, setSankalpa, currentMantraId],
  );

  return (
    <ScreenContainer>
      <Header title={t('appTitle')} />
      <ScrollView contentContainerStyle={styles.content}>
        <DailyFocusCard todayTotal={todayTotal} goalMalas={goalMalas} onEditGoal={openGoal} />

        <View style={styles.tiles}>
          <StatTile
            label={t('progress.currentStreak')}
            value={String(streakDays)}
            sub={streakPaused ? t('progress.streakPaused') : t('progress.days')}
          />
          <StatTile
            label={t('progress.bestStreak')}
            value={String(Math.max(bestStreak, streakDays))}
            sub={t('progress.days')}
            valueColor={colors.saffronDark}
          />
          <StatTile
            label={t('progress.lifetime')}
            value={compact(totalBeadsLifetime)}
            sub={t('common.malas', { count: Math.floor(totalBeadsLifetime / BEADS_PER_ROUND) })}
          />
        </View>

        {canRestore || restored ? (
          <StreakRestoreCard
            streakDays={storedStreak}
            restored={restored}
            onRestore={handleRestore}
          />
        ) : null}

        <SankalpaCard
          sankalpa={sankalpa}
          today={today}
          mantraName={vowMantra?.name ?? ''}
          devanagari={vowMantra?.devanagari ?? false}
          onSet={openVow}
          onEnd={clearSankalpa}
        />

        <WeekChart dailyLog={dailyLog} today={today} goalBeads={goalMalas * BEADS_PER_ROUND} />

        <AdBanner variant="inline" />

        <PracticeHeatmap
          dailyLog={dailyLog}
          activeDates={activeDates}
          today={today}
          goalBeads={goalMalas * BEADS_PER_ROUND}
        />

        <MantraBreakdown
          mantraTotals={mantraTotals}
          totalBeadsLifetime={totalBeadsLifetime}
          mantras={mantras}
          lang={lang}
        />
      </ScrollView>

      {sheet ? (
        <SankalpaSheet
          startWithVow={sheet.withVow}
          hasActiveVow={!!sankalpa}
          dailyGoalMalas={goalMalas}
          mantraName={current.name}
          devanagari={current.devanagari}
          onClose={closeSheet}
          onSave={save}
        />
      ) : null}
    </ScreenContainer>
  );
}

/** Lifetime counts outgrow a third-width tile; 54,321 → 54.3k. */
function compact(n: number): string {
  if (n < 10000) return n.toLocaleString();
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 100000 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, gap: spacing.lg },
  tiles: { flexDirection: 'row', gap: spacing.sm },
});
