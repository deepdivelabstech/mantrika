import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { SettingsCard } from '@/features/settings/components/SettingsCard';
import { applyBackup, buildBackup, parseBackup } from '@/shared/lib/backup';
import { colors, fontFamily, radius, spacing } from '@/shared/theme';

type Props = { style?: React.ComponentProps<typeof View>['style'] };

/**
 * Manual backup until cloud sync exists: export shares the JSON (save it to
 * Notes/Drive/email), import takes it back by paste. Uses only RN built-ins
 * so it ships without a native rebuild.
 */
export function BackupCard({ style }: Props) {
  const { t } = useTranslation();
  const [importing, setImporting] = useState(false);
  const [draft, setDraft] = useState('');

  const exportData = async () => {
    try {
      await Share.share({
        title: t('settings.backupShareTitle'),
        message: JSON.stringify(buildBackup()),
      });
    } catch {
      Alert.alert(t('common.somethingWentWrong'));
    }
  };

  const confirmImport = () => {
    let backup;
    try {
      backup = parseBackup(draft.trim());
    } catch {
      Alert.alert(t('settings.importInvalidTitle'), t('settings.importInvalidDesc'));
      return;
    }
    Alert.alert(t('settings.importConfirmTitle'), t('settings.importConfirmDesc'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.importAction'),
        style: 'destructive',
        onPress: () => {
          applyBackup(backup);
          setImporting(false);
          setDraft('');
          Alert.alert(t('settings.importDone'));
        },
      },
    ]);
  };

  return (
    <SettingsCard style={style}>
      <Text style={styles.title}>{t('settings.backupTitle')}</Text>
      <Text style={styles.desc}>{t('settings.backupDesc')}</Text>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={exportData}
          accessibilityRole="button"
          style={[styles.button, styles.primary]}
        >
          <Text style={styles.primaryText}>{t('settings.exportAction')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setImporting(true)}
          accessibilityRole="button"
          style={styles.button}
        >
          <Text style={styles.secondaryText}>{t('settings.importAction')}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={importing}
        transparent
        animationType="fade"
        onRequestClose={() => setImporting(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>{t('settings.importTitle')}</Text>
            <Text style={styles.desc}>{t('settings.importHint')}</Text>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              style={styles.input}
              multiline
              autoCorrect={false}
              autoCapitalize="none"
              placeholder="{ … }"
              placeholderTextColor={colors.muted}
            />
            <View style={styles.dialogRow}>
              <TouchableOpacity
                onPress={() => setImporting(false)}
                accessibilityRole="button"
                style={styles.dialogButton}
              >
                <Text style={styles.dialogCancel}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmImport}
                disabled={!draft.trim()}
                accessibilityRole="button"
                style={[styles.dialogButton, !draft.trim() && styles.disabled]}
              >
                <Text style={styles.dialogSave}>{t('settings.importAction')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SettingsCard>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.sans700, fontSize: 15, color: colors.ink },
  desc: { marginTop: 4, fontSize: 13, lineHeight: 18, color: colors.muted },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  button: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  primaryText: { fontFamily: fontFamily.sans700, fontSize: 13, color: colors.white },
  secondaryText: { fontFamily: fontFamily.sans700, fontSize: 13, color: colors.maroon },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.lg,
    backgroundColor: colors.ground,
    padding: spacing.lg,
  },
  dialogTitle: { fontFamily: fontFamily.serif400, fontSize: 20, color: colors.ink },
  input: {
    marginTop: spacing.md,
    height: 160,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.sm,
    fontSize: 12,
    color: colors.ink,
    textAlignVertical: 'top',
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
  disabled: { opacity: 0.4 },
});
