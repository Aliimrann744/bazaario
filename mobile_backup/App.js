import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuth } from './src/store/auth';
import { colors, gradients, typography } from './src/theme/tokens';

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.primary, card: colors.surface, text: colors.ink, border: colors.line },
};

export default function App() {
  const status = useAuth((s) => s.status);
  const bootstrap = useAuth((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {status === 'loading' ? (
        <Splash />
      ) : (
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}

function Splash() {
  return (
    <LinearGradient
      colors={gradients.brand.colors}
      locations={gradients.brand.locations}
      start={gradients.brand.start}
      end={gradients.brand.end}
      style={styles.splash}
    >
      <Text style={styles.logo}>Bazaario</Text>
      <Text style={styles.tagline}>Pakistan's Premium Marketplace</Text>
      <ActivityIndicator color={colors.white} style={{ marginTop: 24 }} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 40, fontWeight: typography.weight.extrabold, color: colors.white, letterSpacing: -1 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 6, letterSpacing: 0.3 },
});
