import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { Field } from './LoginScreen';
import LocationPicker from '../components/LocationPicker';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius } from '../theme/tokens';
import { useAuth } from '../store/auth';

export default function EditProfileScreen({ navigation }) {
  const user = useAuth((s) => s.user);
  const updateProfile = useAuth((s) => s.updateProfile);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [cityId, setCityId] = useState(user?.cityId || null);
  const [cityLabel, setCityLabel] = useState(null);
  const [locOpen, setLocOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const patch = { name: name.trim(), bio: bio.trim() };
      if (avatarUrl.trim()) patch.avatarUrl = avatarUrl.trim();
      if (cityId) patch.cityId = cityId;
      await updateProfile(patch);
      Alert.alert('Saved', 'Your profile has been updated.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', e.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarRow}>
          <Avatar uri={avatarUrl || user?.avatarUrl} name={name} size={84} />
          <Text style={styles.avatarHint}>Paste an image URL below to change your photo</Text>
        </View>

        <Field label="Full name" icon="person-outline" value={name} onChangeText={setName} placeholder="Your name" />
        <Field label="Avatar URL" icon="image-outline" value={avatarUrl} onChangeText={setAvatarUrl} placeholder="https://…" autoCapitalize="none" />

        <View style={styles.field}>
          <Text style={styles.label}>City</Text>
          <Pressable style={styles.select} onPress={() => setLocOpen(true)}>
            <Ionicons name="location-outline" size={18} color={colors.muted} />
            <Text style={[styles.selectText, !cityLabel && !cityId && styles.placeholder]} numberOfLines={1}>
              {cityLabel || cityId || 'Choose your city'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedLight} />
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Bio</Text>
          <Field label="" value={bio} onChangeText={setBio} placeholder="Tell buyers a bit about you" multiline />
        </View>

        <Button title="Save changes" variant="primary" size="lg" onPress={save} loading={saving} full style={{ marginTop: spacing.md }} />
      </ScrollView>

      <LocationPicker
        visible={locOpen}
        onClose={() => setLocOpen(false)}
        onSelect={(loc) => {
          setCityId(loc.id);
          setCityLabel(loc.name);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  avatarRow: { alignItems: 'center', marginBottom: spacing.xl },
  avatarHint: { fontSize: typography.sizes.xs, color: colors.muted, marginTop: spacing.md, textAlign: 'center' },
  field: { marginBottom: spacing.lg },
  label: { fontSize: typography.sizes.sm, fontWeight: typography.weight.semibold, color: colors.ink, marginBottom: spacing.sm },
  select: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: spacing.lg, height: 52 },
  selectText: { flex: 1, fontSize: typography.sizes.base, color: colors.ink },
  placeholder: { color: colors.mutedLight },
});
