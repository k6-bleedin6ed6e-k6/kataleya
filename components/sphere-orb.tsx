// components/sphere-orb.tsx
// the breathing sphere — procedural, no images
// technique-driven animation sequence. reads from surface vault on mount.
// hold phases use same-value timing (native-driver safe, no Animated.delay ambiguity)

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import * as Haptics from 'expo-haptics';

import { getBreathTechnique, type BreathTechnique } from '../utils/storage';

const { width: SCREEN_W } = Dimensions.get('window');
const ORB_SIZE = Math.min(Math.round(SCREEN_W * 0.55), 240);
const GLOW_SIZE = Math.round(ORB_SIZE * 1.07);

const EASE = Easing.inOut(Easing.sin);
const EASE_OUT = Easing.out(Easing.sin);
const LINEAR = Easing.linear;

function buildBreathAnim(
  v: Animated.Value,
  technique: BreathTechnique
): Animated.CompositeAnimation {
  switch (technique) {
    case 'resonant':
      // 11s total: 5500 inhale / 5500 exhale
      return Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 5500, easing: EASE, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 5500, easing: EASE, useNativeDriver: true }),
        ])
      );

    case '4-7-8':
      // 19s total: 4 inhale / 7 hold / 8 exhale
      // hold = timing to same value with linear easing — native-driver safe
      return Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 4000,  easing: EASE,     useNativeDriver: true }),
          Animated.timing(v, { toValue: 1, duration: 7000,  easing: LINEAR,   useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 8000,  easing: EASE_OUT, useNativeDriver: true }),
        ])
      );

    case 'box':
      // 16s total: 4 inhale / 4 hold / 4 exhale / 4 hold
      return Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 4000, easing: EASE,    useNativeDriver: true }),
          Animated.timing(v, { toValue: 1, duration: 4000, easing: LINEAR,  useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 4000, easing: EASE,    useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 4000, easing: LINEAR,  useNativeDriver: true }),
        ])
      );
  }
}

interface SphereOrbProps {
  accent: string;
  onPressIn?: () => void;
  onPressOut?: () => void;
  onLongPress?: () => void;
}

export function SphereOrb({
  accent,
  onPressIn,
  onPressOut,
  onLongPress,
}: SphereOrbProps) {
  const breath = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const [technique, setTechnique] = useState<BreathTechnique>('resonant');

  // load technique from surface vault on mount
  useEffect(() => {
    getBreathTechnique().then(setTechnique);
  }, []);

  // restart animation when technique changes — stop previous before starting new
  useEffect(() => {
    if (animRef.current) animRef.current.stop();
    breath.setValue(0);
    const anim = buildBreathAnim(breath, technique);
    anim.start();
    animRef.current = anim;
    return () => anim.stop();
  }, [technique]);

  const orbScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const glowOpacity = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.10, 0.24],
  });

  const glowScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  const specularOpacity = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.5],
  });

  const pressScale = press.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.96],
  });

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(press, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    onPressIn?.();
  };

  const handlePressOut = () => {
    Animated.timing(press, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    onPressOut?.();
  };

  const combinedScale = Animated.multiply(orbScale, pressScale);

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={onLongPress}
      delayLongPress={600}
      style={styles.container}
    >
      {/* Ambient glow */}
      <Animated.View
        style={[
          styles.glow,
          {
            width: GLOW_SIZE,
            height: GLOW_SIZE,
            borderRadius: GLOW_SIZE / 2,
            backgroundColor: accent,
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      />

      {/* Orb core */}
      <Animated.View style={[styles.orb, { transform: [{ scale: combinedScale }] }]}>
        {/* Primary illumination — upper-left light source */}
        <LinearGradient
          colors={[`${accent}70`, `${accent}28`, '#0f172a00']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.12, y: 0.08 }}
          end={{ x: 0.88, y: 0.92 }}
        />
        {/* Shadow depth — lower-right darkening */}
        <LinearGradient
          colors={['transparent', '#00000058']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.15, y: 0.0 }}
          end={{ x: 0.95, y: 1.0 }}
        />
        {/* Atmospheric top haze */}
        <LinearGradient
          colors={['#ffffff0c', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.0 }}
          end={{ x: 0.5, y: 0.5 }}
        />
        <View style={[styles.rim, { borderColor: `${accent}95` }]} />
        {/* Specular blob — diffuse highlight */}
        <View style={styles.specularBlob} />
        {/* Specular point — sharp catch light */}
        <Animated.View style={[styles.specular, { opacity: specularOpacity }]} />
        {/* Refraction — bottom-right secondary glint */}
        <View style={styles.refraction} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.02)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rim: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    borderWidth: 0.8,
  },
  specularBlob: {
    position: 'absolute',
    top: 20,
    left: 28,
    width: 38,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    opacity: 0.07,
  },
  specular: {
    position: 'absolute',
    top: 25,
    left: 35,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ffffff',
  },
  refraction: {
    position: 'absolute',
    bottom: 28,
    right: 32,
    width: 16,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    opacity: 0.032,
  },
});
