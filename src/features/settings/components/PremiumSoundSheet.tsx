import React from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LockIcon, PlayIcon, StopIcon } from '@/shared/components/icons';
import { useNow } from '@/shared/hooks/useNow';
import { isSoundUnlocked, unlockHoursLeft } from '@/shared/lib/soundAccess';
import { useAdStore } from '@/shared/store/useAdStore';
import { fontFamily, makeStyles, radius, spacing, useColors } from '@/shared/theme';
import { PREMIUM_SOUNDS, type PremiumSoundId, type SoundscapeId } from '@/shared/types/models';

type Props = {
  visible: boolean;
  onClose: () => void;
  selected: SoundscapeId;
  onSelect: (id: SoundscapeId) => void;
  /** Shared rewarded video for the screen. */
  rewardedReady: boolean;
  showRewarded: (onEarned: () => void) => void;
  previewing: SoundscapeId | null;
  onTogglePreview: (id: SoundscapeId) => void;
  onStopPreview: () => void;
};

/**
 * Bottom sheet of premium soundscapes: each can be previewed for a few
 * seconds, and one rewarded video unlocks it for 48 hours. Tapping a locked
 * row previews it; tapping an unlocked one selects it. Closing stops a preview.
 */
export function PremiumSoundSheet({
  visible,
  onClose,
  selected,
  onSelect,
  rewardedReady,
  showRewarded,
  previewing,
  onTogglePreview,
  onStopPreview,
}: Props) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const unlocks = useAdStore((s) => s.soundUnlocks);
  const unlockSound = useAdStore((s) => s.unlockSound);
  const now = useNow();

  const unlock = (id: PremiumSoundId) => {
    showRewarded(() => {
      onStopPreview();
      unlockSound(id, Date.now());
      onSelect(id);
    });
  };

  const close = () => {
    onStopPreview();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={close}
        accessibilityRole="button"
        accessibilityLabel={t('settings.closeSounds')}
      />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.heading}>{t('settings.moreSounds')}</Text>
          <TouchableOpacity onPress={close} accessibilityRole="button" hitSlop={10}>
            <Text style={styles.done}>{t('settings.done')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>{t('settings.moreSoundsHint')}</Text>
        <ScrollView contentContainerStyle={styles.list}>
          {PREMIUM_SOUNDS.map((id) => {
            const unlocked = isSoundUnlocked(id, unlocks, now);
            const active = unlocked && selected === id;
            const playing = previewing === id;
            const name = t(`settings.sound_${id}`);
            return (
              <View key={id} style={[styles.row, active && styles.rowActive]}>
                <TouchableOpacity
                  onPress={() => onTogglePreview(id)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    playing ? t('settings.stopPreview') : t('settings.previewSound', { name })
                  }
                  hitSlop={6}
                  style={styles.preview}
                >
                  {playing ? (
                    <StopIcon color={colors.maroon} size={26} />
                  ) : (
                    <PlayIcon color={colors.maroon} size={26} />
                  )}
                </TouchableOpacity>
                <Pressable
                  style={styles.main}
                  onPress={() => (unlocked ? onSelect(id) : onTogglePreview(id))}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.name, active && styles.nameActive]} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={styles.status} numberOfLines={1}>
                    {unlocked
                      ? t('settings.unlockedHours', { count: unlockHoursLeft(id, unlocks, now) })
                      : playing
                        ? t('settings.previewing')
                        : t('settings.lockedHint')}
                  </Text>
                </Pressable>
                {unlocked ? null : (
                  <TouchableOpacity
                    onPress={() => unlock(id)}
                    disabled={!rewardedReady}
                    accessibilityRole="button"
                    accessibilityLabel={t('settings.unlockSound', { name })}
                    accessibilityState={{ disabled: !rewardedReady }}
                    style={[styles.unlock, !rewardedReady && styles.unlockWaiting]}
                  >
                    <LockIcon color={colors.onAccent} size={14} />
                    <Text style={styles.unlockText}>
                      {rewardedReady ? t('settings.unlockAction') : t('progress.restoreLoading')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((colors) => ({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    maxHeight: '80%',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.ground,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontFamily: fontFamily.serif500, fontSize: 22, color: colors.ink },
  done: { fontFamily: fontFamily.sans700, fontSize: 14, color: colors.maroon },
  hint: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  list: { gap: spacing.sm, paddingBottom: spacing.sm },
  row: {
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 56,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
  },
  rowActive: { backgroundColor: colors.surfaceSelected, borderColor: colors.maroon },
  preview: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  main: { flex: 1, justifyContent: 'center', paddingVertical: 4 },
  name: { fontFamily: fontFamily.sans600, fontSize: 15, color: colors.ink },
  nameActive: { color: colors.maroon },
  status: { marginTop: 2, fontSize: 12, color: colors.muted },
  unlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.maroon,
  },
  unlockWaiting: { opacity: 0.55 },
  unlockText: { fontFamily: fontFamily.sans700, fontSize: 12, color: colors.onAccent },
}));
