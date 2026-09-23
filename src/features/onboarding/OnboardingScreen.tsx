import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { BrandMark } from '@/shared/components/BrandMark';
import { Button } from '@/shared/components/Button';
import { useSettingsStore } from '@/shared/store/useSettingsStore';
import { colors, fontFamily, radius, spacing } from '@/shared/theme';

/** First-launch screen that collects the name shown in Settings. */
export function OnboardingScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const [name, setName] = useState('');

  const canContinue = name.trim().length > 0;
  const submit = () => {
    if (canContinue) completeOnboarding(name);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.lg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.body}>
        <BrandMark size={72} />
        <Text style={styles.title}>{t('onboarding.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.subtitle')}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('onboarding.placeholder')}
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoFocus
          maxLength={40}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
      </View>
      <Button
        label={t('onboarding.continue')}
        onPress={submit}
        disabled={!canContinue}
        style={!canContinue && styles.disabled}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ground, paddingHorizontal: spacing.lg },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    marginTop: spacing.lg,
    fontFamily: fontFamily.serif400,
    fontSize: 32,
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    fontFamily: fontFamily.sans500,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
    textAlign: 'center',
  },
  input: {
    alignSelf: 'stretch',
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fontFamily.sans600,
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
  },
  disabled: { opacity: 0.4 },
});
