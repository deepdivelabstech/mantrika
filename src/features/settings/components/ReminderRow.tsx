import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconRow } from '@/features/settings/components/IconRow';
import { ReminderIcon } from '@/shared/components/icons';
import { colors, fontFamily } from '@/shared/theme';

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
    <IconRow
      icon={<ReminderIcon color={colors.maroon} />}
      title={t('settings.reminderTitle')}
      description={desc}
      control={
        <>
          <TouchableOpacity
            onPress={() => setPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t('settings.change')}
            style={{ flexShrink: 0, height: 44, paddingHorizontal: 4, justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: fontFamily.sans700, fontSize: 13, color: colors.maroon }}>
              {t('settings.change')}
            </Text>
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
        </>
      }
    />
  );
}
