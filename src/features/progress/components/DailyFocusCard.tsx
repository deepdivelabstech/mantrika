import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ProgressRing } from '@/shared/components/ProgressRing';
import { dailyFocusFraction } from '@/shared/lib/beadMath';
import { colors, fontFamily, spacing } from '@/shared/theme';
import { DAILY_FOCUS_TARGET } from '@/shared/types/models';

type Props = { beadsToday: number };

export function DailyFocusCard({ beadsToday }: Props) {
  const { t } = useTranslation();
  const fraction = dailyFocusFraction(beadsToday, DAILY_FOCUS_TARGET);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t('progress.dailyFocus')}</Text>
      <View style={styles.ringWrap}>
        <ProgressRing
          fraction={fraction}
          size={248}
          strokeWidth={9}
          trackColor="#E0CEBB"
          progressColor={colors.maroon}
        >
          <View style={StyleSheet.absoluteFill}>
            <View style={styles.center}>
              <Text style={styles.value}>{beadsToday}</Text>
              <Text style={styles.ofBeads}>{t('progress.ofBeads')}</Text>
            </View>
          </View>
        </ProgressRing>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#F0E7DC',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
  },
  label: { fontSize: 15, fontFamily: fontFamily.sans500, lineHeight: 20, color: colors.ink },
  ringWrap: { marginTop: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  value: { fontFamily: fontFamily.serif400, fontSize: 44, lineHeight: 46, color: colors.ink },
  ofBeads: { marginTop: 4, fontSize: 13, color: colors.muted },
});
