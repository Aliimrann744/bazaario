import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from '../theme/tokens';
import { search, taxonomy } from '../api/endpoints';
import SearchBar from '../components/SearchBar';
import CategoryGrid from '../components/CategoryGrid';
import SectionHeader from '../components/SectionHeader';

const POPULAR = ['Corolla', 'iPhone', 'House for rent', 'Honda 125', 'Laptop', 'PlayStation'];

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [suggest, setSuggest] = useState(null);
  const [categories, setCategories] = useState([]);
  const timer = useRef(null);

  useEffect(() => {
    taxonomy.categories().then((res) => setCategories(res.items || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!q.trim()) {
      setSuggest(null);
      return;
    }
    timer.current = setTimeout(() => {
      search.suggest(q.trim()).then(setSuggest).catch(() => setSuggest(null));
    }, 220);
  }, [q]);

  const runSearch = (term) => {
    const text = (term ?? q).trim();
    navigation.navigate('Results', { q: text || undefined, categoryLabel: text || 'All results' });
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.heading}>Search</Text>
        <SearchBar
          value={q}
          onChangeText={setQ}
          onSubmit={() => runSearch()}
          onClear={() => setQ('')}
          autoFocus={false}
          placeholder="What are you looking for?"
        />
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
        {suggest ? (
          <View style={styles.suggestBox}>
            {(suggest.queries || []).map((s) => (
              <SuggestRow key={`q-${s}`} icon="search" label={s} onPress={() => runSearch(s)} />
            ))}
            {(suggest.categories || []).map((c) => (
              <SuggestRow
                key={`c-${c.id}`}
                icon="pricetag-outline"
                label={c.label}
                tag="Category"
                onPress={() => navigation.navigate('Results', { categoryId: c.id, categoryLabel: c.label })}
              />
            ))}
            {(suggest.locations || []).map((l) => (
              <SuggestRow key={`l-${l.id}`} icon="location-outline" label={l.name} tag="Location" onPress={() => runSearch(l.name)} />
            ))}
            {!suggest.queries?.length && !suggest.categories?.length && !suggest.locations?.length ? (
              <Pressable style={styles.suggestRow} onPress={() => runSearch()}>
                <Ionicons name="search" size={18} color={colors.primary} />
                <Text style={styles.suggestLabel}>Search "{q}"</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <>
            <SectionHeader title="Popular searches" style={{ marginTop: spacing.lg }} />
            <View style={styles.popularWrap}>
              {POPULAR.map((p) => (
                <Pressable key={p} style={styles.popularChip} onPress={() => runSearch(p)}>
                  <Ionicons name="trending-up" size={14} color={colors.primary} />
                  <Text style={styles.popularText}>{p}</Text>
                </Pressable>
              ))}
            </View>

            <SectionHeader title="Browse categories" style={{ marginTop: spacing.xl }} />
            <View style={styles.browse}>
              <CategoryGrid
                categories={categories}
                layout="grid"
                columns={3}
                onSelect={(cat) => navigation.navigate('Results', { categoryId: cat.id, categoryLabel: cat.label })}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function SuggestRow({ icon, label, tag, onPress }) {
  return (
    <Pressable style={styles.suggestRow} onPress={onPress}>
      <Ionicons name={icon} size={18} color={colors.muted} />
      <Text style={styles.suggestLabel} numberOfLines={1}>
        {label}
      </Text>
      {tag ? <Text style={styles.suggestTag}>{tag}</Text> : <Ionicons name="arrow-forward" size={15} color={colors.mutedLight} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.line },
  heading: { fontSize: typography.sizes.xxl, fontWeight: typography.weight.extrabold, color: colors.ink, marginBottom: spacing.md, letterSpacing: -0.5 },
  suggestBox: { backgroundColor: colors.surface, marginTop: spacing.sm },
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineSoft,
  },
  suggestLabel: { flex: 1, fontSize: typography.sizes.base, color: colors.ink },
  suggestTag: { fontSize: typography.sizes.xs, color: colors.primary, fontWeight: typography.weight.semibold },
  popularWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg },
  popularChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  popularText: { fontSize: typography.sizes.sm, color: colors.ink, fontWeight: typography.weight.medium },
  browse: { paddingHorizontal: spacing.md },
});
