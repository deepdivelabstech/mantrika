import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { BrandMark } from '@/shared/components/BrandMark';
import { BackIcon, SettingsIcon } from '@/shared/components/icons';
import { IconButton } from '@/shared/components/IconButton';
import { colors, fontFamily, spacing } from '@/shared/theme';

type Props = {
  title: string;
  showSettings?: boolean;
  showBack?: boolean;
};

export function Header({ title, showSettings, showBack }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {showBack ? (
          <IconButton
            accessibilityLabel={t('settings.backAria')}
            onPress={() => navigation.goBack()}
          >
            <BackIcon color={colors.maroon} />
          </IconButton>
        ) : (
          <View style={styles.brandSlot}>
            <BrandMark size={32} />
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.side}>
        {showSettings && (
          <IconButton
            accessibilityLabel={t('counter.settingsAria')}
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <SettingsIcon color={colors.maroon} />
          </IconButton>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  side: { width: 44, alignItems: 'center', justifyContent: 'center' },
  brandSlot: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.serif500,
    fontSize: 22,
    color: colors.ink,
  },
});
