import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, shadows, typography } from '../theme/tokens';
import { monthYear, trustBadge } from '../utils/format';
import Avatar from './Avatar';
import Badge from './Badge';

// SellerCard — seller summary used on the listing detail screen.
export default function SellerCard({ seller, stats, onPressProfile, style }) {
  if (!seller) return null;
  const trust = trustBadge(seller.trustTier);
  const name = seller.businessName || seller.name;

  return (
    <Pressable onPress={onPressProfile} style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
      <Avatar uri={seller.avatarUrl} name={name} size={52} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {seller.isBusiness ? <Ionicons name="business" size={14} color={colors.primary} /> : null}
        </View>
        <View style={styles.badges}>
          <Badge label={trust.label} tone={trust.tone} icon={trust.icon} size="sm" />
          {seller.isPhoneVerified ? <Badge label="Phone verified" tone="muted" icon="call" size="sm" /> : null}
        </View>
        <Text style={styles.meta}>
          Member since {monthYear(seller.memberSince)}
          {stats?.activeListings != null ? ` · ${stats.activeListings} active ads` : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.mutedLight} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    ...shadows.card,
  },
  pressed: { opacity: 0.95 },
  info: { flex: 1, marginLeft: spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: typography.sizes.md, fontWeight: typography.weight.bold, color: colors.ink, flexShrink: 1 },
  badges: { flexDirection: 'row', gap: spacing.sm, marginTop: 6, flexWrap: 'wrap' },
  meta: { fontSize: typography.sizes.xs, color: colors.muted, marginTop: 6 },
});
