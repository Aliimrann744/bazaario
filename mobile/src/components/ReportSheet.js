import React, { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme/tokens';
import Button from './Button';
import { reports } from '../api/endpoints';

const REASONS = ['Fraud or scam', 'Prohibited item', 'Wrong category', 'Duplicate listing', 'Offensive content', 'Other'];

// ReportSheet — files a report against a listing or user via POST /reports.
export default function ReportSheet({ visible, targetType = 'listing', targetId, onClose }) {
  const [reason, setReason] = useState(null);
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      await reports.create({ targetType, targetId, reason, detail: detail || undefined });
      onClose();
      setReason(null);
      setDetail('');
      Alert.alert('Report submitted', 'Thanks — our team will review this listing.');
    } catch (e) {
      Alert.alert('Could not submit', e.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Report listing</Text>
          <Pressable hitSlop={10} onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.muted} />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>Why are you reporting this?</Text>
        {REASONS.map((r) => (
          <Pressable key={r} style={styles.reason} onPress={() => setReason(r)}>
            <Ionicons name={reason === r ? 'radio-button-on' : 'radio-button-off'} size={20} color={reason === r ? colors.primary : colors.mutedLight} />
            <Text style={styles.reasonText}>{r}</Text>
          </Pressable>
        ))}
        <TextInput
          value={detail}
          onChangeText={setDetail}
          placeholder="Add details (optional)"
          placeholderTextColor={colors.mutedLight}
          style={styles.input}
          multiline
        />
        <Button title="Submit report" variant="danger" onPress={submit} loading={submitting} disabled={!reason} full style={{ marginTop: spacing.md }} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, paddingTop: spacing.sm },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line, marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: typography.sizes.lg, fontWeight: typography.weight.bold, color: colors.ink },
  subtitle: { fontSize: typography.sizes.sm, color: colors.muted, marginTop: spacing.sm, marginBottom: spacing.md },
  reason: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.lineSoft },
  reasonText: { fontSize: typography.sizes.base, color: colors.ink },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 80,
    marginTop: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.ink,
    textAlignVertical: 'top',
  },
});
