import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconRow } from '@/features/settings/components/IconRow';
import { MalaIllustration } from '@/features/settings/components/MalaIllustration';
import { PillGrid } from '@/features/settings/components/PillGrid';
import { ProfileCard } from '@/features/settings/components/ProfileCard';
import { ReminderRow } from '@/features/settings/components/ReminderRow';
import { SettingsCard } from '@/features/settings/components/SettingsCard';
import { ToggleSwitch } from '@/features/settings/components/ToggleSwitch';
import { Header } from '@/shared/components/Header';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { HapticIcon, LanguageIcon, RisingIcon, SoundIcon } from '@/shared/components/icons';
import i18n from '@/shared/i18n';
import { syncDailyReminder } from '@/shared/lib/notifications';
import { useProgressStore } from '@/shared/store/useProgressStore';
import { useSettingsStore } from '@/shared/store/useSettingsStore';
import { colors, fontFamily, spacing } from '@/shared/theme';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? '').concat(parts[1]?.[0] ?? '').toUpperCase() || '?';
}

export function SettingsScreen() {
  const { t } = useTranslation();
  const settings = useSettingsStore();
  const totalBeadsLifetime = useProgressStore((s) => s.totalBeadsLifetime);
  const streakDays = useProgressStore((s) => s.streakDays);

  useEffect(() => {
    void i18n.changeLanguage(settings.lang);
  }, [settings.lang]);

  useEffect(() => {
    void syncDailyReminder(
      settings.reminderTime,
      t('settings.reminderTitle'),
      t('settings.reminderDesc'),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.reminderTime]);

  return (
    <ScreenContainer>
      <Header title={t('appTitle')} showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleBlock}>
          <Text style={styles.h1}>{t('settings.title')}</Text>
          <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>
        </View>

        <ProfileCard
          style={styles.profileCard}
          name={settings.name}
          onChangeName={settings.setName}
          initials={initials(settings.name)}
          sinceYear={2023}
          totalBeadsLifetime={totalBeadsLifetime}
          streakDays={streakDays}
        />

        <Text style={styles.sectionLabel}>{t('settings.sensoryExperience')}</Text>

        <SettingsCard style={styles.card}>
          <IconRow
            icon={<HapticIcon color={colors.maroon} />}
            title={t('settings.hapticTitle')}
            description={t('settings.hapticDesc')}
            control={
              <ToggleSwitch
                value={settings.haptics}
                onChange={settings.setHaptics}
                accessibilityLabel={t('settings.hapticTitle')}
              />
            }
          />
        </SettingsCard>

        <SettingsCard style={styles.stackedCard}>
          <IconRow
            icon={<RisingIcon color={colors.maroon} />}
            title={t('settings.risingTitle')}
            description={t('settings.risingDesc')}
            control={
              <ToggleSwitch
                value={settings.risingMantra}
                onChange={settings.setRisingMantra}
                accessibilityLabel={t('settings.risingTitle')}
              />
            }
          />
          <View style={[styles.speedBlock, !settings.risingMantra && styles.speedBlockOff]}>
            <Text style={styles.fieldLabel}>{t('settings.animSpeed')}</Text>
            <PillGrid
              columns={3}
              disabled={!settings.risingMantra}
              value={settings.animSpeed}
              onChange={settings.setAnimSpeed}
              options={[
                { value: 'gentle', label: t('settings.speedGentle') },
                { value: 'steady', label: t('settings.speedSteady') },
                { value: 'quick', label: t('settings.speedQuick') },
              ]}
            />
          </View>
        </SettingsCard>

        <SettingsCard style={styles.stackedCard}>
          <IconRow icon={<SoundIcon color={colors.maroon} />} title={t('settings.ambientTitle')} />
          <View style={styles.pillBlock}>
            <PillGrid
              columns={2}
              value={settings.sound}
              onChange={settings.setSound}
              options={[
                { value: 'silence', label: t('settings.soundSilence') },
                { value: 'ganga', label: t('settings.soundGanga') },
                { value: 'forest', label: t('settings.soundForest') },
                { value: 'bowls', label: t('settings.soundBowls') },
              ]}
            />
          </View>
        </SettingsCard>

        <SettingsCard style={styles.stackedCard}>
          <IconRow
            icon={<LanguageIcon color={colors.maroon} />}
            title={t('settings.languageTitle')}
            description={t('settings.languageDesc')}
          />
          <View style={styles.pillBlock}>
            <PillGrid
              columns={2}
              value={settings.lang}
              onChange={settings.setLang}
              options={[
                { value: 'en', label: t('settings.langEn') },
                { value: 'hi', label: t('settings.langHi') },
              ]}
            />
          </View>
        </SettingsCard>

        <Text style={styles.sectionLabel}>{t('settings.mindfulnessCues')}</Text>

        <SettingsCard style={styles.card}>
          <ReminderRow time={settings.reminderTime} onChange={settings.setReminderTime} />
        </SettingsCard>

        <MalaIllustration />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  titleBlock: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, alignItems: 'center' },
  h1: {
    fontFamily: fontFamily.serif500,
    fontSize: 30,
    lineHeight: 33,
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    maxWidth: 300,
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink,
    textAlign: 'center',
  },
  sectionLabel: {
    marginTop: 32,
    marginHorizontal: spacing.lg,
    marginBottom: 12,
    fontSize: 11,
    fontFamily: fontFamily.sans700,
    letterSpacing: 1.76,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  card: { marginHorizontal: spacing.lg },
  profileCard: { marginTop: 24, marginHorizontal: spacing.lg },
  stackedCard: { marginTop: 12, marginHorizontal: spacing.lg },
  fieldLabel: {
    fontSize: 10,
    fontFamily: fontFamily.sans600,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  speedBlock: { marginTop: spacing.md },
  speedBlockOff: { opacity: 0.45 },
  pillBlock: { marginTop: spacing.md },
});
