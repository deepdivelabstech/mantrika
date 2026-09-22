import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { colors, fontFamily, spacing, typeScale } from '@/shared/theme';

type Props = { title: string; description: string; value: boolean; onChange: (v: boolean) => void };

export function ToggleRow({ title, description, value, onChange }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={title}
        trackColor={{ false: colors.line, true: colors.saffron }}
        thumbColor={colors.white}
      />
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
});
