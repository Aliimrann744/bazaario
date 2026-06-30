import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme/tokens';

// Selectable pill chip used for sort, quick filters, and selection rows.
export default function Chip({ label, active = false, icon, onPress, onClose, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.active : styles.inactive,
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={14} color={active ? colors.white : colors.muted} style={styles.icon} />
      ) : null}
      <Text style={[styles.label, { color: active ? colors.white : colors.ink }]} numberOfLines={1}>
        {label}
      </Text>
      {onClose ? (
        <Pressable hitSlop={8} onPress={onClose} style={styles.close}>
          <Ionicons name="close" size={14} color={active ? colors.white : colors.muted} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  inactive: { backgroundColor: colors.surface, borderColor: colors.line },
  pressed: { opacity: 0.85 },
  label: { fontSize: typography.sizes.sm, fontWeight: typography.weight.semibold },
  icon: { marginRight: 6 },
  close: { marginLeft: 6 },
});
