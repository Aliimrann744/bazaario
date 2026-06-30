import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, radius, spacing, typography } from '../theme/tokens';

// Small pill badge. tone: 'primary' | 'accent' | 'success' | 'muted' | 'danger' | 'gold'.
// 'gold' uses the gradient for the Featured ribbon look.
export default function Badge({ label, tone = 'primary', icon, size = 'md', style }) {
  const pad = size === 'sm' ? { paddingVertical: 2, paddingHorizontal: 8 } : { paddingVertical: 4, paddingHorizontal: 10 };
  const fontSize = size === 'sm' ? typography.sizes.xs : typography.sizes.sm;
  const iconSize = size === 'sm' ? 11 : 13;

  if (tone === 'gold') {
    return (
      <LinearGradient
        colors={gradients.gold.colors}
        start={gradients.gold.start}
        end={gradients.gold.end}
        style={[styles.badge, pad, style]}
      >
        {icon ? <Ionicons name={icon} size={iconSize} color={colors.white} style={styles.icon} /> : null}
        <Text style={[styles.text, { color: colors.white, fontSize }]}>{label}</Text>
      </LinearGradient>
    );
  }

  const t = TONES[tone] || TONES.primary;
  return (
    <View style={[styles.badge, pad, { backgroundColor: t.bg }, style]}>
      {icon ? <Ionicons name={icon} size={iconSize} color={t.fg} style={styles.icon} /> : null}
      <Text style={[styles.text, { color: t.fg, fontSize }]}>{label}</Text>
    </View>
  );
}

const TONES = {
  primary: { bg: colors.primarySoft, fg: colors.primaryDark },
  accent: { bg: colors.accentSoft, fg: colors.accentDark },
  success: { bg: colors.successSoft, fg: colors.success },
  muted: { bg: colors.lineSoft, fg: colors.muted },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
};

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.pill, alignSelf: 'flex-start' },
  text: { fontWeight: typography.weight.bold, letterSpacing: 0.2 },
  icon: { marginRight: spacing.xs },
});
