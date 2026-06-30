import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, shadows, typography } from '../theme/tokens';
import { categoryIcon, tintForIndex } from '../utils/icons';

// CategoryGrid — top-level category tiles. layout: 'grid' (wrap) | 'scroll' (horizontal chips).
export default function CategoryGrid({ categories = [], onSelect, layout = 'grid', columns = 4 }) {
  if (layout === 'scroll') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}
      >
        {categories.map((cat, i) => (
          <Pressable
            key={cat.id}
            onPress={() => onSelect?.(cat)}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
          >
            <View style={[styles.chipIcon, { backgroundColor: tintForIndex(i) }]}>
              <Ionicons name={categoryIcon(cat.icon)} size={20} color={colors.ink} />
            </View>
            <Text style={styles.chipLabel} numberOfLines={1}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.grid}>
      {categories.map((cat, i) => (
        <Pressable
          key={cat.id}
          onPress={() => onSelect?.(cat)}
          style={({ pressed }) => [styles.tile, { width: `${100 / columns}%` }, pressed && styles.pressed]}
        >
          <View style={[styles.tileIcon, { backgroundColor: tintForIndex(i) }]}>
            <Ionicons name={categoryIcon(cat.icon)} size={24} color={colors.ink} />
          </View>
          <Text style={styles.tileLabel} numberOfLines={2}>
            {cat.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  tile: { alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.xs },
  tileIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.soft,
  },
  tileLabel: { fontSize: typography.sizes.xs, color: colors.ink, textAlign: 'center', fontWeight: typography.weight.medium },
  scrollRow: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  chip: { alignItems: 'center', width: 72 },
  chipIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    ...shadows.soft,
  },
  chipLabel: { fontSize: typography.sizes.xs, color: colors.ink, textAlign: 'center', fontWeight: typography.weight.medium },
  pressed: { opacity: 0.7 },
});
