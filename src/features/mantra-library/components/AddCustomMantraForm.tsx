import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/components/Button';
import { colors, radius, spacing, typeScale } from '@/shared/theme';

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
    <View style={styles.row}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={t('mantras.customPlaceholder')}
        placeholderTextColor={colors.muted}
        style={styles.input}
        onSubmitEditing={submit}
        returnKeyType="done"
      />
      <Button label={t('mantras.add')} onPress={submit} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: {
    ...typeScale.body,
    flex: 1,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    color: colors.ink,
  },
  button: { paddingHorizontal: spacing.md },
});
