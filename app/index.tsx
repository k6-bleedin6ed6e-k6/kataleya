// app/index.tsx
// the room — surface layer. one orb. one phrase. the colour of the hour.
// gestures: swipe left → bridge, swipe up → cover, long-press orb → terminal

import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useCircadian } from '../hooks/use-circadian';
import { useReEntry } from '../hooks/use-re-entry';
import { selectPhrase } from '../constants/phrases';
import { BASE, PHASES } from '../constants/palettes';
import { SphereOrb } from '../components/sphere-orb';
import { TypewriterText } from '../components/typewriter-text';
import { Atmosphere } from '../components/atmosphere';
import { HudCorners } from '../components/hud-corners';
import { MercuryCaduceus } from '../surface/mercury-caduceus';

const { height } = Dimensions.get('window');

export default function RoomScreen() {
  const router = useRouter();
  const { phase, hour, minute } = useCircadian();
  const { activePhase, isInGrace, isBlending, gracePhrase } = useReEntry(phase);
  const palette = PHASES[activePhase];
  const [burnComplete] = useState(false);

  const isReEntry = isInGrace || isBlending;

  const phrase = gracePhrase ?? selectPhrase({
    phase: activePhase,
    restlessness: 0.3,
    isReEntry,
    lastBurnComplete: burnComplete,
  });

  // Re-entry fade-in — triggers when grace is first detected after async init
  const entryFade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (isInGrace) {
      entryFade.setValue(0);
      Animated.timing(entryFade, {
        toValue: 1,
        duration: 3000,
        delay: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [isInGrace]);

  // Gesture navigation — PanResponder, no gesture-handler dependency
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > 12 || Math.abs(dy) > 12,
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderRelease: (_, { dx, dy }) => {
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        if (absDx > 60 && absDx > absDy * 1.5 && dx < 0) {
          router.push('/bridge');
        } else if (absDy > 60 && absDy > absDx * 1.5 && dy < 0) {
          router.push('/cover');
        }
      },
    })
  ).current;

  const handleLongPress = useCallback(() => {
    router.push('/terminal');
  }, [router]);

  const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  return (
    <Animated.View
      style={[styles.container, { opacity: entryFade }]}
      {...panResponder.panHandlers}
    >
      {/* Mercury River Background */}
      <MercuryCaduceus phaseColor={palette.accent} />

      {/* Phase vignette */}
      <Atmosphere phaseColor={palette.accent} />

      {/* Corner brackets */}
      <HudCorners color={palette.accent} />

      {/* HUD — phase name top-left, time top-right */}
      <View style={styles.hudTopLeft}>
        <Text style={[styles.hudText, { color: palette.accent }]}>
          {palette.displayName}
        </Text>
      </View>
      <View style={styles.hudTopRight}>
        <Text style={[styles.hudText, { color: palette.accent }]}>
          {timeString}
        </Text>
      </View>

      {/* Center Orb */}
      <View style={styles.orbContainer}>
        <SphereOrb
          accent={palette.accent}
          onLongPress={handleLongPress}
        />
        <Text style={[styles.existentialLabel, { color: palette.accent }]}>
          {palette.existential}
        </Text>
      </View>

      {/* Phrase */}
      <View style={styles.phraseContainer}>
        <TypewriterText
          text={phrase}
          color={BASE.text}
          speed={38}
          key={phrase}
        />
      </View>

      {/* Gesture hints — barely visible */}
      <View style={styles.gestureHints}>
        <Text style={[styles.gestureHint, { color: palette.accent }]}>
          ← bridge · ↑ cover · hold · engine
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BASE.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phraseContainer: {
    position: 'absolute',
    bottom: height * 0.18,
    paddingHorizontal: 40,
  },
  hudTopLeft: {
    position: 'absolute',
    top: 52,
    left: 44,
  },
  hudTopRight: {
    position: 'absolute',
    top: 52,
    right: 44,
  },
  hudText: {
    fontFamily: 'Courier Prime',
    fontSize: 9,
    letterSpacing: 2.5,
    textTransform: 'lowercase',
    opacity: 0.6,
  },
  gestureHints: {
    position: 'absolute',
    bottom: 36,
  },
  gestureHint: {
    fontFamily: 'Courier Prime',
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: 'lowercase',
    opacity: 0.12,
  },
  existentialLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 9,
    letterSpacing: 4,
    textTransform: 'lowercase',
    opacity: 0.18,
    marginTop: 18,
  },
});
