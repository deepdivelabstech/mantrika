import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { BrandMark } from '@/shared/components/BrandMark';
import { Button } from '@/shared/components/Button';
import { PillGrid } from '@/shared/components/PillGrid';
import { useSettingsStore } from '@/shared/store/useSettingsStore';
import { colors, fontFamily, radius, spacing } from '@/shared/theme';
import { DAILY_GOAL_OPTIONS, DEFAULT_DAILY_GOAL_MALAS } from '@/shared/types/models';

/** First launch, two short steps: the name shown in Settings, then the daily sankalpa. */
export function OnboardingScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const [name, setName] = useState('');
  const [step, setStep] = useState<'name' | 'goal'>('name');
  const [goal, setGoal] = useState(String(DEFAULT_DAILY_GOAL_MALAS));

  const canContinue = name.trim().length > 0;
  const next = () => {
    if (canContinue) setStep('goal');
  };
  const finish = () => completeOnboarding(name, Number(goal));

  if (step === 'goal') {
    return (
      <View
        style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.lg }]}
      >
        <View style={styles.body}>
          <BrandMark size={56} />
          <Text style={styles.title}>{t('onboarding.goalTitle')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.goalSubtitle')}</Text>
          <View style={styles.goalGrid}>
            <PillGrid
              columns={3}
              value={goal}
              onChange={setGoal}
              options={DAILY_GOAL_OPTIONS.map((n) => ({
                value: String(n),
                label: t('common.malas', { count: n }),
              }))}
            />
          </View>
        </View>
        <View style={styles.actions}>
          <Button
            label={t('common.back')}
            variant="secondary"
            onPress={() => setStep('name')}
            style={styles.action}
          />
          <Button label={t('onboarding.begin')} onPress={finish} style={styles.action} />
        </View>
      </View>
    );
  }

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
          onSubmitEditing={next}
        />
      </View>
      <Button
        label={t('onboarding.continue')}
        onPress={next}
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
  goalGrid: { alignSelf: 'stretch', marginTop: spacing.xl },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
