import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/components/Button';
import { PillGrid } from '@/shared/components/PillGrid';
import { ToggleSwitch } from '@/shared/components/ToggleSwitch';
import { colors, fontFamily, radius, spacing } from '@/shared/theme';
import { DAILY_GOAL_OPTIONS } from '@/shared/types/models';

const TARGET_OPTIONS = [11000, 21000, 51000, 125000] as const;
const DAYS_OPTIONS = [11, 21, 40, 108] as const;

export type SankalpaDraft = {
  dailyGoalMalas: number;
  vow: { targetBeads: number; days: number } | null;
};

type Props = {
  /** Open with the long-vow section switched on (from the sankalpa card). */
  startWithVow: boolean;
  hasActiveVow: boolean;
  dailyGoalMalas: number;
  mantraName: string;
  devanagari: boolean;
  onClose: () => void;
  onSave: (draft: SankalpaDraft) => void;
};

/**
 * Daily goal plus an optional long vow, bound to the current mantra. Mounted
 * only while open, so each opening starts from the stored goal rather than an
 * abandoned draft.
 */
export function SankalpaSheet({
  startWithVow,
  hasActiveVow,
  dailyGoalMalas,
  mantraName,
  devanagari,
  onClose,
  onSave,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [goal, setGoal] = useState(String(dailyGoalMalas));
  const [vowOn, setVowOn] = useState(startWithVow);
  const [target, setTarget] = useState(String(TARGET_OPTIONS[3]));
  const [days, setDays] = useState(String(DAYS_OPTIONS[2]));

  const save = () =>
    onSave({
      dailyGoalMalas: Number(goal),
      vow: vowOn ? { targetBeads: Number(target), days: Number(days) } : null,
    });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t('common.cancel')}
      />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        <ScrollView bounces={false} contentContainerStyle={styles.content}>
          <Text style={styles.title}>{t('sankalpa.sheetTitle')}</Text>

          <Text style={styles.fieldLabel}>{t('sankalpa.dailyGoal')}</Text>
          <PillGrid
            columns={3}
            value={goal}
            onChange={setGoal}
            options={DAILY_GOAL_OPTIONS.map((n) => ({
              value: String(n),
              label: t('common.malas', { count: n }),
            }))}
          />

          <View style={styles.vowRow}>
            <Text style={styles.vowToggle}>{t('sankalpa.vowToggle')}</Text>
            <ToggleSwitch
              value={vowOn}
              onChange={setVowOn}
              accessibilityLabel={t('sankalpa.vowToggle')}
            />
          </View>

          {vowOn ? (
            <View>
              <Text style={styles.fieldLabel}>{t('sankalpa.vowMantra')}</Text>
              <Text style={[styles.mantra, devanagari && styles.devanagari]}>{mantraName}</Text>
              <Text style={styles.hint}>{t('sankalpa.vowMantraHint')}</Text>

              <Text style={styles.fieldLabel}>{t('sankalpa.vowTarget')}</Text>
              <PillGrid
                columns={2}
                value={target}
                onChange={setTarget}
                options={TARGET_OPTIONS.map((n) => ({
                  value: String(n),
                  label: n.toLocaleString(),
                }))}
              />

              <Text style={styles.fieldLabel}>{t('sankalpa.vowDays')}</Text>
              <PillGrid
                columns={4}
                value={days}
                onChange={setDays}
                options={DAYS_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))}
              />
              {hasActiveVow ? <Text style={styles.warn}>{t('sankalpa.vowReplace')}</Text> : null}
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.actions}>
          <Button
            label={t('common.cancel')}
            variant="secondary"
            onPress={onClose}
            style={styles.action}
          />
          <Button label={t('common.save')} onPress={save} style={styles.action} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '88%',
    backgroundColor: colors.ground,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  content: { paddingBottom: spacing.md },
  title: { fontFamily: fontFamily.serif500, fontSize: 24, color: colors.ink },
  fieldLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    fontSize: 10,
    fontFamily: fontFamily.sans600,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  vowRow: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  vowToggle: { flex: 1, fontSize: 15, fontFamily: fontFamily.sans600, color: colors.ink },
  mantra: { fontFamily: fontFamily.serif400Italic, fontSize: 22, color: colors.ink },
  devanagari: { fontFamily: fontFamily.devanagari400Italic },
  hint: { marginTop: 2, fontSize: 12, lineHeight: 17, color: colors.muted },
  warn: { marginTop: spacing.sm, fontSize: 12, color: colors.saffronDark },
  actions: { flexDirection: 'row', gap: spacing.sm, paddingTop: spacing.sm },
  action: { flex: 1 },
});
