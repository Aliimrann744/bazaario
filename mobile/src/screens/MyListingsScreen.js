import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme/tokens';
import { listings } from '../api/endpoints';
import ListingCard from '../components/ListingCard';
import { ListingCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../store/auth';

const TABS = [
  { key: 'ACTIVE', label: 'Active' },
  { key: 'PENDING_REVIEW', label: 'Pending' },
  { key: 'SOLD', label: 'Sold' },
  { key: 'DEACTIVATED', label: 'Inactive' },
];

export default function MyListingsScreen({ navigation }) {
  const authed = useAuth((s) => s.status === 'authed');
  const [tab, setTab] = useState('ACTIVE');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (state) => {
      if (!authed) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await listings.mine(state);
        setItems(res.items || []);
      } catch (e) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [authed]
  );

  useFocusEffect(
    useCallback(() => {
      load(tab);
    }, [tab, load])
  );

  const doAction = async (item, action) => {
    try {
      if (action === 'mark-sold') await listings.markSold(item.publicId);
      else if (action === 'deactivate') await listings.deactivate(item.publicId);
      else if (action === 'renew') await listings.renew(item.publicId);
      load(tab);
    } catch (e) {
      Alert.alert('Action failed', e.message || 'Please try again.');
    }
  };

  const confirmAction = (item, action, label) =>
    Alert.alert(label, `Are you sure you want to ${label.toLowerCase()}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => doAction(item, action) },
    ]);

  if (!authed) {
    return (
      <View style={styles.screen}>
        <EmptyState icon="lock-closed-outline" title="Sign in required" message="Sign in to manage your ads." actionLabel="Sign in" onAction={() => navigation.navigate('Login')} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {TABS.map((t) => (
          <Pressable key={t.key} onPress={() => setTab(t.key)} style={[styles.tab, tab === t.key && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <View style={{ padding: spacing.lg }}>
          {[...Array(3)].map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          icon="file-tray-outline"
          title="Nothing here"
          message={`You have no ${TABS.find((t) => t.key === tab)?.label.toLowerCase()} listings.`}
          actionLabel="Post an ad"
          onAction={() => navigation.navigate('PostAd')}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.publicId}
          contentContainerStyle={{ padding: spacing.lg }}
          renderItem={({ item, index }) => (
            <View>
              <ListingCard
                listing={item}
                variant="row"
                index={index}
                onPress={() => navigation.navigate('ListingDetail', { publicId: item.publicId })}
              />
              <View style={styles.actions}>
                {tab === 'ACTIVE' ? (
                  <>
                    <ActionBtn icon="checkmark-done" label="Mark sold" onPress={() => confirmAction(item, 'mark-sold', 'Mark as sold')} />
                    <ActionBtn icon="pause" label="Deactivate" onPress={() => confirmAction(item, 'deactivate', 'Deactivate')} />
                  </>
                ) : null}
                {(tab === 'DEACTIVATED' || tab === 'SOLD') ? (
                  <ActionBtn icon="refresh" label="Renew" tone="primary" onPress={() => confirmAction(item, 'renew', 'Renew')} />
                ) : null}
                {tab === 'PENDING_REVIEW' ? (
                  <View style={styles.pendingNote}>
                    <Ionicons name="time-outline" size={14} color={colors.accent} />
                    <Text style={styles.pendingText}>Under review</Text>
                  </View>
                ) : null}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

function ActionBtn({ icon, label, onPress, tone = 'muted' }) {
  const active = tone === 'primary';
  return (
    <Pressable onPress={onPress} style={[styles.actionBtn, active && styles.actionBtnPrimary]}>
      <Ionicons name={icon} size={15} color={active ? colors.white : colors.ink} />
      <Text style={[styles.actionLabel, active && styles.actionLabelPrimary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  tabs: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  tab: { paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: typography.sizes.sm, color: colors.muted, fontWeight: typography.weight.semibold },
  tabTextActive: { color: colors.white },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: -spacing.sm, marginBottom: spacing.lg },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill },
  actionBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  actionLabel: { fontSize: typography.sizes.xs, color: colors.ink, fontWeight: typography.weight.semibold },
  actionLabelPrimary: { color: colors.white },
  pendingNote: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.accentSoft, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill },
  pendingText: { fontSize: typography.sizes.xs, color: colors.accentDark, fontWeight: typography.weight.semibold },
});
