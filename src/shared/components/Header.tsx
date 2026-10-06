import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/shared/components/BrandMark';
import { colors, fontFamily, spacing } from '@/shared/theme';

type Props = { title: string };

export const Header = React.memo(function Header({ title }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        <View style={styles.brandSlot}>
          <BrandMark size={32} />
        </View>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* Mirrors the brand slot so the title stays centred. */}
      <View style={styles.side} />
    </View>
  );
});

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
