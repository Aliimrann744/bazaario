import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Share, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, shadows } from '../theme/tokens';
import { listings, chat, users } from '../api/endpoints';
import { formatPkr, timeAgo, humanize } from '../utils/format';
import Gallery from '../components/Gallery';
import Badge from '../components/Badge';
import PriceTag from '../components/PriceTag';
import SellerCard from '../components/SellerCard';
import ListingCard from '../components/ListingCard';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import ReportSheet from '../components/ReportSheet';
import { Skeleton } from '../components/Skeleton';
import { useFavourites } from '../store/favourites';
import { useAuth } from '../store/auth';

const SAFETY_TIPS = [
  'Meet the seller in a safe, public place.',
  'Inspect the item thoroughly before you pay.',
  'Never pay in advance or share OTP / bank details.',
];

export default function ListingDetailScreen({ route, navigation }) {
  const { publicId } = route.params || {};
  const insets = useSafeAreaInsets();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellerStats, setSellerStats] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [starting, setStarting] = useState(false);

  const favStore = useFavourites();
  const authed = useAuth((s) => s.status === 'authed');
  const me = useAuth((s) => s.user);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { listing: data } = await listings.get(publicId);
      setListing(data);
      if (data.seller) {
        users.profile(data.seller.publicId).then((r) => setSellerStats(r.stats)).catch(() => {});
      }
    } catch (e) {
      setError(e.message || 'Listing not found');
    } finally {
      setLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    load();
  }, [load]);

  const requireAuth = (action) => {
    if (!authed) {
      Alert.alert('Sign in required', 'Please sign in to continue.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign in', onPress: () => navigation.navigate('Login') },
      ]);
      return false;
    }
    action();
    return true;
  };

  const isFav = favStore.isFavourite(publicId) || listing?.isFavourited;
  const isOwner = me && listing?.seller && me.publicId === listing.seller.publicId;

  const toggleFav = () =>
    requireAuth(() => {
      if (listing) favStore.toggle({ ...listing, thumbnail: listing.media?.[0]?.url });
    });

  const startChat = () =>
    requireAuth(async () => {
      setStarting(true);
      try {
        const { conversation } = await chat.start(publicId);
        navigation.navigate('ChatThread', { conversationId: conversation.id, conversation });
      } catch (e) {
        Alert.alert('Could not start chat', e.message || 'Please try again.');
      } finally {
        setStarting(false);
      }
    });

  const onCall = () =>
    requireAuth(() => {
      Alert.alert(
        'Contact seller',
        'For your safety, phone numbers are shared inside chat. Start a conversation with the seller?',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Start chat', onPress: startChat },
        ]
      );
    });

  const onShare = async () => {
    try {
      await Share.share({ message: `${listing.title} — ${formatPkr(listing.priceMinor)} on Bazaario` });
    } catch (e) {
      /* noop */
    }
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <Skeleton width="100%" height={320} radius={0} />
        <View style={{ padding: spacing.lg }}>
          <Skeleton width="40%" height={28} />
          <Skeleton width="80%" height={18} style={{ marginTop: spacing.md }} />
          <Skeleton width="55%" height={14} style={{ marginTop: spacing.md }} />
        </View>
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} style={[styles.floatBack, { top: insets.top + 8 }]}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <EmptyState icon="alert-circle-outline" tone="danger" title="Listing unavailable" message={error} actionLabel="Go back" onAction={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Gallery
          media={listing.media}
          height={340}
          onBack={() => navigation.goBack()}
          onShare={onShare}
          onFavourite={toggleFav}
          isFavourite={isFav}
        />

        <View style={styles.body}>
          {/* Price + featured */}
          <View style={styles.priceRow}>
            <PriceTag listing={listing} size="lg" />
            {listing.isFeatured ? <Badge label="Featured" tone="gold" icon="star" /> : null}
          </View>

          <Text style={styles.title}>{listing.title}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={15} color={colors.muted} />
            <Text style={styles.meta}>{listing.location?.name || 'Pakistan'}</Text>
            <Text style={styles.dot}>·</Text>
            <Ionicons name="time-outline" size={15} color={colors.muted} />
            <Text style={styles.meta}>{timeAgo(listing.publishedAt)}</Text>
          </View>

          <View style={styles.statsRow}>
            <Stat icon="eye-outline" value={listing.viewCount} label="views" />
            <Stat icon="heart-outline" value={listing.favouriteCount} label="favourites" />
            {listing.condition ? <Badge label={humanize(listing.condition)} tone="muted" /> : null}
          </View>

          {/* Attributes */}
          {listing.attributesDisplay?.length ? (
            <Card title="Details">
              <View style={styles.attrGrid}>
                {listing.attributesDisplay.map((attr) => (
                  <View key={attr.key} style={styles.attrItem}>
                    <Text style={styles.attrLabel}>{attr.label}</Text>
                    <Text style={styles.attrValue}>{attr.value}</Text>
                  </View>
                ))}
              </View>
            </Card>
          ) : null}

          {/* Description */}
          {listing.description ? (
            <Card title="Description">
              <Text style={styles.description}>{listing.description}</Text>
            </Card>
          ) : null}

          {/* Seller */}
          <Text style={styles.sectionLabel}>Seller</Text>
          <SellerCard
            seller={listing.seller}
            stats={sellerStats}
            onPressProfile={() => navigation.navigate('SellerProfile', { publicId: listing.seller.publicId })}
          />

          {/* Safety tips */}
          <Card title="Stay safe on Bazaario" icon="shield-checkmark-outline">
            {SAFETY_TIPS.map((tip) => (
              <View key={tip} style={styles.tipRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </Card>

          {/* Report */}
          <Pressable style={styles.reportBtn} onPress={() => requireAuth(() => setReportOpen(true))}>
            <Ionicons name="flag-outline" size={16} color={colors.danger} />
            <Text style={styles.reportText}>Report this ad</Text>
          </Pressable>

          {/* Similar */}
          {listing.similar?.length ? (
            <>
              <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>Similar listings</Text>
              {listing.similar.slice(0, 6).map((item, i) => (
                <ListingCard
                  key={item.publicId}
                  listing={item}
                  variant="row"
                  index={i}
                  onPress={() => navigation.push('ListingDetail', { publicId: item.publicId })}
                />
              ))}
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky action bar */}
      {!isOwner ? (
        <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <Pressable style={styles.favBtn} onPress={toggleFav}>
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={24} color={isFav ? colors.danger : colors.ink} />
          </Pressable>
          <Button title="Call" variant="outline" icon="call-outline" onPress={onCall} style={{ flex: 1 }} />
          <Button title="Chat" variant="primary" icon="chatbubble-ellipses-outline" onPress={startChat} loading={starting} style={{ flex: 1.4 }} />
        </View>
      ) : (
        <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <Button title="Manage listing" variant="primary" icon="create-outline" onPress={() => navigation.navigate('MyListings')} full />
        </View>
      )}

      <ReportSheet visible={reportOpen} targetType="listing" targetId={listing.id} onClose={() => setReportOpen(false)} />
    </View>
  );
}

function Stat({ icon, value, label }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={15} color={colors.muted} />
      <Text style={styles.statText}>
        {value ?? 0} {label}
      </Text>
    </View>
  );
}

function Card({ title, icon, children }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {icon ? <Ionicons name={icon} size={18} color={colors.primary} /> : null}
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  floatBack: { position: 'absolute', left: spacing.lg, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.lg },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: typography.sizes.xl, fontWeight: typography.weight.bold, color: colors.ink, marginTop: spacing.sm, lineHeight: 28 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  meta: { fontSize: typography.sizes.sm, color: colors.muted },
  dot: { color: colors.mutedLight, marginHorizontal: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.md, flexWrap: 'wrap' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: typography.sizes.xs, color: colors.muted },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.lg, marginTop: spacing.lg, ...shadows.card },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  cardTitle: { fontSize: typography.sizes.md, fontWeight: typography.weight.bold, color: colors.ink },
  attrGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  attrItem: { width: '50%', marginBottom: spacing.md, paddingRight: spacing.sm },
  attrLabel: { fontSize: typography.sizes.xs, color: colors.muted, marginBottom: 2 },
  attrValue: { fontSize: typography.sizes.sm, color: colors.ink, fontWeight: typography.weight.semibold },
  description: { fontSize: typography.sizes.base, color: colors.ink, lineHeight: 23 },
  sectionLabel: { fontSize: typography.sizes.md, fontWeight: typography.weight.bold, color: colors.ink, marginTop: spacing.xl, marginBottom: spacing.md },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  tipText: { flex: 1, fontSize: typography.sizes.sm, color: colors.muted, lineHeight: 20 },
  reportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.lg, paddingVertical: spacing.md },
  reportText: { fontSize: typography.sizes.sm, color: colors.danger, fontWeight: typography.weight.semibold },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    ...shadows.card,
  },
  favBtn: { width: 52, height: 48, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
});
