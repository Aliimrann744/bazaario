import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients, spacing, typography, shadows } from '../theme/tokens';

const ICONS = {
  Home: ['home', 'home-outline'],
  Search: ['search', 'search-outline'],
  Chat: ['chatbubble-ellipses', 'chatbubble-ellipses-outline'],
  Account: ['person', 'person-outline'],
};

// Custom bottom tab bar with a prominent gradient "Post" button in the center.
export default function TabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        if (route.name === 'Post') {
          return (
            <View key={route.key} style={styles.postSlot}>
              <Pressable onPress={onPress} style={({ pressed }) => pressed && { transform: [{ scale: 0.94 }] }}>
                <LinearGradient
                  colors={gradients.brand.colors}
                  locations={gradients.brand.locations}
                  start={gradients.brand.start}
                  end={gradients.brand.end}
                  style={styles.postBtn}
                >
                  <Ionicons name="add" size={32} color={colors.white} />
                </LinearGradient>
                <Text style={styles.postLabel}>Post</Text>
              </Pressable>
            </View>
          );
        }

        const [activeIcon, inactiveIcon] = ICONS[route.name] || ['ellipse', 'ellipse-outline'];
        const badge = descriptors[route.key]?.options?.tabBarBadge;
        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tab}>
            <View>
              <Ionicons name={focused ? activeIcon : inactiveIcon} size={24} color={focused ? colors.primary : colors.mutedLight} />
              {badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, focused && styles.labelActive]}>{route.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.sm,
    ...shadows.card,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontSize: 10, color: colors.mutedLight, fontWeight: typography.weight.medium },
  labelActive: { color: colors.primary, fontWeight: typography.weight.bold },
  postSlot: { flex: 1, alignItems: 'center' },
  postBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -26,
    borderWidth: 4,
    borderColor: colors.surface,
    ...shadows.hover,
  },
  postLabel: { fontSize: 10, color: colors.primary, fontWeight: typography.weight.bold, marginTop: 2, textAlign: 'center' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: typography.weight.bold },
});
