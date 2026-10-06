import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { displayName } from '@/shared/lib/mantraDisplay';
import { CloseIcon, HeartIcon, PlayIcon } from '@/shared/components/icons';
import { colors, fontFamily, radius, spacing } from '@/shared/theme';
import type { Language, Mantra } from '@/shared/types/models';

type Props = {
  mantra: Mantra;
  lang: Language;
  active: boolean;
  favorite: boolean;
  onSelect: (id: string) => void;
  onChant: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRemove?: (id: string) => void;
};

/** Library row: tap to make it the current mantra, ▶ to also jump to the counter. Callbacks take the id so the parent can pass stable references. */
export const MantraListItem = React.memo(function MantraListItem({
  mantra,
  lang,
  active,
  favorite,
  onSelect,
  onChant,
  onToggleFavorite,
  onRemove,
}: Props) {
  const { t } = useTranslation();
  const isCustom = mantra.id.startsWith('custom-');
  const showDeva = lang === 'hi' && !isCustom;
  const name = displayName(mantra, lang);

  return (
    <View style={[styles.row, active && styles.rowActive]}>
      <TouchableOpacity
        onPress={() => onSelect(mantra.id)}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={styles.main}
      >
        <Text style={[styles.name, showDeva && styles.devanagari]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {isCustom ? t('counter.customMantraLabel') : showDeva ? mantra.name : mantra.deva}
        </Text>
        {mantra.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {mantra.description}
          </Text>
        ) : null}
        {active ? (
          <View style={styles.chip}>
            <View style={styles.chipDot} />
            <Text style={styles.chipText}>{t('mantras.nowChanting')}</Text>
          </View>
        ) : null}
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onToggleFavorite(mantra.id)}
          accessibilityRole="button"
          accessibilityLabel={t('mantras.favoriteAria', { name: mantra.name })}
          accessibilityState={{ selected: favorite }}
          style={styles.iconButton}
        >
          <HeartIcon color={colors.maroon} filled={favorite} />
        </TouchableOpacity>

        {isCustom && onRemove ? (
          <TouchableOpacity
            onPress={() => onRemove(mantra.id)}
            accessibilityRole="button"
            accessibilityLabel={t('mantras.removeAria', { name: mantra.name })}
            style={styles.iconButton}
          >
            <CloseIcon color={colors.muted} />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          onPress={() => onChant(mantra.id)}
          accessibilityRole="button"
          accessibilityLabel={t('mantras.chantAria', { name: mantra.name })}
          style={styles.iconButton}
        >
          <View style={styles.chant}>
            <PlayIcon color={colors.ground} size={16} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingLeft: 18,
    paddingRight: spacing.xs,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
  },
  rowActive: {
    backgroundColor: '#F8EDE0',
    borderColor: colors.maroon,
    borderLeftWidth: 4,
    paddingLeft: 15,
  },
  main: { flex: 1, justifyContent: 'center' },
  name: { fontFamily: fontFamily.serif400, fontSize: 18, lineHeight: 23, color: colors.ink },
  devanagari: { fontFamily: fontFamily.devanagari400 },
  sub: {
    marginTop: 2,
    fontFamily: fontFamily.devanagari400Italic,
    fontSize: 14,
    color: colors.muted,
  },
  description: { marginTop: 6, fontSize: 13, lineHeight: 18.5, color: colors.muted },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#FBE3C5',
  },
  chipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.saffronDark },
  chipText: {
    fontSize: 10,
    fontFamily: fontFamily.sans700,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#7A3E12',
  },
  actions: { alignItems: 'center', marginLeft: spacing.xs },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  chant: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.maroon,
  },
});
