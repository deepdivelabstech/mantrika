import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { displayName } from '@/shared/lib/mantraDisplay';
import { colors, fontFamily, spacing, typeScale } from '@/shared/theme';
import type { Language, Mantra } from '@/shared/types/models';

type Props = { mantra: Mantra; lang: Language; onStart: () => void };

export function DailyRecommendationCard({ mantra, lang, onStart }: Props) {
  const { t } = useTranslation();
  const showDeva = lang === 'hi' && !!mantra.deva;

  return (
    <Card style={styles.card}>
      <Text style={styles.eyebrow}>{t('mantras.dailyRecommendation')}</Text>
      <Text style={styles.tag}>{t('mantras.forInnerPeace')}</Text>
      <Text style={[styles.name, showDeva && styles.devanagari]}>{displayName(mantra, lang)}</Text>
      {mantra.description ? <Text style={styles.description}>{mantra.description}</Text> : null}
      <Button label={t('mantras.startSadhana')} onPress={onStart} style={styles.button} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  eyebrow: {
    ...typeScale.caption,
    fontFamily: fontFamily.sans600,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  tag: { ...typeScale.caption, color: colors.saffronDark, fontFamily: fontFamily.sans600 },
  name: {
    fontFamily: fontFamily.serif400,
    fontSize: 24,
    color: colors.ink,
    marginTop: spacing.xxs,
  },
  devanagari: { fontFamily: fontFamily.devanagari400 },
  description: { ...typeScale.body, color: colors.muted, marginTop: spacing.xs },
  button: { marginTop: spacing.md, alignSelf: 'flex-start' },
});
