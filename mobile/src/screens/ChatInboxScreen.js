import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme/tokens';
import { chat } from '../api/endpoints';
import { formatPkr, timeAgo } from '../utils/format';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import { Skeleton } from '../components/Skeleton';
import { useAuth } from '../store/auth';

export default function ChatInboxScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const authed = useAuth((s) => s.status === 'authed');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!authed) {
      setLoading(false);
      return;
    }
    try {
      const res = await chat.conversations();
      setItems(res.items || []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authed]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  if (!authed) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header insets={insets} />
        <EmptyState
          icon="chatbubbles-outline"
          title="Sign in to view chats"
          message="Message sellers and buyers once you're signed in."
          actionLabel="Sign in"
          onAction={() => navigation.navigate('Login')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header insets={insets} />
      {loading ? (
        <View style={{ padding: spacing.lg }}>
          {[...Array(5)].map((_, i) => (
            <View key={i} style={styles.skeletonRow}>
              <Skeleton width={52} height={52} radius={26} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Skeleton width="60%" height={14} />
                <Skeleton width="80%" height={12} style={{ marginTop: 8 }} />
              </View>
            </View>
          ))}
        </View>
      ) : items.length === 0 ? (
        <EmptyState icon="chatbubble-ellipses-outline" title="No conversations yet" message="When you contact a seller, your chats will appear here." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
          contentContainerStyle={{ paddingVertical: spacing.sm }}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              onPress={() => navigation.navigate('ChatThread', { conversationId: item.id, conversation: item })}
            >
              <Avatar uri={item.otherUser?.avatarUrl} name={item.otherUser?.name} size={52} />
              <View style={styles.rowBody}>
                <View style={styles.rowTop}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.otherUser?.businessName || item.otherUser?.name || 'User'}
                  </Text>
                  <Text style={styles.time}>{timeAgo(item.lastMessageAt)}</Text>
                </View>
                <Text style={styles.listingTitle} numberOfLines={1}>
                  {item.listing?.title || 'Listing'}
                </Text>
                <View style={styles.rowBottom}>
                  <Text style={[styles.preview, item.unread && styles.previewUnread]} numberOfLines={1}>
                    {item.lastMessage?.body || 'Start the conversation'}
                  </Text>
                  {item.unread ? <View style={styles.unreadDot} /> : null}
                </View>
              </View>
              {item.listing?.thumbnail ? (
                <Image source={{ uri: item.listing.thumbnail }} style={styles.thumb} contentFit="cover" />
              ) : null}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.heading}>Chats</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.line },
  heading: { fontSize: typography.sizes.xxl, fontWeight: typography.weight.extrabold, color: colors.ink, letterSpacing: -0.5 },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  pressed: { backgroundColor: colors.lineSoft },
  rowBody: { flex: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: typography.sizes.base, fontWeight: typography.weight.bold, color: colors.ink, flex: 1 },
  time: { fontSize: typography.sizes.xs, color: colors.mutedLight, marginLeft: spacing.sm },
  listingTitle: { fontSize: typography.sizes.xs, color: colors.primary, marginTop: 2 },
  rowBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  preview: { flex: 1, fontSize: typography.sizes.sm, color: colors.muted },
  previewUnread: { color: colors.ink, fontWeight: typography.weight.semibold },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginLeft: spacing.sm },
  thumb: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.lineSoft },
});
