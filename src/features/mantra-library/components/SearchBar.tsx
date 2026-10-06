import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { CloseIcon, SearchIcon } from '@/shared/components/icons';
import { colors } from '@/shared/theme';

type Props = {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  clearLabel: string;
};

export function SearchBar({ value, onChange, placeholder, accessibilityLabel, clearLabel }: Props) {
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
        returnKeyType="search"
        autoCorrect={false}
      />
      {value ? (
        <TouchableOpacity
          onPress={() => onChange('')}
          accessibilityRole="button"
          accessibilityLabel={clearLabel}
          style={styles.clear}
        >
          <CloseIcon color={colors.muted} size={18} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', justifyContent: 'center' },
  icon: { position: 'absolute', left: 14, zIndex: 1 },
  input: {
    height: 48,
    paddingLeft: 44,
    paddingRight: 44,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#DCCBB8',
    backgroundColor: colors.ground,
    fontSize: 14,
    color: colors.ink,
  },
  clear: {
    position: 'absolute',
    right: 2,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
