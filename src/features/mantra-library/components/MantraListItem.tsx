import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { displayName } from '@/shared/lib/mantraDisplay';
import { CloseIcon, HeartIcon } from '@/shared/components/icons';
import { colors, fontFamily, radius, spacing } from '@/shared/theme';
import type { Language, Mantra } from '@/shared/types/models';

type Props = {
  mantra: Mantra;
  lang: Language;
  active: boolean;
  favorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onRemove?: () => void;
};

export function MantraListItem({
  mantra,
  lang,
  active,
  favorite,
  onSelect,
  onToggleFavorite,
  onRemove,
}: Props) {
  const { t } = useTranslation();
  const isCustom = mantra.id.startsWith('custom-');
  const showDeva = lang === 'hi' && !isCustom;

  return (
    <View style={[styles.row, active && styles.rowActive]}>
      <TouchableOpacity
        onPress={onSelect}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={styles.main}
      >
        <Text style={[styles.name, showDeva && styles.devanagari]} numberOfLines={1}>
          {displayName(mantra, lang)}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {isCustom ? t('counter.customMantraLabel') : showDeva ? mantra.name : mantra.deva}
        </Text>
        {active ? (
          <View style={styles.chip}>
            <Text style={styles.chipText}>{t('mantras.nowChanting')}</Text>
          </View>
        ) : null}
      </TouchableOpacity>

      {isCustom && onRemove ? (
        <TouchableOpacity
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={t('mantras.removeAria', { name: mantra.name })}
          style={styles.iconButton}
        >
          <CloseIcon color={colors.muted} />
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        onPress={onToggleFavorite}
        accessibilityRole="button"
        accessibilityLabel={t('mantras.favoriteAria', { name: mantra.name })}
        accessibilityState={{ selected: favorite }}
        style={styles.iconButton}
      >
        <HeartIcon color={colors.maroon} filled={favorite} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 76,
    paddingVertical: spacing.sm,
    paddingLeft: 18,
    paddingRight: spacing.xs,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
  },
  rowActive: { backgroundColor: '#F8EDE0', borderColor: colors.maroon },
  main: { flex: 1, justifyContent: 'center', minHeight: 52 },
  name: { fontFamily: fontFamily.serif400, fontSize: 18, lineHeight: 23, color: colors.ink },
  devanagari: { fontFamily: fontFamily.devanagari400 },
  sub: {
    marginTop: 4,
    fontFamily: fontFamily.devanagari400Italic,
    fontSize: 14,
    color: colors.muted,
  },
  chip: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#FBE3C5',
  },
  chipText: {
    fontSize: 10,
    fontFamily: fontFamily.sans700,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#7A3E12',
  },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
