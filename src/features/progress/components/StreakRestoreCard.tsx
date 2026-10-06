import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRewardedAd } from 'react-native-google-mobile-ads';
import { useTranslation } from 'react-i18next';

import { getRewardedUnitId } from '@/app/ads';
import { Button } from '@/shared/components/Button';
import { colors, fontFamily, radius, spacing } from '@/shared/theme';

type Props = {
  streakDays: number;
  restored: boolean;
  onRestore: () => void;
};

/** Opt-in rewarded ad: after one missed day, watching an ad carries the streak forward. */
export function StreakRestoreCard({ streakDays, restored, onRestore }: Props) {
  const { t } = useTranslation();
  const { isLoaded, isClosed, isEarnedReward, load, show } = useRewardedAd(getRewardedUnitId());

  useEffect(() => {
    if (!restored) load();
  }, [load, restored, isClosed]);

  useEffect(() => {
    if (isEarnedReward && !restored) onRestore();
  }, [isEarnedReward, restored, onRestore]);

  if (restored) {
    return (
      <View style={styles.card}>
        <Text style={styles.desc}>{t('progress.restoreDone')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('progress.restoreTitle', { days: streakDays })}</Text>
      <Text style={styles.desc}>{t('progress.restoreDesc')}</Text>
      <Button
        label={isLoaded ? t('progress.restoreAction') : t('progress.restoreLoading')}
        disabled={!isLoaded}
        onPress={() => show()}
        style={[styles.button, !isLoaded && styles.buttonWaiting]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
  },
  title: { fontFamily: fontFamily.serif500, fontSize: 20, color: colors.ink },
  desc: { marginTop: spacing.xs, fontSize: 14, lineHeight: 20, color: colors.muted },
  button: { marginTop: spacing.md },
  buttonWaiting: { opacity: 0.6 },
});
