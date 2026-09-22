import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { displayName } from '@/shared/lib/mantraDisplay';
import { colors, fontFamily, radius, spacing, typeScale } from '@/shared/theme';
import type { Language, Mantra } from '@/shared/types/models';

type Props = { mantra: Mantra; lang: Language; active: boolean; onPress: () => void };

export function MantraListItem({ mantra, lang, active, onPress }: Props) {
  const { t } = useTranslation();
  const isCustom = mantra.id.startsWith('custom-');
  const showDeva = lang === 'hi' && !isCustom;

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.row, active && styles.rowActive]}
    >
      <View style={styles.textCol}>
        <Text style={[styles.name, showDeva && styles.devanagari]} numberOfLines={1}>
          {displayName(mantra, lang)}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {isCustom ? t('counter.customMantraLabel') : showDeva ? mantra.name : mantra.deva}
        </Text>
      </View>
      {active ? <Text style={styles.nowChanting}>{t('mantras.nowChanting')}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    marginBottom: spacing.xs,
  },
  rowActive: { backgroundColor: colors.card, borderColor: colors.maroon },
  textCol: { flex: 1, marginRight: spacing.sm },
  name: { fontFamily: fontFamily.serif400, fontSize: 17, color: colors.ink },
  devanagari: { fontFamily: fontFamily.devanagari400 },
  sub: { ...typeScale.caption, color: colors.muted, marginTop: 2 },
  nowChanting: { ...typeScale.caption, color: colors.maroon, fontFamily: fontFamily.sans600 },
});
