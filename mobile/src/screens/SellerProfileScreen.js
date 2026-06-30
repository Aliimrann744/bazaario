import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../theme/tokens';
import { users } from '../api/endpoints';
import { monthYear, trustBadge } from '../utils/format';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import ListingCard from '../components/ListingCard';
import { ListingCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useFavourites } from '../store/favourites';
import { useAuth } from '../store/auth';

export default function SellerProfileScreen({ route, navigation }) {
  const { publicId } = route.params || {};
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const favStore = useFavourites();
  const authed = useAuth((s) => s.status === 'authed');

  useEffect(() => {
    let active = true;
    Promise.all([users.profile(publicId), users.listings(publicId)])
      .then(([p, l]) => {
        if (!active) return;
        setProfile(p.user);
        setStats(p.stats);
        setItems(l.items || []);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [publicId]);

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <ListingCardSkeleton />
        </View>
      </View>
    );
  }

  if (!profile) {
    return <EmptyState icon="person-outline" title="Profile unavailable" message="This seller could not be found." />;
  }

  const trust = trustBadge(profile.trustTier);
  const name = profile.businessName || profile.name;

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.publicId}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.profileCard}>
              <Avatar uri={profile.avatarUrl} name={name} size={72} />
              <Text style={styles.name}>{name}</Text>
              {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
              <View style={styles.badges}>
                <Badge label={trust.label} tone={trust.tone} icon={trust.icon} />
                {profile.isBusiness ? <Badge label="Business" tone="primary" icon="business" /> : null}
                {profile.isPhoneVerified ? <Badge label="Phone verified" tone="muted" icon="call" /> : null}
              </View>
              <View style={styles.statRow}>
                <Stat value={stats?.activeListings ?? items.length} label="Active ads" />
                <View style={styles.statDivider} />
                <Stat value={monthYear(profile.memberSince)} label="Member since" small />
              </View>
            </View>
            <Text style={styles.sectionTitle}>Listings ({items.length})</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.gridItem}>
            <ListingCard
              listing={item}
              variant="grid"
              index={index}
              onPress={() => navigation.push('ListingDetail', { publicId: item.publicId })}
              onToggleFavourite={authed ? () => favStore.toggle(item) : undefined}
              isFavourite={favStore.isFavourite(item.publicId)}
            />
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="cube-outline" title="No active listings" message="This seller has no active ads right now." />}
      />
    </View>
  );
}

function Stat({ value, label, small }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, small && styles.statValueSmall]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.lg },
  listContent: { padding: spacing.lg },
  column: { gap: spacing.md },
  gridItem: { flex: 1, marginBottom: spacing.md, maxWidth: '50%' },
  profileCard: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.xl, ...shadows.card },
  name: { fontSize: typography.sizes.xl, fontWeight: typography.weight.extrabold, color: colors.ink, marginTop: spacing.md },
  bio: { fontSize: typography.sizes.sm, color: colors.muted, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md },
  statRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, gap: spacing.lg },
  statDivider: { width: 1, height: 32, backgroundColor: colors.line },
  stat: { alignItems: 'center' },
  statValue: { fontSize: typography.sizes.lg, fontWeight: typography.weight.bold, color: colors.primary },
  statValueSmall: { fontSize: typography.sizes.sm, color: colors.ink },
  statLabel: { fontSize: typography.sizes.xs, color: colors.muted, marginTop: 2 },
  sectionTitle: { fontSize: typography.sizes.md, fontWeight: typography.weight.bold, color: colors.ink, marginTop: spacing.xl, marginBottom: spacing.md },
});
