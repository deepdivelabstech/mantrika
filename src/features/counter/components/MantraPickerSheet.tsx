import React from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import { displayName } from '@/shared/lib/mantraDisplay';
import { colors, fontFamily, radius, spacing, typeScale } from '@/shared/theme';
import type { Language, Mantra } from '@/shared/types/models';

type Props = {
  visible: boolean;
  onClose: () => void;
  options: Mantra[];
  currentId: string;
  lang: Language;
  onPick: (id: string) => void;
};

const SHEET_IDS = [
  'om-namah-shivaya',
  'gayatri-mantra',
  'maha-mrityunjaya',
  'hare-krishna',
  'om-mani-padme-hum',
];

export function MantraPickerSheet({ visible, onClose, options, currentId, lang, onPick }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const custom = options.filter((m) => m.id.startsWith('custom-'));
  const featured = SHEET_IDS.map((id) => options.find((m) => m.id === id)).filter(
    (m): m is Mantra => !!m,
  );
  const listed = [...featured, ...custom];
  if (!listed.some((m) => m.id === currentId)) {
    const current = options.find((m) => m.id === currentId);
    if (current) listed.push(current);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t('counter.closeSheetAria')}
      />
      <View style={styles.sheet} accessibilityRole="none">
        <Text style={styles.sheetTitle}>{t('counter.chooseMantra')}</Text>
        <FlatList
          data={listed}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => {
            const active = item.id === currentId;
            const isCustom = item.id.startsWith('custom-');
            const showDeva = lang === 'hi' && !isCustom;
            return (
              <TouchableOpacity
                onPress={() => onPick(item.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.option, active && styles.optionActive]}
              >
                <View>
                  <Text style={[styles.optionName, showDeva && styles.devanagari]}>
                    {displayName(item, lang)}
                  </Text>
                  <Text style={styles.optionSub}>
                    {isCustom ? t('counter.customMantraLabel') : showDeva ? item.name : item.deva}
                  </Text>
                </View>
                {active ? <Text style={styles.check}>✓</Text> : null}
              </TouchableOpacity>
            );
          }}
        />
        <TouchableOpacity
          onPress={() => {
            onClose();
            navigation.navigate('Mantras' as never);
          }}
          accessibilityRole="link"
        >
          <Text style={styles.browseAll}>{t('mantras.viewAll')}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    maxHeight: '75%',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.ground,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  sheetTitle: {
    ...typeScale.caption,
    fontFamily: fontFamily.sans700,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 58,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ground,
  },
  optionActive: { backgroundColor: colors.card, borderColor: colors.maroon },
  optionName: { fontFamily: fontFamily.serif400, fontSize: 18, color: colors.ink },
  optionSub: { ...typeScale.caption, color: colors.muted, marginTop: 2 },
  devanagari: { fontFamily: fontFamily.devanagari400 },
  check: { color: colors.maroon, fontSize: 18 },
  browseAll: {
    ...typeScale.bodyStrong,
    color: colors.maroon,
    marginTop: spacing.sm,
    minHeight: 44,
  },
});
