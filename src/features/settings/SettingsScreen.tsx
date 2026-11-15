import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { showAdPrivacyOptions, useAdsConsentStore } from '@/app/ads';
import { AdFreeCard } from '@/features/settings/components/AdFreeCard';
import { BackupCard } from '@/features/settings/components/BackupCard';
import { IconRow } from '@/features/settings/components/IconRow';
import { PillGrid } from '@/shared/components/PillGrid';
import { PremiumSoundSheet } from '@/features/settings/components/PremiumSoundSheet';
import { ProfileCard } from '@/features/settings/components/ProfileCard';
import { ReminderRow } from '@/features/settings/components/ReminderRow';
import { SettingsCard } from '@/features/settings/components/SettingsCard';
import { ToggleSwitch } from '@/shared/components/ToggleSwitch';
import { AboutFooter } from '@/shared/components/AboutFooter';
import { Header } from '@/shared/components/Header';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useNow } from '@/shared/hooks/useNow';
import { useRewardedUnlock } from '@/shared/hooks/useRewardedUnlock';
import { useSoundPreview } from '@/shared/hooks/useSoundPreview';
import { useToday } from '@/shared/hooks/useToday';
import {
  ChevronIcon,
  CounterTabIcon,
  HapticIcon,
  LanguageIcon,
  MoonIcon,
  ProgressTabIcon,
  ReminderIcon,
  RisingIcon,
  SettingsIcon,
  ShareIcon,
  SoundIcon,
  StarIcon,
} from '@/shared/components/icons';
import i18n from '@/shared/i18n';
import { syncDailyReminder } from '@/shared/lib/notifications';
import { isPremiumSound, isSoundUnlocked } from '@/shared/lib/soundAccess';
import { openStoreListing, shareApp } from '@/shared/lib/storeReview';
import { useAdStore } from '@/shared/store/useAdStore';
import { selectStreakDays, useProgressStore } from '@/shared/store/useProgressStore';
import { useSettingsStore } from '@/shared/store/useSettingsStore';
import { fontFamily, makeStyles, radius, spacing, useColors } from '@/shared/theme';
import { DAILY_GOAL_OPTIONS, PREMIUM_SOUNDS, type SoundscapeId } from '@/shared/types/models';

// Rewarded placements (ad-free day, premium sounds) need the native ads SDK.
const REWARDS_AVAILABLE = Platform.OS !== 'web';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? '').concat(parts[1]?.[0] ?? '').toUpperCase() || '?';
}

