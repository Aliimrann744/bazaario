import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme/tokens';

// Section header with optional "See all" action. Used on Home and profile screens.
export default function SectionHeader({ title, subtitle, actionLabel, onAction, style }) {
  return (
    <View style={[styles.row, style]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={15} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  title: { fontSize: typography.sizes.lg, fontWeight: typography.weight.extrabold, color: colors.ink, letterSpacing: -0.3 },
  subtitle: { fontSize: typography.sizes.sm, color: colors.muted, marginTop: 2 },
  action: { flexDirection: 'row', alignItems: 'center' },
  actionText: { fontSize: typography.sizes.sm, color: colors.primary, fontWeight: typography.weight.bold },
});
