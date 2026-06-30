import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, radius, spacing, typography } from '../theme/tokens';

// Brand button. variants: 'primary' (gradient), 'accent' (gradient gold),
// 'outline', 'ghost', 'danger', 'subtle'. sizes: 'sm' | 'md' | 'lg'.
export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  full = false,
  style,
}) {
  const sizing = SIZES[size] || SIZES.md;
  const isGradient = variant === 'primary' || variant === 'accent';
  const grad = variant === 'accent' ? gradients.gold : gradients.brand;
  const palette = PALETTES[variant] || PALETTES.primary;
  const isDisabled = disabled || loading;

  const content = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator color={palette.fg} size="small" />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={sizing.icon} color={palette.fg} style={styles.iconLeft} /> : null}
          <Text style={[styles.label, { color: palette.fg, fontSize: sizing.font }]} numberOfLines={1}>
            {title}
          </Text>
          {iconRight ? (
            <Ionicons name={iconRight} size={sizing.icon} color={palette.fg} style={styles.iconRight} />
          ) : null}
        </>
      )}
    </View>
  );

  const base = [
    styles.base,
    { height: sizing.height, paddingHorizontal: sizing.pad, borderRadius: radius.pill },
    full && styles.full,
    isDisabled && styles.disabled,
    style,
  ];

  if (isGradient) {
    return (
      <Pressable onPress={isDisabled ? undefined : onPress} disabled={isDisabled} style={({ pressed }) => [full && styles.full, pressed && styles.pressed]}>
        <LinearGradient colors={grad.colors} locations={grad.locations} start={grad.start} end={grad.end} style={base}>
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        base,
        { backgroundColor: palette.bg, borderColor: palette.border, borderWidth: palette.border ? 1.5 : 0 },
        pressed && styles.pressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

const SIZES = {
  sm: { height: 38, pad: spacing.lg, font: typography.sizes.sm, icon: 16 },
  md: { height: 48, pad: spacing.xl, font: typography.sizes.md, icon: 18 },
  lg: { height: 56, pad: spacing.xxl, font: typography.sizes.lg, icon: 20 },
};

const PALETTES = {
  primary: { fg: colors.white },
  accent: { fg: colors.white },
  outline: { fg: colors.primary, bg: colors.surface, border: colors.primary },
  ghost: { fg: colors.primary, bg: 'transparent' },
  subtle: { fg: colors.ink, bg: colors.lineSoft },
  danger: { fg: colors.danger, bg: colors.dangerSoft, border: colors.dangerSoft },
};

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  full: { width: '100%', alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  label: { fontWeight: typography.weight.bold, letterSpacing: 0.2 },
  iconLeft: { marginRight: spacing.sm },
  iconRight: { marginLeft: spacing.sm },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.55 },
});
