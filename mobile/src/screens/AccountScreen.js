import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients, spacing, radius, typography, shadows, brand } from '../theme/tokens';
import { monthYear, trustBadge } from '../utils/format';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { useAuth } from '../store/auth';
import { useFavourites } from '../store/favourites';

export default function AccountScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const authed = useAuth((s) => s.status === 'authed');
  const logout = useAuth((s) => s.logout);
  const resetFav = useFavourites((s) => s.reset);

  const onLogout = () =>
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          resetFav();
        },
      },
    ]);

  if (!authed) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={gradients.brand.colors}
          locations={gradients.brand.locations}
          start={gradients.brand.start}
          end={gradients.brand.end}
          style={styles.guestHero}
        >
          <Ionicons name="person-circle-outline" size={64} color={colors.white} />
          <Text style={styles.guestTitle}>Welcome to {brand.name}</Text>
          <Text style={styles.guestSub}>Sign in to post ads, chat and save favourites.</Text>
          <Button title="Sign in / Register" variant="accent" size="lg" onPress={() => navigation.navigate('Login')} style={{ marginTop: spacing.lg, minWidth: 220 }} />
        </LinearGradient>
        <View style={styles.menuCard}>
          <MenuItem icon="information-circle-outline" label="About Bazaario" onPress={() => {}} />
          <MenuItem icon="shield-checkmark-outline" label="Safety tips" onPress={() => {}} last />
        </View>
      </View>
    );
  }

  const trust = trustBadge(user.trustTier);

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
        <LinearGradient
          colors={gradients.brand.colors}
          locations={gradients.brand.locations}
          start={gradients.brand.start}
          end={gradients.brand.end}
          style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}
        >
          <View style={styles.heroRow}>
            <Avatar uri={user.avatarUrl} name={user.name} size={64} ring />
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{user.businessName || user.name}</Text>
              <Text style={styles.heroMeta}>Member since {monthYear(user.memberSince)}</Text>
              <View style={styles.heroBadges}>
                <Badge label={trust.label} tone="gold" icon={trust.icon} size="sm" />
              </View>
            </View>
          </View>
          <Pressable style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="create-outline" size={16} color={colors.white} />
            <Text style={styles.editText}>Edit profile</Text>
          </Pressable>
        </LinearGradient>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <QuickAction icon="megaphone-outline" label="Post ad" onPress={() => navigation.navigate('PostAd')} />
          <QuickAction icon="albums-outline" label="My ads" onPress={() => navigation.navigate('MyListings')} />
          <QuickAction icon="heart-outline" label="Favourites" onPress={() => navigation.navigate('Favourites')} />
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          <MenuItem icon="albums-outline" label="My listings" onPress={() => navigation.navigate('MyListings')} />
          <MenuItem icon="heart-outline" label="Favourites" onPress={() => navigation.navigate('Favourites')} />
          <MenuItem icon="chatbubble-ellipses-outline" label="My chats" onPress={() => navigation.navigate('Tabs', { screen: 'Chat' })} />
          <MenuItem icon="person-outline" label="Public profile" onPress={() => navigation.navigate('SellerProfile', { publicId: user.publicId })} last />
        </View>

        <View style={styles.menuCard}>
          <MenuItem icon="settings-outline" label="Settings" onPress={() => {}} />
          <MenuItem icon="shield-checkmark-outline" label="Safety tips" onPress={() => {}} />
          <MenuItem icon="help-circle-outline" label="Help & support" onPress={() => {}} last />
        </View>

        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
          <Button title="Log out" variant="subtle" icon="log-out-outline" onPress={onLogout} full />
        </View>
        <Text style={styles.version}>{brand.name} · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function QuickAction({ icon, label, onPress }) {
  return (
    <Pressable style={({ pressed }) => [styles.quick, pressed && { opacity: 0.8 }]} onPress={onPress}>
      <View style={styles.quickIcon}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function MenuItem({ icon, label, onPress, last }) {
  return (
    <Pressable style={({ pressed }) => [styles.menuItem, !last && styles.menuItemBorder, pressed && { backgroundColor: colors.lineSoft }]} onPress={onPress}>
      <Ionicons name={icon} size={20} color={colors.ink} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.mutedLight} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroInfo: { flex: 1 },
  heroName: { fontSize: typography.sizes.xl, fontWeight: typography.weight.extrabold, color: colors.white, letterSpacing: -0.4 },
  heroMeta: { fontSize: typography.sizes.xs, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  heroBadges: { flexDirection: 'row', marginTop: 8 },
  editBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, marginTop: spacing.lg },
  editText: { color: colors.white, fontSize: typography.sizes.sm, fontWeight: typography.weight.semibold },
  quickRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: -spacing.lg },
  quick: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.card, paddingVertical: spacing.lg, alignItems: 'center', ...shadows.card },
  quickIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  quickLabel: { fontSize: typography.sizes.xs, color: colors.ink, fontWeight: typography.weight.semibold },
  guestHero: { alignItems: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.lg, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  guestTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weight.extrabold, color: colors.white, marginTop: spacing.md },
  guestSub: { fontSize: typography.sizes.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 6 },
  menuCard: { backgroundColor: colors.surface, borderRadius: radius.card, marginHorizontal: spacing.lg, marginTop: spacing.lg, overflow: 'hidden', ...shadows.soft },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  menuItemBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  menuLabel: { flex: 1, fontSize: typography.sizes.base, color: colors.ink, fontWeight: typography.weight.medium },
  version: { textAlign: 'center', color: colors.mutedLight, fontSize: typography.sizes.xs, marginTop: spacing.xl },
});
