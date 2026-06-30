import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, shadows } from '../theme/tokens';
import { chat } from '../api/endpoints';
import { formatPkr, timeAgo } from '../utils/format';
import Avatar from '../components/Avatar';
import { useAuth } from '../store/auth';

export default function ChatThreadScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { conversationId, conversation } = route.params || {};
  const me = useAuth((s) => s.user);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const other = conversation?.otherUser;
  const listing = conversation?.listing;

  const load = useCallback(async () => {
    try {
      const res = await chat.messages(conversationId);
      setMessages(res.items || []);
      chat.markRead(conversationId).catch(() => {});
    } catch (e) {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    load();
  }, [load]);

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText('');
    // optimistic
    const temp = { id: `tmp-${Date.now()}`, senderId: me?.id, body, createdAt: new Date().toISOString(), pending: true };
    setMessages((m) => [...m, temp]);
    try {
      const { message } = await chat.send(conversationId, body);
      setMessages((m) => m.map((x) => (x.id === temp.id ? message : x)));
    } catch (e) {
      setMessages((m) => m.filter((x) => x.id !== temp.id));
      setText(body);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <Pressable hitSlop={8} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={colors.ink} />
        </Pressable>
        <Avatar uri={other?.avatarUrl} name={other?.name} size={38} />
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={styles.headerName} numberOfLines={1}>
            {other?.businessName || other?.name || 'User'}
          </Text>
          {other?.trustTier === 'VERIFIED' ? <Text style={styles.headerSub}>Verified seller</Text> : null}
        </View>
      </View>

      {/* Listing context */}
      {listing ? (
        <Pressable style={styles.listingBar} onPress={() => navigation.navigate('ListingDetail', { publicId: listing.publicId })}>
          {listing.thumbnail ? <Image source={{ uri: listing.thumbnail }} style={styles.listingThumb} contentFit="cover" /> : null}
          <View style={{ flex: 1 }}>
            <Text style={styles.listingTitle} numberOfLines={1}>
              {listing.title}
            </Text>
            {listing.priceMinor != null ? <Text style={styles.listingPrice}>{formatPkr(listing.priceMinor)}</Text> : null}
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedLight} />
        </Pressable>
      ) : null}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.mutedLight} />
              <Text style={styles.emptyText}>Say hello and ask about the item.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const mine = item.senderId === me?.id;
          if (item.type === 'system') {
            return <Text style={styles.systemMsg}>{item.body}</Text>;
          }
          return (
            <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowOther]}>
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.body}</Text>
                <Text style={[styles.bubbleTime, mine && styles.bubbleTimeMine]}>
                  {item.pending ? 'Sending…' : timeAgo(item.createdAt)}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Composer */}
      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message…"
          placeholderTextColor={colors.mutedLight}
          style={styles.input}
          multiline
        />
        <Pressable onPress={send} disabled={!text.trim()} style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}>
          <Ionicons name="send" size={18} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.line },
  headerName: { fontSize: typography.sizes.base, fontWeight: typography.weight.bold, color: colors.ink },
  headerSub: { fontSize: typography.sizes.xs, color: colors.success },
  listingBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.sm, paddingHorizontal: spacing.lg, backgroundColor: colors.primarySoft },
  listingThumb: { width: 40, height: 40, borderRadius: radius.sm },
  listingTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weight.semibold, color: colors.ink },
  listingPrice: { fontSize: typography.sizes.xs, color: colors.primaryDark, fontWeight: typography.weight.bold },
  messages: { padding: spacing.lg, flexGrow: 1 },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingTop: spacing.xxxl },
  emptyText: { color: colors.muted, fontSize: typography.sizes.sm },
  systemMsg: { alignSelf: 'center', fontSize: typography.sizes.xs, color: colors.muted, backgroundColor: colors.lineSoft, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill, marginVertical: spacing.sm },
  bubbleRow: { marginBottom: spacing.sm, maxWidth: '80%' },
  bubbleRowMine: { alignSelf: 'flex-end' },
  bubbleRowOther: { alignSelf: 'flex-start' },
  bubble: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.lg },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: colors.surface, borderBottomLeftRadius: 4, ...shadows.soft },
  bubbleText: { fontSize: typography.sizes.base, color: colors.ink, lineHeight: 21 },
  bubbleTextMine: { color: colors.white },
  bubbleTime: { fontSize: 10, color: colors.mutedLight, marginTop: 3, alignSelf: 'flex-end' },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.75)' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line },
  input: { flex: 1, maxHeight: 110, backgroundColor: colors.bg, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: typography.sizes.base, color: colors.ink },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: colors.mutedLight },
});
