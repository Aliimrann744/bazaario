import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Pressable, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, gradients, spacing, radius, typography } from '../theme/tokens';
import { taxonomy, search } from '../api/endpoints';
import { brand } from '../theme/tokens';
import SearchBar from '../components/SearchBar';
import CategoryGrid from '../components/CategoryGrid';
import SectionHeader from '../components/SectionHeader';
import ListingCard from '../components/ListingCard';
import { ListingCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import LocationPicker from '../components/LocationPicker';
import { useFavourites } from '../store/favourites';
import { useAuth } from '../store/auth';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [fresh, setFresh] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ id: null, name: 'All Pakistan' });
  const [pickerOpen, setPickerOpen] = useState(false);

  const favStore = useFavourites();
  const authed = useAuth((s) => s.status === 'authed');

  const load = useCallback(async () => {
    setError(null);
    try {
      const params = { limit: 20 };
      if (location.id) params.locationId = location.id;
      const [cats, feat, recent] = await Promise.all([
        taxonomy.categories(),
        search.query({ featured: true, limit: 10, ...(location.id ? { locationId: location.id } : {}) }),
        search.query({ sort: 'newest', ...params }),
      ]);
      setCategories(cats.items || []);
      setFeatured(feat.items || []);
      setFresh(recent.items || []);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [location.id]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      if (authed) favStore.load();
    }, [authed])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const openListing = (item) => navigation.navigate('ListingDetail', { publicId: item.publicId });
  const openCategory = (cat) =>
    navigation.navigate('Results', { categoryId: cat.id, categoryLabel: cat.label, locationId: location.id });

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={gradients.brand.colors}
        locations={gradients.brand.locations}
        start={gradients.brand.start}
        end={gradients.brand.end}
        style={[styles.header, { paddingTop: insets.top + spacing.sm }]}
      >
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.brand}>{brand.name}</Text>
            <Text style={styles.tagline}>{brand.tagline}</Text>
          </View>
          <Pressable style={styles.locationBtn} onPress={() => setPickerOpen(true)}>
            <Ionicons name="location" size={15} color={colors.white} />
            <Text style={styles.locationText} numberOfLines={1}>
              {location.name}
            </Text>
            <Ionicons name="chevron-down" size={14} color={colors.white} />
          </Pressable>
        </View>
        <SearchBar
          editable={false}
          placeholder="Search cars, phones, property…"
          onPress={() => navigation.navigate('Search')}
        />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Categories */}
        <View style={styles.categoriesCard}>
          {loading ? (
            <View style={styles.catSkeletonRow}>
              {[...Array(4)].map((_, i) => (
                <View key={i} style={styles.catSkeleton} />
              ))}
            </View>
          ) : (
            <CategoryGrid categories={categories} layout="grid" columns={4} onSelect={openCategory} />
          )}
        </View>

        {error ? (
          <EmptyState
            icon="cloud-offline-outline"
            tone="danger"
            title="Couldn't load Bazaario"
            message={error}
            actionLabel="Retry"
            onAction={load}
          />
        ) : (
          <>
            {/* Featured carousel */}
            <SectionHeader
              title="Featured"
              subtitle="Premium picks for you"
              actionLabel="See all"
              onAction={() => navigation.navigate('Results', { featured: true, categoryLabel: 'Featured' })}
              style={{ marginTop: spacing.lg }}
            />
            {loading ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
                {[...Array(3)].map((_, i) => (
                  <ListingCardSkeleton key={i} horizontal />
                ))}
              </ScrollView>
            ) : featured.length ? (
              <FlatList
                data={featured}
                keyExtractor={(item) => item.publicId}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
                renderItem={({ item, index }) => (
                  <ListingCard
                    listing={item}
                    variant="featured"
                    index={index}
                    onPress={() => openListing(item)}
                    onToggleFavourite={authed ? () => favStore.toggle(item) : undefined}
                    isFavourite={favStore.isFavourite(item.publicId)}
                    style={{ marginRight: spacing.md }}
                  />
                )}
              />
            ) : null}

            {/* Fresh listings */}
            <SectionHeader title="Fresh near you" subtitle="Newly posted ads" style={{ marginTop: spacing.xl }} />
            <View style={styles.freshList}>
              {loading ? (
                [...Array(4)].map((_, i) => <ListingCardSkeleton key={i} />)
              ) : fresh.length ? (
                fresh.map((item, index) => (
                  <ListingCard
                    key={item.publicId}
                    listing={item}
                    variant="row"
                    index={index}
                    onPress={() => openListing(item)}
                    onToggleFavourite={authed ? () => favStore.toggle(item) : undefined}
                    isFavourite={favStore.isFavourite(item.publicId)}
                  />
                ))
              ) : (
                <EmptyState title="No listings yet" message="Be the first to post an ad in your area." />
              )}
            </View>
          </>
        )}
      </ScrollView>

      <LocationPicker
        visible={pickerOpen}
        allowAll
        onClose={() => setPickerOpen(false)}
        onSelect={(loc) => setLocation({ id: loc.id, name: loc.name })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  brandRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.lg },
  brand: { fontSize: typography.sizes.xxl, fontWeight: typography.weight.extrabold, color: colors.white, letterSpacing: -0.8 },
  tagline: { fontSize: typography.sizes.xs, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    maxWidth: 150,
    marginTop: 4,
  },
  locationText: { color: colors.white, fontSize: typography.sizes.xs, fontWeight: typography.weight.semibold, flexShrink: 1 },
  categoriesCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.md,
    borderRadius: radius.card,
    padding: spacing.md,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  catSkeletonRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.md },
  catSkeleton: { width: 58, height: 58, borderRadius: radius.lg, backgroundColor: colors.lineSoft },
  carousel: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  freshList: { paddingHorizontal: spacing.lg },
});
