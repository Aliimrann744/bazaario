import React, { useRef, useState } from 'react';
import { View, FlatList, Dimensions, StyleSheet, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme/tokens';

const { width: SCREEN_W } = Dimensions.get('window');
const BLUR = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

// Gallery — swipeable image carousel with a counter and paging dots.
export default function Gallery({ media = [], height = 320, onBack, onShare, onFavourite, isFavourite }) {
  const [index, setIndex] = useState(0);
  const ref = useRef(null);
  const images = media.length ? media : [{ url: null }];

  const onScroll = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (i !== index) setIndex(i);
  };

  return (
    <View style={[styles.wrap, { height }]}>
      <FlatList
        ref={ref}
        data={images}
        keyExtractor={(item, i) => `${item.url || 'img'}-${i}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.url }}
            style={{ width: SCREEN_W, height }}
            contentFit="cover"
            placeholder={BLUR}
            transition={200}
          />
        )}
      />

      {/* top action overlay */}
      <View style={styles.topBar} pointerEvents="box-none">
        {onBack ? (
          <RoundIcon icon="chevron-back" onPress={onBack} />
        ) : (
          <View style={{ width: 40 }} />
        )}
        <View style={styles.topRight}>
          {onShare ? <RoundIcon icon="share-social-outline" onPress={onShare} /> : null}
          {onFavourite ? (
            <RoundIcon icon={isFavourite ? 'heart' : 'heart-outline'} color={isFavourite ? colors.danger : colors.ink} onPress={onFavourite} />
          ) : null}
        </View>
      </View>

      {images.length > 1 ? (
        <>
          <View style={styles.counter}>
            <Ionicons name="images-outline" size={13} color={colors.white} />
            <Text style={styles.counterText}>
              {index + 1}/{images.length}
            </Text>
          </View>
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

function RoundIcon({ icon, onPress, color = colors.ink }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.roundIcon, pressed && { opacity: 0.85 }]}>
      <Ionicons name={icon} size={20} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SCREEN_W, backgroundColor: colors.lineSoft, position: 'relative' },
  topBar: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topRight: { flexDirection: 'row', gap: spacing.sm },
  roundIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15,23,42,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  counterText: { color: colors.white, fontSize: typography.sizes.xs, fontWeight: typography.weight.semibold },
  dots: { position: 'absolute', bottom: spacing.lg, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { width: 18, backgroundColor: colors.white },
});
