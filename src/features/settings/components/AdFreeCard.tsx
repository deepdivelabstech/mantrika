import React from 'react';
import { Text, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconRow } from '@/features/settings/components/IconRow';
import { SettingsCard } from '@/features/settings/components/SettingsCard';
import { StarIcon } from '@/shared/components/icons';
import { useAdFree } from '@/shared/hooks/useAdFree';
import { useNow } from '@/shared/hooks/useNow';
import { AD_FREE_MS } from '@/shared/lib/adPacing';
import { useAdStore } from '@/shared/store/useAdStore';
import { fontFamily, makeStyles, radius, useColors } from '@/shared/theme';

const HOUR_MS = 60 * 60 * 1000;

type Props = {
  style?: StyleProp<ViewStyle>;
  rewardedReady: boolean;
  showRewarded: (onEarned: () => void) => void;
};

/** Opt-in: one rewarded video hides banners and session-end ads for a day. */
export function AdFreeCard({ style, rewardedReady, showRewarded }: Props) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const adFree = useAdFree();
  const adFreeUntil = useAdStore((s) => s.adFreeUntil);
  const grantAdFree = useAdStore((s) => s.grantAdFree);
  const now = useNow();
  const hoursLeft = Math.min(
    AD_FREE_MS / HOUR_MS,
    Math.max(1, Math.ceil((adFreeUntil - now) / HOUR_MS)),
  );

  return (
    <SettingsCard style={style}>
      <IconRow
        icon={<StarIcon color={colors.maroon} />}
        title={t('settings.adFreeTitle')}
        description={
          adFree ? t('settings.adFreeActive', { count: hoursLeft }) : t('settings.adFreeDesc')
        }
        control={
          adFree ? null : (
            <TouchableOpacity
              onPress={() => showRewarded(() => grantAdFree(Date.now()))}
              disabled={!rewardedReady}
              accessibilityRole="button"
              accessibilityState={{ disabled: !rewardedReady }}
              style={[styles.button, !rewardedReady && styles.waiting]}
            >
              <Text style={styles.text}>
                {rewardedReady ? t('settings.adFreeAction') : t('progress.restoreLoading')}
              </Text>
            </TouchableOpacity>
          )
        }
      />
    </SettingsCard>
  );
}

const useStyles = makeStyles((colors) => ({
  button: {
    minHeight: 34,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.maroon,
  },
  waiting: { opacity: 0.55 },
  text: { fontFamily: fontFamily.sans700, fontSize: 12, color: colors.onAccent },
}));