export function SettingsScreen() {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const settings = useSettingsStore();
  const totalBeadsLifetime = useProgressStore((s) => s.totalBeadsLifetime);
  const today = useToday();
  const streakDays = useProgressStore((s) => selectStreakDays(s, today));
  const privacyOptionsRequired = useAdsConsentStore((s) => s.privacyOptionsRequired);
  // One rewarded video shared by every placement on this screen.
  const rewarded = useRewardedUnlock(REWARDS_AVAILABLE);
  const preview = useSoundPreview();
  const stopPreview = preview.stop;
  // Tabs stay mounted, so stop a preview when Settings loses focus too.
  useFocusEffect(useCallback(() => () => stopPreview(), [stopPreview]));
  const [soundSheetOpen, setSoundSheetOpen] = useState(false);
  const soundUnlocks = useAdStore((s) => s.soundUnlocks);
  const now = useNow();
  const unlockedCount = PREMIUM_SOUNDS.filter((id) =>
    isSoundUnlocked(id, soundUnlocks, now),
  ).length;
  const premiumSelected = isPremiumSound(settings.sound);
  const selectSound = (id: SoundscapeId) => {
    stopPreview();
    settings.setSound(id);
  };

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

  const share = async () => {
    try {
      await shareApp(t('settings.shareTitle'), t('settings.shareMessage'));
    } catch {
      Alert.alert(t('common.somethingWentWrong'));
    }
  };

  return (
    <ScreenContainer>
      <Header title={t('appTitle')} />
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

        <Text style={styles.sectionLabel}>{t('settings.practice')}</Text>

        <SettingsCard style={styles.card}>
          <IconRow
            icon={<ProgressTabIcon color={colors.maroon} />}
            title={t('settings.dailyGoalTitle')}
            description={t('settings.dailyGoalDesc')}
          />
          <View style={styles.pillBlock}>
            <PillGrid
              columns={3}
              value={String(settings.dailyGoalMalas)}
              onChange={(v) => settings.setDailyGoalMalas(Number(v))}
              options={DAILY_GOAL_OPTIONS.map((n) => ({
                value: String(n),
                label: t('common.malas', { count: n }),
              }))}
            />
          </View>
        </SettingsCard>

        <SettingsCard style={styles.stackedCard}>
          <IconRow
            icon={<ReminderIcon color={colors.maroon} />}
            title={t('settings.chimeTitle')}
            description={t('settings.chimeDesc')}
            control={
              <ToggleSwitch
                value={settings.roundChime}
                onChange={settings.setRoundChime}
                accessibilityLabel={t('settings.chimeTitle')}
              />
            }
          />
        </SettingsCard>

        <SettingsCard style={styles.stackedCard}>
          <IconRow
            icon={<CounterTabIcon color={colors.maroon} />}
            title={t('settings.pauseTitle')}
            description={t('settings.pauseDesc')}
            control={
              <ToggleSwitch
                value={settings.pauseAfterRound}
                onChange={settings.setPauseAfterRound}
                accessibilityLabel={t('settings.pauseTitle')}
              />
            }
          />
        </SettingsCard>

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
              onChange={selectSound}
              options={[
                { value: 'silence', label: t('settings.soundSilence') },
                { value: 'ganga', label: t('settings.soundGanga') },
                { value: 'forest', label: t('settings.soundForest') },
                { value: 'bowls', label: t('settings.soundBowls') },
              ]}
            />
            {REWARDS_AVAILABLE ? (
              <Pressable
                onPress={() => setSoundSheetOpen(true)}
                accessibilityRole="button"
                accessibilityState={{ selected: premiumSelected }}
                style={({ pressed }) => [
                  styles.moreSounds,
                  premiumSelected && styles.moreSoundsActive,
                  pressed && styles.moreSoundsPressed,
                ]}
              >
                <View style={styles.moreSoundsText}>
                  <Text
                    style={[
                      styles.moreSoundsTitle,
                      premiumSelected && styles.moreSoundsTitleActive,
                    ]}
                  >
                    {premiumSelected
                      ? t(`settings.sound_${settings.sound}`)
                      : t('settings.moreSounds')}
                  </Text>
                  <Text style={styles.moreSoundsDesc}>
                    {t('settings.moreSoundsSummary', {
                      count: PREMIUM_SOUNDS.length,
                      unlocked: unlockedCount,
                    })}
                  </Text>
                </View>
                <ChevronIcon color={colors.muted} />
              </Pressable>
            ) : null}
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

        <SettingsCard style={styles.stackedCard}>
          <IconRow
            icon={<MoonIcon color={colors.maroon} />}
            title={t('settings.appearanceTitle')}
            description={t('settings.appearanceDesc')}
          />
          <View style={styles.pillBlock}>
            <PillGrid
              columns={3}
              value={settings.appearance}
              onChange={settings.setAppearance}
              options={[
                { value: 'system', label: t('settings.themeSystem') },
                { value: 'light', label: t('settings.themeLight') },
                { value: 'dark', label: t('settings.themeDark') },
              ]}
            />
          </View>
        </SettingsCard>

        <Text style={styles.sectionLabel}>{t('settings.mindfulnessCues')}</Text>

        <SettingsCard style={styles.card}>
          <ReminderRow time={settings.reminderTime} onChange={settings.setReminderTime} />
        </SettingsCard>

        <Text style={styles.sectionLabel}>{t('settings.yourData')}</Text>

        <BackupCard style={styles.card} />

        {privacyOptionsRequired && (
          <SettingsCard style={styles.stackedCard} onPress={() => void showAdPrivacyOptions()}>
            <IconRow
              icon={<SettingsIcon color={colors.maroon} />}
              title={t('settings.adPrivacyTitle')}
              description={t('settings.adPrivacyDesc')}
              control={<ChevronIcon color={colors.muted} />}
            />
          </SettingsCard>
        )}

        <Text style={styles.sectionLabel}>{t('settings.shareSupport')}</Text>

        {REWARDS_AVAILABLE ? (
          <AdFreeCard
            style={styles.card}
            rewardedReady={rewarded.ready}
            showRewarded={rewarded.show}
          />
        ) : null}

        <SettingsCard style={REWARDS_AVAILABLE ? styles.stackedCard : styles.card} onPress={share}>
          <IconRow
            icon={<ShareIcon color={colors.maroon} />}
            title={t('settings.shareTitle')}
            description={t('settings.shareDesc')}
            control={<ChevronIcon color={colors.muted} />}
          />
        </SettingsCard>

        <SettingsCard style={styles.stackedCard} onPress={() => void openStoreListing()}>
          <IconRow
            icon={<StarIcon color={colors.maroon} />}
            title={t('settings.rateTitle')}
            description={t('settings.rateDesc')}
            control={<ChevronIcon color={colors.muted} />}
          />
        </SettingsCard>

        <AboutFooter style={styles.about} />
      </ScrollView>

      {REWARDS_AVAILABLE ? (
        <PremiumSoundSheet
          visible={soundSheetOpen}
          onClose={() => setSoundSheetOpen(false)}
          selected={settings.sound}
          onSelect={selectSound}
          rewardedReady={rewarded.ready}
          showRewarded={rewarded.show}
          previewing={preview.previewing}
          onTogglePreview={(id) => void preview.toggle(id)}
          onStopPreview={preview.stop}
        />
      ) : null}
    </ScreenContainer>
  );
}

const useStyles = makeStyles((colors) => ({
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
  moreSounds: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.ground,
  },
  moreSoundsActive: { borderColor: colors.maroon, backgroundColor: colors.surfaceSelected },
  moreSoundsPressed: { opacity: 0.7 },
  moreSoundsText: { flex: 1 },
  moreSoundsTitle: { fontFamily: fontFamily.sans600, fontSize: 15, color: colors.ink },
  moreSoundsTitleActive: { color: colors.maroon },
  moreSoundsDesc: { marginTop: 2, fontSize: 12, color: colors.muted },
  about: { marginTop: spacing.xxl, marginHorizontal: spacing.lg },
}));
