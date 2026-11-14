import React, { useMemo } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { BrandMark } from '@/shared/components/BrandMark';
import { readAppVersion } from '@/shared/lib/appVersion';
import { useSettingsStore } from '@/shared/store/useSettingsStore';
import { fontFamily, labelStyle, makeStyles, radius, spacing, typeScale } from '@/shared/theme';

type Props = { style?: StyleProp<ViewStyle> };

/**
 * "About" credit block: brand mark, app name and tagline, installed version,
 * and the studio credit. All copy lives under `about.*` in the locale files.
 * Screen readers get it as one element with a combined description.
 */
export function AboutFooter({ style }: Props) {
  const styles = useStyles();
  const { t } = useTranslation();
  const lang = useSettingsStore((s) => s.lang);

  const versionLabel = useMemo(() => {
    const v = readAppVersion();
    if (!v) return null;
    const base = v.build
      ? t('about.version', { version: v.version, build: v.build })
      : t('about.versionNoBuild', { version: v.version });
    return __DEV__ ? base + t('about.devSuffix') : base;
  }, [t]);

  const appName = t('appTitle');
  const tagline = t('about.appTagline');
  const madeBy = t('about.madeBy', { studio: t('about.studioName') });
  const studioTagline = t('about.studioTagline');
  // Taglines carry their own full stop (. or ।); strip it so the join doesn't double up.
  const a11yLabel = [appName, tagline, versionLabel, madeBy, studioTagline]
    .filter((part): part is string => Boolean(part))
    .map((part) => part.replace(/[.।]\s*$/, ''))
    .join('. ');

  return (
    <View
      style={[styles.root, style]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={a11yLabel}
    >
      <View style={styles.markTile}>
        <BrandMark size={30} />
      </View>
      <Text style={styles.appName}>{appName}</Text>
      <Text style={styles.tagline}>{tagline}</Text>
      {versionLabel ? (
        <View style={styles.versionPill}>
          <Text style={styles.versionText}>{versionLabel}</Text>
        </View>
      ) : null}
      <View style={styles.divider} />
      <Text style={[styles.madeBy, labelStyle(lang)]}>{madeBy}</Text>
      <Text style={styles.studioTagline}>{studioTagline}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xl },
  markTile: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.xxs,
  },
  appName: { fontFamily: fontFamily.serif500, fontSize: 20, lineHeight: 24, color: colors.ink },
  tagline: { ...typeScale.caption, color: colors.muted, textAlign: 'center' },
  versionPill: {
    marginTop: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.line,
  },
  versionText: {
    fontFamily: fontFamily.sans600,
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted,
  },
  divider: {
    width: 32,
    height: 1,
    backgroundColor: colors.line,
    marginVertical: spacing.xs,
  },
  madeBy: { color: colors.muted },
  studioTagline: { ...typeScale.caption, color: colors.muted, textAlign: 'center' },
}));
