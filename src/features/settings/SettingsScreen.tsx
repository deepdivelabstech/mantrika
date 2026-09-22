import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { OptionList } from '@/features/settings/components/OptionList';
import { ReminderRow } from '@/features/settings/components/ReminderRow';
import { SegmentedControl } from '@/features/settings/components/SegmentedControl';
import { ToggleRow } from '@/features/settings/components/ToggleRow';
import { Card } from '@/shared/components/Card';
import { Header } from '@/shared/components/Header';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import i18n from '@/shared/i18n';
import { syncDailyReminder } from '@/shared/lib/notifications';
import { useSettingsStore } from '@/shared/store/useSettingsStore';
import { colors, fontFamily, spacing, typeScale } from '@/shared/theme';

export function SettingsScreen() {
  const { t } = useTranslation();
  const settings = useSettingsStore();

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
      <Header title={t('settings.title')} showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>

        <Section title={t('settings.sensoryExperience')}>
          <ToggleRow
            title={t('settings.hapticTitle')}
            description={t('settings.hapticDesc')}
            value={settings.haptics}
            onChange={settings.setHaptics}
          />
          <Divider />
          <ToggleRow
            title={t('settings.risingTitle')}
            description={t('settings.risingDesc')}
            value={settings.risingMantra}
            onChange={settings.setRisingMantra}
          />
          {settings.risingMantra ? (
            <View style={styles.speedBlock}>
              <Text style={styles.fieldLabel}>{t('settings.animSpeed')}</Text>
              <SegmentedControl
                accessibilityLabel={t('settings.animSpeed')}
                value={settings.animSpeed}
                onChange={settings.setAnimSpeed}
                options={[
                  { value: 'gentle', label: t('settings.speedGentle') },
                  { value: 'steady', label: t('settings.speedSteady') },
                  { value: 'quick', label: t('settings.speedQuick') },
                ]}
              />
            </View>
          ) : null}
        </Section>

        <Section title={t('settings.mindfulnessCues')}>
          <Text style={styles.fieldLabel}>{t('settings.ambientTitle')}</Text>
          <OptionList
            value={settings.sound}
            onChange={settings.setSound}
            options={[
              { value: 'silence', label: t('settings.soundSilence') },
              { value: 'ganga', label: t('settings.soundGanga') },
              { value: 'forest', label: t('settings.soundForest') },
              { value: 'bowls', label: t('settings.soundBowls') },
            ]}
          />
          <Divider />
          <ReminderRow time={settings.reminderTime} onChange={settings.setReminderTime} />
        </Section>

        <Section title={t('settings.languageTitle')}>
          <Text style={styles.fieldDescription}>{t('settings.languageDesc')}</Text>
          <OptionList
            value={settings.lang}
            onChange={settings.setLang}
            options={[
              { value: 'en', label: t('settings.langEn') },
              { value: 'hi', label: t('settings.langHi') },
            ]}
          />
        </Section>
      </ScrollView>
    </ScreenContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </Card>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  subtitle: { ...typeScale.body, color: colors.muted },
  section: { gap: spacing.xs },
  sectionTitle: {
    ...typeScale.caption,
    fontFamily: fontFamily.sans700,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    ...typeScale.caption,
    fontFamily: fontFamily.sans600,
    color: colors.ink,
    marginTop: spacing.xs,
    marginBottom: spacing.xxs,
  },
  fieldDescription: { ...typeScale.caption, color: colors.muted, marginBottom: spacing.xs },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: spacing.xs },
  speedBlock: { marginTop: spacing.xs },
});
