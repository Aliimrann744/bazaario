import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, shadows, typography } from '../theme/tokens';

// Rounded search input. When `onPress` is provided and `editable` is false it
// behaves as a tappable bar (used on Home to navigate to the Search screen).
export default function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onPress,
  editable = true,
  placeholder = 'Search Bazaario…',
  autoFocus = false,
  onClear,
  elevated = true,
  style,
}) {
  const inner = (
    <View style={[styles.bar, elevated && shadows.soft, style]}>
      <Ionicons name="search" size={20} color={colors.muted} />
      {editable ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedLight}
          style={styles.input}
          returnKeyType="search"
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
        />
      ) : (
        <View style={styles.input}>
          <PlaceholderText placeholder={placeholder} value={value} />
        </View>
      )}
      {value ? (
        <Pressable hitSlop={10} onPress={onClear}>
          <Ionicons name="close-circle" size={18} color={colors.mutedLight} />
        </Pressable>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.9 }}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

function PlaceholderText({ placeholder, value }) {
  const { Text } = require('react-native');
  return (
    <Text numberOfLines={1} style={{ color: value ? colors.ink : colors.mutedLight, fontSize: typography.sizes.base }}>
      {value || placeholder}
    </Text>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    height: 50,
    borderWidth: 1,
    borderColor: colors.line,
  },
  input: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.ink,
    justifyContent: 'center',
    height: '100%',
  },
});
