import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LampIllustration } from '@/features/mantra-library/components/LampIllustration';
import { PlayIcon } from '@/shared/components/icons';
import { displayName } from '@/shared/lib/mantraDisplay';
import { colors, fontFamily, spacing } from '@/shared/theme';
import type { Language, Mantra } from '@/shared/types/models';

type Props = { mantra: Mantra; lang: Language; active: boolean; onStart: () => void };

/** Compact spotlight for the day's mantra: lamp banner with the eyebrow overlaid, then text + CTA. */
export function DailyRecommendationCard({ mantra, lang, active, onStart }: Props) {
  const { t } = useTranslation();
  const showDeva = lang === 'hi';
  const secondary = mantra.excerpt ?? (showDeva ? mantra.name : mantra.deva);

  return (
    <View style={styles.card}>
      <View>
        <LampIllustration height={112} />
        <View style={styles.overlay}>
          <Text style={styles.eyebrow}>{t('mantras.dailyRecommendation')}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={[styles.name, showDeva && styles.devanagari]}>
          {displayName(mantra, lang)}
        </Text>
        <Text style={styles.secondary} numberOfLines={1}>
          {secondary}
        </Text>
        {mantra.description ? (
          <Text style={styles.description} numberOfLines={3}>
            {mantra.description}
          </Text>
        ) : null}

        <TouchableOpacity onPress={onStart} accessibilityRole="button" style={styles.button}>
          <PlayIcon color={colors.ground} size={18} />
          <Text style={styles.buttonText}>
            {active ? t('mantras.continueSadhana') : t('mantras.startSadhana')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    backgroundColor: '#F8F1E8',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
  },
  overlay: { position: 'absolute', left: 16, bottom: 10 },
  eyebrow: {
    fontSize: 10,
    fontFamily: fontFamily.sans700,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: '#FFE9C4',
  },
  body: { padding: 18, paddingTop: 14 },
  name: {
    fontFamily: fontFamily.serif500,
    fontSize: 22,
    lineHeight: 28,
    color: colors.ink,
  },
  devanagari: { fontFamily: fontFamily.devanagari400 },
  secondary: {
    marginTop: 2,
    fontFamily: fontFamily.devanagari400Italic,
    fontSize: 15,
    lineHeight: 24,
    color: colors.muted,
  },
  description: { marginTop: spacing.sm, fontSize: 14, lineHeight: 21, color: colors.ink },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    height: 44,
    marginTop: spacing.md,
    paddingHorizontal: 20,
    borderRadius: 22,
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
