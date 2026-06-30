import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

// Shimmer skeleton block. Animates opacity for a subtle "loading" pulse.
export function Skeleton({ width = '100%', height = 16, radius: r = 8, style }) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return <Animated.View style={[{ width, height, borderRadius: r, backgroundColor: colors.line, opacity: pulse }, style]} />;
}

// A listing-card shaped skeleton for grids/lists.
export function ListingCardSkeleton({ horizontal = false }) {
  if (horizontal) {
    return (
      <View style={[styles.card, { width: 230 }]}>
        <Skeleton width="100%" height={140} radius={radius.md} />
        <Skeleton width="70%" height={14} style={{ marginTop: spacing.md }} />
        <Skeleton width="45%" height={16} style={{ marginTop: spacing.sm }} />
      </View>
    );
  }
  return (
    <View style={styles.rowCard}>
      <Skeleton width={120} height={96} radius={radius.md} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Skeleton width="85%" height={14} />
        <Skeleton width="55%" height={16} style={{ marginTop: spacing.md }} />
        <Skeleton width="40%" height={12} style={{ marginTop: spacing.md }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.md, marginRight: spacing.md },
  rowCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.md, marginBottom: spacing.md },
});

export default Skeleton;
