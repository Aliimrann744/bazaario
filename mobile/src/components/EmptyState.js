import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme/tokens';
import Button from './Button';

// Friendly empty / error placeholder used across lists and screens.
export default function EmptyState({
  icon = 'sad-outline',
  title = 'Nothing here yet',
  message,
  actionLabel,
  onAction,
  tone = 'muted',
  style,
}) {
  const accent = tone === 'danger' ? colors.danger : colors.primary;
  const bg = tone === 'danger' ? colors.dangerSoft : colors.primarySoft;
  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.iconCircle, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={34} color={accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} variant="outline" size="sm" style={{ marginTop: spacing.lg }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { fontSize: typography.sizes.lg, fontWeight: typography.weight.bold, color: colors.ink, textAlign: 'center' },
  message: {
    fontSize: typography.sizes.base,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 21,
    maxWidth: 300,
  },
});
