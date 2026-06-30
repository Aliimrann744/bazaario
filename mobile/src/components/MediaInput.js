import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme/tokens';

// MediaInput — Release-1 handles media as image URLs (no native upload yet).
// Stores value as an array of { url, sortOrder }. Includes quick demo-image adds
// so the post-ad flow is usable without a CDN.
export default function MediaInput({ value, onChange, min = 1, max = 12 }) {
  const items = Array.isArray(value) ? value : [];
  const [url, setUrl] = useState('');

  const update = (next) => onChange(next.map((m, i) => ({ ...m, sortOrder: i })));

  const addUrl = (u) => {
    const clean = (u || '').trim();
    if (!clean || items.length >= max) return;
    update([...items, { url: clean }]);
    setUrl('');
  };

  const addSample = () => {
    const seed = `bazaario-${Date.now()}-${items.length}`;
    addUrl(`https://picsum.photos/seed/${seed}/1000/750`);
  };

  const removeAt = (i) => update(items.filter((_, idx) => idx !== i));

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((m, i) => (
          <View key={`${m.url}-${i}`} style={styles.thumbWrap}>
            <Image source={{ uri: m.url }} style={styles.thumb} contentFit="cover" transition={150} />
            {i === 0 ? (
              <View style={styles.coverTag}>
                <Text style={styles.coverText}>Cover</Text>
              </View>
            ) : null}
            <Pressable onPress={() => removeAt(i)} style={styles.remove} hitSlop={6}>
              <Ionicons name="close" size={13} color={colors.white} />
            </Pressable>
          </View>
        ))}
        {items.length < max ? (
          <Pressable onPress={addSample} style={styles.addTile}>
            <Ionicons name="image-outline" size={22} color={colors.primary} />
            <Text style={styles.addText}>Add photo</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <View style={styles.urlRow}>
        <TextInput
          value={url}
          onChangeText={setUrl}
          placeholder="Paste image URL (https://…)"
          placeholderTextColor={colors.mutedLight}
          style={styles.urlInput}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={() => addUrl(url)}
        />
        <Pressable onPress={() => addUrl(url)} style={styles.urlAdd}>
          <Ionicons name="add" size={20} color={colors.white} />
        </Pressable>
      </View>
      <Text style={styles.hint}>
        {items.length}/{max} photos · at least {min} required. First photo is the cover.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  thumbWrap: { width: 88, height: 88, borderRadius: radius.md, overflow: 'hidden', position: 'relative' },
  thumb: { width: '100%', height: '100%', backgroundColor: colors.lineSoft },
  coverTag: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(13,148,136,0.9)', paddingVertical: 2, alignItems: 'center' },
  coverText: { color: colors.white, fontSize: 10, fontWeight: typography.weight.bold },
  remove: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(15,23,42,0.7)', alignItems: 'center', justifyContent: 'center' },
  addTile: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  addText: { fontSize: typography.sizes.xs, color: colors.primaryDark, marginTop: 4, fontWeight: typography.weight.semibold },
  urlRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  urlInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  urlAdd: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  hint: { fontSize: typography.sizes.xs, color: colors.muted, marginTop: spacing.sm },
});
