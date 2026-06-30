import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, typography, shadows } from '../theme/tokens';
import { search } from '../api/endpoints';
import ListingCard from '../components/ListingCard';
import { ListingCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import FilterSheet from '../components/FilterSheet';
import LocationPicker from '../components/LocationPicker';
import { useFavourites } from '../store/favourites';
import { useAuth } from '../store/auth';

const SORT_LABELS = {
  relevance: 'Relevance',
  newest: 'Newest',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
};

export default function ResultsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { categoryId, categoryLabel, q, featured } = route.params || {};

  const [items, setItems] = useState([]);
  const [facets, setFacets] = useState({});
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [layout, setLayout] = useState('grid'); // 'grid' | 'list'
  const [filterOpen, setFilterOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [location, setLocation] = useState(route.params?.locationId ? { id: route.params.locationId } : { id: null, name: 'All Pakistan' });
  const [filterState, setFilterState] = useState({ sort: 'relevance', minPrice: '', maxPrice: '', filters: {} });

  const favStore = useFavourites();
  const authed = useAuth((s) => s.status === 'authed');

  const buildParams = useCallback(
    (cursor) => {
      const params = { limit: 20 };
      if (categoryId) params.categoryId = categoryId;
      if (q) params.q = q;
      if (featured) params.featured = true;
      if (location.id) params.locationId = location.id;
      if (filterState.sort) params.sort = filterState.sort;
      if (filterState.minPrice) params.minPrice = filterState.minPrice;
      if (filterState.maxPrice) params.maxPrice = filterState.maxPrice;
      Object.entries(filterState.filters || {}).forEach(([k, v]) => {
        if (v) params[k] = v;
      });
      if (cursor) params.cursor = cursor;
      return params;
    },
    [categoryId, q, featured, location.id, filterState]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await search.query(buildParams());
      setItems(res.items || []);
      setFacets(res.facets || {});
      setTotal(res.total ?? (res.items || []).length);
      setNextCursor(res.nextCursor || null);
    } catch (e) {
      setError(e.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      if (authed) favStore.load();
    }, [authed])
  );

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await search.query(buildParams(nextCursor));
      setItems((prev) => [...prev, ...(res.items || [])]);
      setNextCursor(res.nextCursor || null);
    } catch (e) {
      // keep current list
    } finally {
      setLoadingMore(false);
    }
  };

  const activeFilterCount =
    Object.keys(filterState.filters || {}).length +
    (filterState.minPrice ? 1 : 0) +
    (filterState.maxPrice ? 1 : 0);

  const openListing = (item) => navigation.navigate('ListingDetail', { publicId: item.publicId });

  const renderItem = ({ item, index }) => (
    <View style={layout === 'grid' ? styles.gridItem : null}>
      <ListingCard
        listing={item}
        variant={layout === 'grid' ? 'grid' : 'row'}
        index={index}
        onPress={() => openListing(item)}
        onToggleFavourite={authed ? () => favStore.toggle(item) : undefined}
        isFavourite={favStore.isFavourite(item.publicId)}
      />
    </View>
  );

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <View style={styles.headerRow}>
          <Pressable hitSlop={8} onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.ink} />
          </Pressable>
          <Pressable style={styles.searchPill} onPress={() => navigation.navigate('Tabs', { screen: 'Search' })}>
            <Ionicons name="search" size={16} color={colors.muted} />
            <Text style={styles.searchPillText} numberOfLines={1}>
              {q || categoryLabel || 'All listings'}
            </Text>
          </Pressable>
          <Pressable hitSlop={8} onPress={() => setLayout((l) => (l === 'grid' ? 'list' : 'grid'))} style={styles.iconBtn}>
            <Ionicons name={layout === 'grid' ? 'list' : 'grid'} size={22} color={colors.ink} />
          </Pressable>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable style={styles.control} onPress={() => setFilterOpen(true)}>
            <Ionicons name="options-outline" size={16} color={colors.primary} />
            <Text style={styles.controlText}>Filters</Text>
            {activeFilterCount ? (
              <View style={styles.countDot}>
                <Text style={styles.countText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </Pressable>
          <Pressable style={styles.control} onPress={() => setFilterOpen(true)}>
            <Ionicons name="swap-vertical" size={16} color={colors.primary} />
            <Text style={styles.controlText} numberOfLines={1}>
              {SORT_LABELS[filterState.sort] || 'Sort'}
            </Text>
          </Pressable>
          <Pressable style={styles.control} onPress={() => setLocOpen(true)}>
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <Text style={styles.controlText} numberOfLines={1}>
              {location.name || 'Location'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Body */}
      {loading ? (
        <View style={styles.skeletonGrid}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={styles.gridItem}>
              <ListingCardSkeleton />
            </View>
          ))}
        </View>
      ) : error ? (
        <EmptyState icon="cloud-offline-outline" tone="danger" title="Something went wrong" message={error} actionLabel="Retry" onAction={load} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No results found"
          message="Try adjusting your filters or search terms."
          actionLabel={activeFilterCount ? 'Clear filters' : undefined}
          onAction={activeFilterCount ? () => setFilterState({ sort: 'relevance', minPrice: '', maxPrice: '', filters: {} }) : undefined}
        />
      ) : (
        <FlatList
          key={layout}
          data={items}
          keyExtractor={(item) => item.publicId}
          renderItem={renderItem}
          numColumns={layout === 'grid' ? 2 : 1}
          columnWrapperStyle={layout === 'grid' ? styles.column : undefined}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={<Text style={styles.resultCount}>{total} {total === 1 ? 'result' : 'results'}</Text>}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} /> : <View style={{ height: spacing.xl }} />
          }
        />
      )}

      <FilterSheet
        visible={filterOpen}
        facets={facets}
        value={filterState}
        onClose={() => setFilterOpen(false)}
        onApply={(draft) => {
          setFilterState(draft);
          setFilterOpen(false);
        }}
      />
      <LocationPicker
        visible={locOpen}
        allowAll
        onClose={() => setLocOpen(false)}
        onSelect={(loc) => setLocation({ id: loc.id, name: loc.name })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.line },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtn: { padding: 4 },
  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    height: 42,
  },
  searchPillText: { flex: 1, fontSize: typography.sizes.sm, color: colors.ink, fontWeight: typography.weight.medium },
  controls: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    flexShrink: 1,
  },
  controlText: { fontSize: typography.sizes.xs, color: colors.primaryDark, fontWeight: typography.weight.semibold, flexShrink: 1 },
  countDot: { backgroundColor: colors.primary, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  countText: { color: colors.white, fontSize: 9, fontWeight: typography.weight.bold },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  column: { gap: spacing.md },
  gridItem: { flex: 1, marginBottom: spacing.md, maxWidth: '50%' },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  resultCount: { fontSize: typography.sizes.sm, color: colors.muted, marginBottom: spacing.md, fontWeight: typography.weight.medium },
});
