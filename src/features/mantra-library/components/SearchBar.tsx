import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { SearchIcon } from '@/shared/components/icons';
import { colors } from '@/shared/theme';

type Props = {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  accessibilityLabel: string;
};

export function SearchBar({ value, onChange, placeholder, accessibilityLabel }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <SearchIcon color={colors.muted} />
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        accessibilityLabel={accessibilityLabel}
        style={styles.input}
        placeholderTextColor={colors.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', justifyContent: 'center' },
  icon: { position: 'absolute', left: 14, zIndex: 1 },
  input: {
    height: 48,
    paddingLeft: 44,
    paddingRight: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCCBB8',
    backgroundColor: colors.ground,
    fontSize: 14,
    color: colors.ink,
  },
});
