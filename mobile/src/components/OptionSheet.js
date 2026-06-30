import React, { useMemo, useState } from 'react';
import { Modal, View, Text, Pressable, FlatList, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme/tokens';

// Bottom-sheet style option picker for single/multi selects.
// options: [{value,label}]; value: scalar (single) or array (multi).
export default function OptionSheet({
  visible,
  title,
  options = [],
  value,
  multi = false,
  searchable = true,
  loading = false,
  onClose,
  onChange,
}) {
  const [q, setQ] = useState('');
  const selected = multi ? (Array.isArray(value) ? value : []) : value;

  const filtered = useMemo(() => {
    if (!q.trim()) return options;
    const needle = q.toLowerCase();
    return options.filter((o) => String(o.label).toLowerCase().includes(needle));
  }, [q, options]);

  const isSelected = (v) => (multi ? selected.includes(v) : selected === v);

  const toggle = (v) => {
    if (multi) {
      const next = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v];
      onChange(next);
    } else {
      onChange(v);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable hitSlop={10} onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.muted} />
          </Pressable>
        </View>

        {searchable ? (
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color={colors.muted} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search…"
              placeholderTextColor={colors.mutedLight}
              style={styles.searchInput}
              autoCapitalize="none"
            />
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(o) => String(o.value)}
            style={{ maxHeight: 380 }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<Text style={styles.empty}>No options</Text>}
            renderItem={({ item }) => {
              const on = isSelected(item.value);
              return (
                <Pressable onPress={() => toggle(item.value)} style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
                  <Text style={[styles.optionLabel, on && styles.optionLabelOn]}>{item.label}</Text>
                  {on ? (
                    <Ionicons name={multi ? 'checkbox' : 'checkmark-circle'} size={20} color={colors.primary} />
                  ) : multi ? (
                    <Ionicons name="square-outline" size={20} color={colors.mutedLight} />
                  ) : null}
                </Pressable>
              );
            }}
          />
        )}

        {multi ? (
          <Pressable onPress={onClose} style={styles.doneBtn}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        ) : null}
      </View>
    </Modal>
  );
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
    height: 44,
    marginBottom: spacing.sm,
  },
  searchInput: { flex: 1, marginLeft: spacing.sm, fontSize: typography.sizes.base, color: colors.ink },
  loading: { paddingVertical: spacing.xxl },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineSoft,
  },
  pressed: { opacity: 0.6 },
  optionLabel: { fontSize: typography.sizes.base, color: colors.ink, flex: 1 },
  optionLabelOn: { fontWeight: typography.weight.bold, color: colors.primaryDark },
  empty: { textAlign: 'center', color: colors.muted, paddingVertical: spacing.xl },
  doneBtn: { marginTop: spacing.md, backgroundColor: colors.primary, borderRadius: radius.pill, height: 48, alignItems: 'center', justifyContent: 'center' },
  doneText: { color: colors.white, fontWeight: typography.weight.bold, fontSize: typography.sizes.md },
});
