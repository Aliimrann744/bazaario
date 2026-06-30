import React, { useEffect, useState } from 'react';
import { Modal, View, Text, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadows } from '../theme/tokens';
import Chip from './Chip';
import Button from './Button';

const SORTS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
];

// FilterSheet — schema-driven filters built entirely from the API `facets` object.
// facets shape: { <key>: { label, type, values: [{ value, label, count }] } }.
// No per-category hard-coding: each facet renders its own value chips.
export default function FilterSheet({ visible, facets = {}, value, onClose, onApply }) {
  const [draft, setDraft] = useState(value || { sort: 'relevance', minPrice: '', maxPrice: '', filters: {} });

  useEffect(() => {
    if (visible) setDraft(value || { sort: 'relevance', minPrice: '', maxPrice: '', filters: {} });
  }, [visible]);

  const facetEntries = Object.entries(facets).filter(([key]) => key !== 'priceBuckets' && key !== 'price');

  const setFacet = (key, v) => {
    setDraft((d) => {
      const next = { ...(d.filters || {}) };
      if (next[key] === v) delete next[key];
      else next[key] = v;
      return { ...d, filters: next };
    });
  };

  const activeCount =
    Object.keys(draft.filters || {}).length + (draft.minPrice ? 1 : 0) + (draft.maxPrice ? 1 : 0);

  const reset = () => setDraft({ sort: 'relevance', minPrice: '', maxPrice: '', filters: {} });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Filters</Text>
          <Pressable hitSlop={10} onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.muted} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Sort */}
          <Section title="Sort by">
            <View style={styles.chipWrap}>
              {SORTS.map((s) => (
                <Chip
                  key={s.value}
                  label={s.label}
                  active={draft.sort === s.value}
                  onPress={() => setDraft((d) => ({ ...d, sort: s.value }))}
                />
              ))}
            </View>
          </Section>

          {/* Price */}
          <Section title="Price range (Rs)">
            <View style={styles.priceRow}>
              <TextInput
                value={String(draft.minPrice || '')}
                onChangeText={(t) => setDraft((d) => ({ ...d, minPrice: t.replace(/[^0-9]/g, '') }))}
                placeholder="Min"
                placeholderTextColor={colors.mutedLight}
                keyboardType="number-pad"
                style={styles.priceInput}
              />
              <View style={styles.priceDash} />
              <TextInput
                value={String(draft.maxPrice || '')}
                onChangeText={(t) => setDraft((d) => ({ ...d, maxPrice: t.replace(/[^0-9]/g, '') }))}
                placeholder="Max"
                placeholderTextColor={colors.mutedLight}
                keyboardType="number-pad"
                style={styles.priceInput}
              />
            </View>
          </Section>

          {/* Dynamic facets */}
          {facetEntries.map(([key, facet]) => {
            const values = (facet.values || []).slice(0, 24);
            if (!values.length) return null;
            return (
              <Section key={key} title={facet.label || key}>
                <View style={styles.chipWrap}>
                  {values.map((opt) => (
                    <Chip
                      key={String(opt.value)}
                      label={`${opt.label}${opt.count != null ? ` (${opt.count})` : ''}`}
                      active={draft.filters?.[key] === String(opt.value)}
                      onPress={() => setFacet(key, String(opt.value))}
                    />
                  ))}
                </View>
              </Section>
            );
          })}
          <View style={{ height: spacing.xxxl }} />
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Reset" variant="subtle" size="md" onPress={reset} style={{ flex: 1 }} />
          <Button
            title={activeCount ? `Apply (${activeCount})` : 'Apply'}
            variant="primary"
            size="md"
            onPress={() => onApply(draft)}
            style={{ flex: 2 }}
          />
        </View>
      </View>
    </Modal>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
    maxHeight: '88%',
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line, marginBottom: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  title: { fontSize: typography.sizes.xl, fontWeight: typography.weight.extrabold, color: colors.ink },
  content: { paddingHorizontal: spacing.lg },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weight.bold, color: colors.muted, marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  priceInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 50,
    fontSize: typography.sizes.base,
    color: colors.ink,
  },
  priceDash: { width: 12, height: 1.5, backgroundColor: colors.line },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    ...shadows.card,
  },
});
