import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, fontFamily, spacing } from '@/shared/theme';

type Props = { onAdd: (text: string) => void };

export function AddCustomMantraForm({ onAdd }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText('');
  };

  return (
    <View style={styles.card} accessibilityRole="none">
      <Text style={styles.label}>{t('mantras.addCustom')}</Text>
      <View style={styles.row}>
        <TextInput
          value={text}
          onChangeText={setText}
          maxLength={40}
          placeholder={t('mantras.customPlaceholder')}
          placeholderTextColor={colors.muted}
          style={styles.input}
          onSubmitEditing={submit}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={submit} accessibilityRole="button" style={styles.button}>
          <Text style={styles.buttonText}>{t('mantras.add')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#C9B49B',
    borderRadius: 12,
  },
  label: {
    fontSize: 10,
    fontFamily: fontFamily.sans700,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#DCCBB8',
    borderRadius: 8,
    backgroundColor: colors.ground,
    fontSize: 14,
    color: colors.ink,
  },
  button: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: colors.maroon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontFamily: fontFamily.sans700,
    letterSpacing: 0.96,
    textTransform: 'uppercase',
    color: colors.ground,
  },
});
