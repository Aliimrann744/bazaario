import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients, spacing, radius, typography, brand } from '../theme/tokens';
import Button from '../components/Button';
import { useAuth } from '../store/auth';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const login = useAuth((s) => s.login);
  const [emailOrPhone, setEmailOrPhone] = useState('ali@bazaario.pk');
  const [password, setPassword] = useState('Password123!');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setError(null);
    if (!emailOrPhone || !password) {
      setError('Enter your email/phone and password.');
      return;
    }
    setLoading(true);
    try {
      await login(emailOrPhone.trim(), password);
      navigation.goBack();
    } catch (e) {
      setError(e.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient
        colors={gradients.brand.colors}
        locations={gradients.brand.locations}
        start={gradients.brand.start}
        end={gradients.brand.end}
        style={[styles.hero, { paddingTop: insets.top + spacing.md }]}
      >
        <Pressable hitSlop={10} onPress={() => navigation.goBack()} style={styles.close}>
          <Ionicons name="close" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.brand}>{brand.name}</Text>
        <Text style={styles.heroTitle}>Welcome back</Text>
        <Text style={styles.heroSub}>Sign in to chat, post ads and save favourites.</Text>
      </LinearGradient>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
        <Field
          label="Email or phone"
          icon="mail-outline"
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Field
          label="Password"
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
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

        <Button title="Sign in" variant="primary" size="lg" onPress={submit} loading={loading} full style={{ marginTop: spacing.md }} />

        <View style={styles.demoBox}>
          <Ionicons name="information-circle-outline" size={15} color={colors.primary} />
          <Text style={styles.demoText}>Demo: ali@bazaario.pk · Password123!</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to Bazaario? </Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Create account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Field({ label, icon, rightIcon, onRightPress, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        {icon ? <Ionicons name={icon} size={18} color={colors.muted} /> : null}
        <TextInput style={styles.input} placeholderTextColor={colors.mutedLight} {...props} />
        {rightIcon ? (
          <Pressable hitSlop={8} onPress={onRightPress}>
            <Ionicons name={rightIcon} size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  close: { alignSelf: 'flex-end', width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: typography.sizes.lg, fontWeight: typography.weight.extrabold, color: 'rgba(255,255,255,0.9)', letterSpacing: -0.5 },
  heroTitle: { fontSize: typography.sizes.xxl, fontWeight: typography.weight.extrabold, color: colors.white, marginTop: spacing.sm, letterSpacing: -0.6 },
  heroSub: { fontSize: typography.sizes.sm, color: 'rgba(255,255,255,0.85)', marginTop: 6, lineHeight: 20 },
  sheet: { flex: 1, marginTop: -spacing.lg },
  sheetContent: { padding: spacing.lg, paddingTop: spacing.xl },
  field: { marginBottom: spacing.lg },
  label: { fontSize: typography.sizes.sm, fontWeight: typography.weight.semibold, color: colors.ink, marginBottom: spacing.sm },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 52,
  },
  input: { flex: 1, fontSize: typography.sizes.base, color: colors.ink },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.dangerSoft, padding: spacing.md, borderRadius: radius.md },
  errorText: { flex: 1, color: colors.danger, fontSize: typography.sizes.sm },
  demoBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.lg },
  demoText: { fontSize: typography.sizes.xs, color: colors.muted },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { color: colors.muted, fontSize: typography.sizes.base },
  link: { color: colors.primary, fontWeight: typography.weight.bold, fontSize: typography.sizes.base },
});
