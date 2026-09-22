import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, fontFamily, radius, spacing, typeScale } from '@/shared/theme';

type Props = { time: string | null; onChange: (time: string | null) => void };

function timeStringToDate(time: string | null): Date {
  const d = new Date();
  if (!time) {
    d.setHours(5, 30, 0, 0);
    return d;
  }
  const [h, m] = time.split(':').map(Number);
  d.setHours(h ?? 5, m ?? 30, 0, 0);
  return d;
}

export function ReminderRow({ time, onChange }: Props) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);

  const desc = time ? t('settings.reminderDescSet', { time }) : t('settings.reminderDescUnset');

  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <Text style={styles.title}>{t('settings.reminderTitle')}</Text>
        <Text style={styles.description}>{desc}</Text>
      </View>
      <TouchableOpacity
        onPress={() => setPickerOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t('settings.change')}
        style={styles.changeButton}
      >
        <Text style={styles.changeLabel}>{t('settings.change')}</Text>
      </TouchableOpacity>

      {pickerOpen ? (
        <DateTimePicker
          value={timeStringToDate(time)}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selected) => {
            setPickerOpen(Platform.OS === 'ios');
            if (event.type === 'dismissed' || !selected) return;
            const hh = String(selected.getHours()).padStart(2, '0');
            const mm = String(selected.getMinutes()).padStart(2, '0');
            onChange(`${hh}:${mm}`);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  textCol: { flex: 1 },
  title: { ...typeScale.bodyStrong, fontFamily: fontFamily.sans600, color: colors.ink },
  description: { ...typeScale.caption, color: colors.muted, marginTop: 2 },
  changeButton: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeLabel: { ...typeScale.bodyStrong, color: colors.maroon },
});
