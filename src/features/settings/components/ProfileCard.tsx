import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { SettingsCard } from '@/features/settings/components/SettingsCard';
import { colors, fontFamily, radius, spacing } from '@/shared/theme';

type Props = {
  name: string;
  onChangeName: (name: string) => void;
  initials: string;
  sinceYear: number;
  totalBeadsLifetime: number;
  streakDays: number;
  style?: ViewStyle;
};

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

export function ProfileCard({
  name,
  onChangeName,
  initials,
  sinceYear,
  totalBeadsLifetime,
  streakDays,
  style,
}: Props) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  const openEditor = () => {
    setDraft(name);
    setEditing(true);
  };

  const save = () => {
    onChangeName(draft);
    setEditing(false);
  };

  return (
    <SettingsCard style={[styles.card, style]}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.nameCol}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.since}>{t('settings.sadhakaSince', { year: sinceYear })}</Text>
        </View>
        <TouchableOpacity
          onPress={openEditor}
          accessibilityRole="button"
          accessibilityLabel={t('settings.edit')}
        >
          <Text style={styles.edit}>{t('settings.edit')}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={editing}
        transparent
        animationType="fade"
        onRequestClose={() => setEditing(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>{t('settings.edit')}</Text>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              style={styles.input}
              autoFocus
              maxLength={40}
              returnKeyType="done"
              onSubmitEditing={save}
            />
            <View style={styles.dialogRow}>
              <TouchableOpacity
                onPress={() => setEditing(false)}
                accessibilityRole="button"
                style={styles.dialogButton}
              >
                <Text style={styles.dialogCancel}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={save}
                accessibilityRole="button"
                style={styles.dialogButton}
              >
                <Text style={styles.dialogSave}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.statsRow}>
        <View style={styles.statCol}>
          <Text style={styles.statValue}>{formatCount(totalBeadsLifetime)}</Text>
          <Text style={styles.statLabel}>{t('settings.totalCounts')}</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statValue}>{streakDays}</Text>
          <Text style={styles.statLabel}>{t('progress.currentStreak')}</Text>
        </View>
      </View>
    </SettingsCard>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EBD7C1',
    borderWidth: 2,
    borderColor: colors.maroon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.serif400, fontSize: 24, color: colors.maroon },
  nameCol: { flex: 1 },
  name: { fontFamily: fontFamily.serif400, fontSize: 26, color: colors.ink },
  since: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: fontFamily.sans600,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  edit: { fontSize: 13, fontFamily: fontFamily.sans700, color: colors.maroon },
  statsRow: {
    flexDirection: 'row',
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  statCol: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: fontFamily.serif400, fontSize: 24, color: colors.ink },
  statLabel: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: fontFamily.sans600,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radius.lg,
    backgroundColor: colors.ground,
    padding: spacing.lg,
  },
  dialogTitle: { fontFamily: fontFamily.serif400, fontSize: 20, color: colors.ink },
  input: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fontFamily.sans600,
    fontSize: 16,
    color: colors.ink,
  },
  dialogRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  dialogButton: { minHeight: 32, justifyContent: 'center' },
  dialogCancel: { fontFamily: fontFamily.sans700, fontSize: 14, color: colors.muted },
  dialogSave: { fontFamily: fontFamily.sans700, fontSize: 14, color: colors.maroon },
});
