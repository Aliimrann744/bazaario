import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, brand } from '../theme/tokens';
import Button from '../components/Button';
import { Field } from './LoginScreen';
import { useAuth } from '../store/auth';

export default function RegisterScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const register = useAuth((s) => s.register);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const submit = async () => {
    setError(null);
    setFieldErrors({});
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, email: form.email.trim().toLowerCase(), name: form.name.trim() });
      // Dismiss the auth flow (Register + Login modal) back to the app.
      navigation.popToTop();
    } catch (e) {
      setError(e.message || 'Could not create account');
      if (e.fields) setFieldErrors(e.fields);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable hitSlop={10} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={colors.ink} />
        </Pressable>
        <Text style={styles.brand}>{brand.name}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.sub}>Join Pakistan's premium marketplace in seconds.</Text>

        <Field label="Full name" icon="person-outline" value={form.name} onChangeText={set('name')} placeholder="Ali Imran" />
        <Field
          label="Email"
          icon="mail-outline"
          value={form.email}
          onChangeText={set('email')}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}
        <Field
          label="Phone"
          icon="call-outline"
          value={form.phone}
          onChangeText={set('phone')}
          placeholder="+92 300 1234567"
          keyboardType="phone-pad"
        />
        <Field
          label="Password"
          icon="lock-closed-outline"
          value={form.password}
          onChangeText={set('password')}
          placeholder="At least 8 characters"
          secureTextEntry={!showPw}
          rightIcon={showPw ? 'eye-off-outline' : 'eye-outline'}
          onRightPress={() => setShowPw((v) => !v)}
        />

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Button title="Create account" variant="primary" size="lg" onPress={submit} loading={loading} full style={{ marginTop: spacing.md }} />

        <Text style={styles.terms}>By continuing you agree to Bazaario's Terms & Privacy Policy.</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.line },
  brand: { fontSize: typography.sizes.lg, fontWeight: typography.weight.extrabold, color: colors.primary, letterSpacing: -0.5 },
  content: { padding: spacing.lg },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weight.extrabold, color: colors.ink, letterSpacing: -0.6 },
  sub: { fontSize: typography.sizes.sm, color: colors.muted, marginTop: 6, marginBottom: spacing.xl },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.dangerSoft, padding: spacing.md, borderRadius: radius.md },
  errorText: { flex: 1, color: colors.danger, fontSize: typography.sizes.sm },
  fieldError: { color: colors.danger, fontSize: typography.sizes.xs, marginTop: -spacing.md, marginBottom: spacing.md },
  terms: { fontSize: typography.sizes.xs, color: colors.mutedLight, textAlign: 'center', marginTop: spacing.lg, lineHeight: 18 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { color: colors.muted, fontSize: typography.sizes.base },
  link: { color: colors.primary, fontWeight: typography.weight.bold, fontSize: typography.sizes.base },
});
