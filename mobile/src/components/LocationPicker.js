import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { locations as locationsApi } from '../api/endpoints';

// LocationPicker — searchable city picker backed by /locations and /locations/suggest.
// onSelect receives { id, name, path }.
export default function LocationPicker({ visible, onClose, onSelect, allowAll = false }) {
  const [q, setQ] = useState('');
  const [all, setAll] = useState([]);
  const [suggested, setSuggested] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    locationsApi
      .list()
      .then((res) => setAll((res.items || []).filter((l) => l.level === 'city')))
      .catch(() => setAll([]));
  }, [visible]);

  useEffect(() => {
    if (!q.trim()) {
      setSuggested(null);
      return undefined;
    }
    let active = true;
    setLoading(true);
    const t = setTimeout(() => {
      locationsApi
        .suggest(q.trim())
        .then((res) => active && setSuggested(res.items || []))
        .catch(() => active && setSuggested([]))
        .finally(() => active && setLoading(false));
    }, 220);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [q]);

  const data = useMemo(() => {
    if (suggested) return suggested.map((s) => ({ id: s.id, name: s.name, path: s.path }));
    return all.map((c) => ({ id: c.id, name: c.name, path: cityPath(c) }));
  }, [suggested, all]);

  const pick = (item) => {
    onSelect(item);
    setQ('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Choose location</Text>
          <Pressable hitSlop={10} onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.muted} />
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={colors.muted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search city or area…"
            placeholderTextColor={colors.mutedLight}
            style={styles.searchInput}
            autoCapitalize="words"
            autoFocus
          />
          {loading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
        </View>

        {allowAll && !q ? (
          <Pressable onPress={() => pick({ id: null, name: 'All Pakistan', path: 'Nationwide' })} style={styles.option}>
            <Ionicons name="earth-outline" size={18} color={colors.primary} />
            <Text style={[styles.optName, { color: colors.primaryDark }]}>All Pakistan</Text>
          </Pressable>
        ) : null}

        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          style={{ maxHeight: 420 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={styles.empty}>No locations found</Text>}
          renderItem={({ item }) => (
            <Pressable onPress={() => pick(item)} style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
              <Ionicons name="location-outline" size={18} color={colors.muted} />
              <View style={{ flex: 1 }}>
                <Text style={styles.optName}>{item.name}</Text>
                {item.path ? <Text style={styles.optPath}>{item.path}</Text> : null}
              </View>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

function cityPath(city) {
  // ids look like "pk.punjab.lahore"; turn the province segment into a label.
  const parts = String(city.parentId || '').split('.');
  const prov = parts[parts.length - 1];
  return prov ? prov.charAt(0).toUpperCase() + prov.slice(1) : '';
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.sm,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line, marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  title: { fontSize: typography.sizes.lg, fontWeight: typography.weight.bold, color: colors.ink },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: typography.sizes.base, color: colors.ink },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineSoft,
  },
  pressed: { opacity: 0.6 },
  optName: { fontSize: typography.sizes.base, color: colors.ink, fontWeight: typography.weight.medium },
  optPath: { fontSize: typography.sizes.xs, color: colors.muted, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.muted, paddingVertical: spacing.xl },
});
