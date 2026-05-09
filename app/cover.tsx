// app/cover.tsx
// swipe up from room — the 2am lung. rain. stay with me.
// tap anywhere to cycle phrases · swipe down to return

import React, { useCallback, useEffect, useRef, useState } from 'react';
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

import { BASE, PHASES } from '../constants/palettes';
import { COVER_PHRASES } from '../constants/phrases';
import { useCircadian } from '../hooks/use-circadian';
import { SphereOrb } from '../components/sphere-orb';
import { Atmosphere } from '../components/atmosphere';
import { OuroborosRing } from '../components/ouroboros-ring';

const { width, height } = Dimensions.get('window');

const PARTICLE_COUNT = 14;

type Particle = {
  x: number;
  speed: number;
  opacity: number;
  length: number;
  y: Animated.Value;
};

function buildParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * width,
    speed: 3200 + Math.random() * 2400,
    opacity: 0.07 + Math.random() * 0.14,
    length: 28 + Math.random() * 52,
    y: new Animated.Value(-80),
  }));
}

function animateParticle(p: Particle) {
  p.y.setValue(-p.length);
  Animated.timing(p.y, {
    toValue: height + p.length,
    duration: p.speed,
    easing: Easing.linear,
    useNativeDriver: true,
  }).start(({ finished }) => {
    if (finished) animateParticle(p);
  });
}

export default function CoverScreen() {
  const router = useRouter();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const { phase } = useCircadian();

  const palette = PHASES[phase];

  const particles = useRef<Particle[]>(buildParticles()).current;

  useEffect(() => {
    particles.forEach((p) => {
      const delay = Math.random() * 3000;
      setTimeout(() => animateParticle(p), delay);
    });
    return () => {
      particles.forEach((p) => p.y.stopAnimation());
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, { dx, dy }) => {
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        if (absDy > 60 && absDy > absDx * 1.5 && dy > 0) {
          router.back(); // swipe down → room
        } else if (absDx < 15 && absDy < 15) {
          setPhraseIndex((i) => (i + 1) % COVER_PHRASES.length); // tap → next phrase
        }
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Rain particles */}
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.raindrop,
            {
              left: p.x,
              height: p.length,
              opacity: p.opacity,
              backgroundColor: palette.accent,
              transform: [{ translateY: p.y }],
            },
          ]}
        />
      ))}

      <Atmosphere heavy />

      {/* Ouroboros ring — absolute full-screen so it centers on screen */}
      <View style={styles.ringContainer}>
        <OuroborosRing
          size={260}
          phase={phase}
          accent={palette.accent}
        />
      </View>

      {/* Orb — absolute full-screen, co-centered with ring */}
      <View style={styles.orbContainer}>
        <SphereOrb
          accent={palette.accent}
        />
      </View>

      {/* Cycling phrase — just past the ring's lower edge */}
      <View style={styles.phraseContainer}>
        <Text style={styles.phrase} key={phraseIndex}>
          {COVER_PHRASES[phraseIndex]}
        </Text>
      </View>

      {/* Existential label */}
      <Text style={[styles.existential, { color: palette.accent }]}>
        {palette.existential}
      </Text>

      {/* Hints */}
      <Text style={[styles.hint, styles.hintBottom, { color: palette.accent }]}>
        ↓ swipe down · return
      </Text>
      <Text style={[styles.hint, styles.hintAboveBottom, { color: palette.accent }]}>
        tap · next
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  raindrop: {
    position: 'absolute',
    width: 1,
    borderRadius: 1,
  },
  ringContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phraseContainer: {
    position: 'absolute',
    top: height / 2 + 148,
    left: 0,
    right: 0,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  phrase: {
    fontFamily: 'Courier Prime',
    fontSize: 16,
    color: BASE.text,
    textAlign: 'center',
    letterSpacing: 0.5,
    opacity: 0.85,
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
  hint: {
    position: 'absolute',
    fontFamily: 'Courier Prime',
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'lowercase',
    opacity: 0.18,
  },
  hintBottom: {
    bottom: 36,
  },
  hintAboveBottom: {
    bottom: 54,
  },
});
