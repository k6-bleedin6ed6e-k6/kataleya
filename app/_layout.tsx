// app/_layout.tsx
// root stack — dark status bar, fade transitions, font load
//
// Onboarding gate lives here, not on index.tsx: this is a global concern.
// Checking it per-screen (as index.tsx used to) meant the Room rendered a
// full frame before redirecting on first launch (a visible flicker), and
// nothing stopped a deep link straight into /bridge or /terminal from
// skipping onboarding entirely. Centralizing it here blocks render until
// resolved and applies to every route, not just one.

import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useFonts, CourierPrime_400Regular } from '@expo-google-fonts/courier-prime';
import { getItem } from '../utils/storage';
import { ErrorBoundary } from '../components/error-boundary';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Courier Prime': CourierPrime_400Regular,
  });
  const [gatePassed, setGatePassed] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    getItem<boolean>('has_seen_onboarding').then((seen) => {
      setNeedsOnboarding(!seen);
      setGatePassed(true);
    });
  }, []);

  useEffect(() => {
    if (!gatePassed) return;
    const onOnboardingScreen = segments[0] === 'onboarding';
    if (needsOnboarding && !onOnboardingScreen) {
      router.replace('/onboarding');
    }
  }, [gatePassed, needsOnboarding, segments]);

  // Hold a blank frame until fonts + the onboarding check both resolve —
  // this is what actually removes the flicker, not just moving the check.
  if (!gatePassed || (!fontsLoaded && !fontError)) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#050508' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="bridge" />
          <Stack.Screen name="cover" />
          <Stack.Screen name="terminal" />
          <Stack.Screen name="burn" />
          <Stack.Screen name="mirror" />
          <Stack.Screen name="scars" />
          <Stack.Screen name="vault" />
          <Stack.Screen name="settings" />
        </Stack>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
  },
});
