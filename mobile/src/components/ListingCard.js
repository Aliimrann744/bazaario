import React, { useEffect, useRef } from 'react';
import { Pressable, View, Text, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, shadows, typography, gradients } from '../theme/tokens';
import { timeAgo } from '../utils/format';
import PriceTag from './PriceTag';
import Badge from './Badge';

const BLUR = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

// ListingCard — variants: 'grid' (2-col vertical), 'row' (horizontal list), 'featured' (carousel).
// Keeps prop parity with the web client's ListingCard.
export default function ListingCard({
  listing,
  variant = 'grid',
  onPress,
  onToggleFavourite,
  isFavourite = false,
  index = 0,
  style,
}) {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 320,
      delay: Math.min(index, 8) * 45,
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  const animStyle = {
    opacity: enter,
    transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
  };

  if (variant === 'row') {
    return (
      <Animated.View style={[animStyle, style]}>
        <Pressable onPress={onPress} style={({ pressed }) => [styles.rowCard, pressed && styles.pressed]}>
          <View style={styles.rowThumbWrap}>
            <Image source={{ uri: listing.thumbnail }} style={styles.rowThumb} contentFit="cover" placeholder={BLUR} transition={200} />
            {listing.isFeatured ? (
              <View style={styles.rowFeatured}>
                <Badge label="Featured" tone="gold" icon="star" size="sm" />
              </View>
            ) : null}
          </View>
          <View style={styles.rowBody}>
            <PriceTag listing={listing} size="md" />
            <Text style={styles.title} numberOfLines={2}>
              {listing.title}
            </Text>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={13} color={colors.muted} />
              <Text style={styles.meta} numberOfLines={1}>
                {listing.city || 'Pakistan'}
              </Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.meta}>{timeAgo(listing.publishedAt)}</Text>
            </View>
            <View style={styles.tagRow}>
              {listing.condition ? <Badge label={cap(listing.condition)} tone="muted" size="sm" /> : null}
              {listing.categoryLabel ? (
                <Text style={styles.category} numberOfLines={1}>
                  {listing.categoryLabel}
                </Text>
              ) : null}
            </View>
          </View>
          {onToggleFavourite ? <HeartButton active={isFavourite} onPress={onToggleFavourite} corner /> : null}
        </Pressable>
      </Animated.View>
    );
  }

  const isFeatured = variant === 'featured';
  return (
    <Animated.View style={[animStyle, style]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          isFeatured ? styles.featuredCard : styles.gridCard,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.thumbWrap}>
          <Image
            source={{ uri: listing.thumbnail }}
            style={[styles.thumb, { height: isFeatured ? 168 : 130 }]}
            contentFit="cover"
            placeholder={BLUR}
            transition={200}
          />
          {isFeatured ? (
            <LinearGradient colors={gradients.scrim.colors} start={gradients.scrim.start} end={gradients.scrim.end} style={styles.scrim} />
          ) : null}
          {listing.isFeatured ? (
            <View style={styles.featuredRibbon}>
              <Badge label="Featured" tone="gold" icon="star" size="sm" />
            </View>
          ) : null}
          {onToggleFavourite ? <HeartButton active={isFavourite} onPress={onToggleFavourite} floating /> : null}
        </View>
        <View style={styles.body}>
          <PriceTag listing={listing} size="md" />
          <Text style={styles.title} numberOfLines={2}>
            {listing.title}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={12} color={colors.muted} />
            <Text style={styles.meta} numberOfLines={1}>
              {listing.city || 'Pakistan'}
            </Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.meta}>{timeAgo(listing.publishedAt)}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function HeartButton({ active, onPress, floating, corner }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={[styles.heart, floating && styles.heartFloating, corner && styles.heartCorner]}
    >
      <Ionicons name={active ? 'heart' : 'heart-outline'} size={18} color={active ? colors.danger : colors.ink} />
    </Pressable>
  );
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, overflow: 'hidden', ...shadows.card },
  gridCard: { flex: 1 },
  featuredCard: { width: 250 },
  pressed: { opacity: 0.95, transform: [{ scale: 0.99 }] },
  thumbWrap: { position: 'relative' },
  thumb: { width: '100%', backgroundColor: colors.lineSoft },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' },
  featuredRibbon: { position: 'absolute', top: spacing.sm, left: spacing.sm },
  body: { padding: spacing.md },
  title: { fontSize: typography.sizes.sm, color: colors.ink, fontWeight: typography.weight.semibold, marginTop: 4, lineHeight: 19 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  meta: { fontSize: typography.sizes.xs, color: colors.muted, marginLeft: 3, flexShrink: 1 },
  dot: { color: colors.mutedLight, marginHorizontal: 5, fontSize: typography.sizes.xs },
  // row variant
  rowCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.card, overflow: 'hidden', ...shadows.card, marginBottom: spacing.md },
  rowThumbWrap: { position: 'relative' },
  rowThumb: { width: 124, height: 124, backgroundColor: colors.lineSoft },
  rowFeatured: { position: 'absolute', top: spacing.sm, left: spacing.sm },
  rowBody: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  tagRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm },
  category: { fontSize: typography.sizes.xs, color: colors.mutedLight, flexShrink: 1 },
  heart: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.92)' },
  heartFloating: { position: 'absolute', top: spacing.sm, right: spacing.sm, ...shadows.soft },
  heartCorner: { position: 'absolute', top: spacing.sm, right: spacing.sm },
});
