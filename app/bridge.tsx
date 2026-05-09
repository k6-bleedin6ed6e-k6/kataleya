// app/bridge.tsx
// swipe left from room — check-in / mood (milestone 3)
// swipe right to return

import React, { useRef, useMemo } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
import { useRouter } from 'expo-router';

import { useCircadian } from '../hooks/use-circadian';
import { pickBridgePhrase } from '../constants/phrases';
import { BASE } from '../constants/palettes';
import { Atmosphere } from '../components/atmosphere';
import { HudCorners } from '../components/hud-corners';
import { OuroborosRing } from '../components/ouroboros-ring';
import { TypewriterText } from '../components/typewriter-text';

export default function BridgeScreen() {
  const router = useRouter();
  const { phase, palette } = useCircadian();

  // Pick phrase once on mount
  const phrase = useMemo(() => pickBridgePhrase(phase), [phase]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > 12 || Math.abs(dy) > 12,
      onPanResponderRelease: (_, { dx, dy }) => {
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        if (absDx > 60 && absDx > absDy * 1.5 && dx > 0) {
          router.back(); // swipe right → room
        }
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Atmosphere phaseColor={palette.accent} />
      <HudCorners color={palette.accent} />

      {/* Existential label — top center */}
      <Text style={[styles.existential, { color: palette.accent }]}>
        ◈ {palette.existential}
      </Text>

      {/* Ouroboros ring */}
      <View style={styles.ringContainer}>
        <OuroborosRing
          size={260}
          phase={phase}
          accent={palette.accent}
        />
      </View>

      {/* Arrival phrase */}
      <View style={styles.phraseContainer}>
        <TypewriterText
          text={phrase}
          color={BASE.text}
          speed={44}
          key={phrase}
        />
      </View>

      {/* Back hint */}
      <Text style={[styles.backHint, { color: palette.accent }]}>
        ▷ swipe right · return
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BASE.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  existential: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    letterSpacing: 4,
    textTransform: 'lowercase',
    opacity: 0.65,
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  phraseContainer: {
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  backHint: {
    position: 'absolute',
    bottom: 40,
    fontFamily: 'Courier Prime',
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'lowercase',
    opacity: 0.15,
  },
});
