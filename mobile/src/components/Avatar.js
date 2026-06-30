import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { colors, typography } from '../theme/tokens';
import { initials } from '../utils/format';

// Circular avatar. Seed dicebear/svg URLs from the API may not render in <Image>
// reliably, so we fall back to a tinted initials circle.
export default function Avatar({ uri, name, size = 44, ring = false }) {
  const isSvg = typeof uri === 'string' && uri.includes('.svg');
  const showImage = uri && !isSvg;
  const dim = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={[styles.wrap, dim, ring && styles.ring]}>
      {showImage ? (
        <Image source={{ uri }} style={dim} contentFit="cover" transition={150} />
      ) : (
        <View style={[styles.fallback, dim]}>
          <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials(name)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: colors.primarySoft },
  ring: { borderWidth: 2, borderColor: colors.white },
  fallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  initials: { color: colors.primaryDark, fontWeight: typography.weight.bold },
});
