import React, { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing } from '../theme/tokens';
import ListingCard from '../components/ListingCard';
import { ListingCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useFavourites } from '../store/favourites';
import { useAuth } from '../store/auth';

export default function FavouritesScreen({ navigation }) {
  const authed = useAuth((s) => s.status === 'authed');
  const favStore = useFavourites();
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      favStore.load().finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, [])
  );

  if (!authed) {
    return (
      <View style={styles.screen}>
        <EmptyState
          icon="heart-outline"
          title="Sign in to see favourites"
          message="Save listings you love and find them here."
          actionLabel="Sign in"
          onAction={() => navigation.navigate('Login')}
        />
      </View>
    );
  }

  const items = favStore.items;

  if (loading) {
    return (
      <View style={[styles.screen, styles.grid]}>
        {[...Array(4)].map((_, i) => (
          <View key={i} style={styles.gridItem}>
            <ListingCardSkeleton />
          </View>
        ))}
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={styles.screen}>
        <EmptyState
          icon="heart-dislike-outline"
          title="No favourites yet"
          message="Tap the heart on any listing to save it for later."
          actionLabel="Browse listings"
          onAction={() => navigation.navigate('Tabs', { screen: 'Home' })}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.publicId}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View style={styles.gridItem}>
            <ListingCard
              listing={item}
              variant="grid"
              index={index}
              onPress={() => navigation.navigate('ListingDetail', { publicId: item.publicId })}
              onToggleFavourite={() => favStore.toggle(item)}
              isFavourite
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.lg, gap: spacing.md },
  listContent: { padding: spacing.lg },
  column: { gap: spacing.md },
  gridItem: { flex: 1, marginBottom: spacing.md, maxWidth: '50%' },
});
