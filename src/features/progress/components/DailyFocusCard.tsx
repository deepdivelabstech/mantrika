import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '@/shared/components/Card';
import { ProgressRing } from '@/shared/components/ProgressRing';
import { dailyFocusFraction } from '@/shared/lib/beadMath';
import { colors, fontFamily, spacing, typeScale } from '@/shared/theme';
import { DAILY_FOCUS_TARGET } from '@/shared/types/models';

type Props = { beadsToday: number };

export function DailyFocusCard({ beadsToday }: Props) {
  const { t } = useTranslation();
  const fraction = dailyFocusFraction(beadsToday, DAILY_FOCUS_TARGET);

  return (
    <Card style={styles.card}>
      <Text style={styles.label}>{t('progress.dailyFocus')}</Text>
      <View style={styles.ringRow}>
        <ProgressRing fraction={fraction} label={String(beadsToday)} />
        <Text style={styles.ofBeads}>{t('progress.ofBeads')}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center' },
  label: {
    ...typeScale.caption,
    fontFamily: fontFamily.sans600,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    alignSelf: 'flex-start',
  },
  ringRow: { alignItems: 'center', marginTop: spacing.sm, gap: spacing.xs },
  ofBeads: { ...typeScale.caption, color: colors.muted },
});
