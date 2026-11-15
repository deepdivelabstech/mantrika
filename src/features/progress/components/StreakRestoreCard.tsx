import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/components/Button';
import { useRewardedUnlock } from '@/shared/hooks/useRewardedUnlock';
import { fontFamily, makeStyles, radius, spacing } from '@/shared/theme';

type Props = {
  streakDays: number;
  restored: boolean;
  onRestore: () => void;
};

/** Opt-in rewarded ad: after one or two missed days, watching an ad carries the streak forward. */
export function StreakRestoreCard({ streakDays, restored, onRestore }: Props) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { ready: isLoaded, show } = useRewardedUnlock(!restored);

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
        onPress={() => show(onRestore)}
        style={[styles.button, !isLoaded && styles.buttonWaiting]}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
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
}));
