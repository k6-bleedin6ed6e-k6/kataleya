// app/_layout.tsx
// root stack — dark status bar, fade transitions, font load

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useFonts, CourierPrime_400Regular } from '@expo-google-fonts/courier-prime';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Courier Prime': CourierPrime_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#050508' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="bridge" />
        <Stack.Screen name="cover" />
        <Stack.Screen name="terminal" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
  },
});
