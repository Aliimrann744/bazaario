import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors, typography } from '../theme/tokens';
import { priceLabel } from '../utils/format';

// Renders a listing's price honoring priceType (contact_for_price -> "Contact for price").
export default function PriceTag({ listing, size = 'md', color, style }) {
  const label = priceLabel(listing);
  const isAsk = label === 'Contact for price' || label === 'Ask price';
  const fontSize = SIZES[size] ?? SIZES.md;
  return (
    <View style={style}>
      <Text
        style={[
          styles.price,
          { fontSize, color: color || (isAsk ? colors.muted : colors.ink) },
          isAsk && styles.ask,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const SIZES = {
  sm: typography.sizes.md,
  md: typography.sizes.lg,
  lg: typography.sizes.xxl,
};

const styles = StyleSheet.create({
  price: { fontWeight: typography.weight.extrabold, letterSpacing: -0.3 },
  ask: { fontWeight: typography.weight.semibold },
});
