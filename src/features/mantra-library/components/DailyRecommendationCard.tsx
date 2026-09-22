import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LampIllustration } from '@/features/mantra-library/components/LampIllustration';
import { PlayIcon } from '@/shared/components/icons';
import { colors, fontFamily, spacing } from '@/shared/theme';
import type { Mantra } from '@/shared/types/models';

type Props = { mantra: Mantra; onStart: () => void };

/** Fixed daily-recommendation spotlight (always the same featured mantra, matching the source design). */
export function DailyRecommendationCard({ mantra, onStart }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <LampIllustration />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{t('mantras.forInnerPeace')}</Text>
      </View>
      <Text style={styles.name}>{mantra.name}</Text>
      {mantra.excerpt ? <Text style={styles.excerpt}>{mantra.excerpt}</Text> : null}
      {mantra.description ? <Text style={styles.description}>{mantra.description}</Text> : null}
      <TouchableOpacity onPress={onStart} accessibilityRole="button" style={styles.button}>
        <PlayIcon color={colors.ground} size={18} />
        <Text style={styles.buttonText}>{t('mantras.startSadhana')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    paddingLeft: 18,
    backgroundColor: '#F8F1E8',
    borderWidth: 1,
    borderColor: colors.line,
    borderLeftWidth: 3,
    borderLeftColor: '#8A4A2B',
    borderRadius: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FBE3C5',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: fontFamily.sans700,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#7A3E12',
  },
  name: {
    marginTop: spacing.sm,
    fontFamily: fontFamily.serif500,
    fontSize: 20,
    lineHeight: 26,
    color: colors.ink,
  },
  excerpt: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.devanagari400Italic,
    fontSize: 17,
    lineHeight: 27,
    color: colors.ink,
  },
  description: { marginTop: spacing.sm, fontSize: 14, lineHeight: 22.4, color: colors.ink },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    height: 48,
    marginTop: spacing.lg,
    paddingHorizontal: 22,
    borderRadius: 24,
    backgroundColor: colors.maroon,
  },
  buttonText: {
    fontSize: 12,
    fontFamily: fontFamily.sans700,
    letterSpacing: 0.96,
    textTransform: 'uppercase',
    color: colors.ground,
  },
});
