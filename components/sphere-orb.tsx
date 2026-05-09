// components/sphere-orb.tsx
// SVG sphere with radial gradients — proper 3D depth, dual glow layers

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Pressable, Animated, Easing, Dimensions } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { getBreathTechnique, type BreathTechnique } from '../utils/storage';

const { width: SCREEN_W } = Dimensions.get('window');
const ORB_SIZE = Math.min(Math.round(SCREEN_W * 0.55), 240);
const R = ORB_SIZE / 2;
const GLOW_TIGHT = Math.round(ORB_SIZE * 1.12);
const GLOW_WIDE  = Math.round(ORB_SIZE * 1.52);

const EASE     = Easing.inOut(Easing.sin);
const EASE_OUT = Easing.out(Easing.sin);
const LINEAR   = Easing.linear;

function buildBreathAnim(v: Animated.Value, technique: BreathTechnique): Animated.CompositeAnimation {
  switch (technique) {
    case 'resonant':
      return Animated.loop(Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 5500, easing: EASE,     useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 5500, easing: EASE,     useNativeDriver: true }),
      ]));
    case '4-7-8':
      return Animated.loop(Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 4000, easing: EASE,     useNativeDriver: true }),
        Animated.timing(v, { toValue: 1, duration: 7000, easing: LINEAR,   useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 8000, easing: EASE_OUT, useNativeDriver: true }),
      ]));
    case 'box':
      return Animated.loop(Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 4000, easing: EASE,   useNativeDriver: true }),
        Animated.timing(v, { toValue: 1, duration: 4000, easing: LINEAR, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 4000, easing: EASE,   useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 4000, easing: LINEAR, useNativeDriver: true }),
      ]));
  }
}

interface SphereOrbProps {
  accent: string;
  onPressIn?: () => void;
  onPressOut?: () => void;
  onLongPress?: () => void;
}

export function SphereOrb({ accent, onPressIn, onPressOut, onLongPress }: SphereOrbProps) {
  const breath   = useRef(new Animated.Value(0)).current;
  const press    = useRef(new Animated.Value(0)).current;
  const animRef  = useRef<Animated.CompositeAnimation | null>(null);
  const [technique, setTechnique] = useState<BreathTechnique>('resonant');

  useEffect(() => {
    getBreathTechnique().then(setTechnique);
  }, []);

  useEffect(() => {
    if (animRef.current) animRef.current.stop();
    breath.setValue(0);
    const anim = buildBreathAnim(breath, technique);
    anim.start();
    animRef.current = anim;
    return () => anim.stop();
  }, [technique]);

  const orbScale       = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const glowOpacity    = breath.interpolate({ inputRange: [0, 1], outputRange: [0.13, 0.30] });
  const wideGlowOp     = breath.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.11] });
  const glowScale      = breath.interpolate({ inputRange: [0, 1], outputRange: [1,    1.07] });
  const pressScale     = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] });
  const combinedScale  = Animated.multiply(orbScale, pressScale);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(press, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    onPressIn?.();
  };
  const handlePressOut = () => {
    Animated.timing(press, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    onPressOut?.();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={onLongPress}
      delayLongPress={600}
      style={styles.container}
    >
      {/* Wide diffuse halo */}
      <Animated.View style={[styles.glow, {
        width: GLOW_WIDE, height: GLOW_WIDE, borderRadius: GLOW_WIDE / 2,
        backgroundColor: accent, opacity: wideGlowOp, transform: [{ scale: glowScale }],
      }]} />
      {/* Tight inner glow */}
      <Animated.View style={[styles.glow, {
        width: GLOW_TIGHT, height: GLOW_TIGHT, borderRadius: GLOW_TIGHT / 2,
        backgroundColor: accent, opacity: glowOpacity, transform: [{ scale: glowScale }],
      }]} />

      {/* Sphere — radial gradient depth shading */}
      <Animated.View style={{ transform: [{ scale: combinedScale }] }}>
        <Svg width={ORB_SIZE} height={ORB_SIZE}>
          <Defs>
            {/* Primary illumination — upper-left light source */}
            <RadialGradient
              id="orbDepth"
              gradientUnits="userSpaceOnUse"
              cx={ORB_SIZE * 0.34}
              cy={ORB_SIZE * 0.29}
              r={ORB_SIZE * 0.82}
              fx={ORB_SIZE * 0.34}
              fy={ORB_SIZE * 0.29}
            >
              <Stop offset="0%"   stopColor={accent} stopOpacity="0.74" />
              <Stop offset="26%"  stopColor={accent} stopOpacity="0.22" />
              <Stop offset="60%"  stopColor="#010108" stopOpacity="0.52" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.94" />
            </RadialGradient>
            {/* Specular highlight — sharp catch light */}
            <RadialGradient
              id="orbSpec"
              gradientUnits="userSpaceOnUse"
              cx={ORB_SIZE * 0.36}
              cy={ORB_SIZE * 0.24}
              r={ORB_SIZE * 0.21}
            >
              <Stop offset="0%"   stopColor="#ffffff" stopOpacity="0.62" />
              <Stop offset="52%"  stopColor="#ffffff" stopOpacity="0.10" />
              <Stop offset="100%" stopColor="#ffffff" stopOpacity="0"    />
            </RadialGradient>
            {/* Rim catch light — edge glow */}
            <RadialGradient
              id="orbRim"
              gradientUnits="userSpaceOnUse"
              cx={ORB_SIZE * 0.50}
              cy={ORB_SIZE * 0.50}
              r={ORB_SIZE * 0.50}
            >
              <Stop offset="67%"  stopColor={accent} stopOpacity="0"    />
              <Stop offset="86%"  stopColor={accent} stopOpacity="0.20" />
              <Stop offset="100%" stopColor={accent} stopOpacity="0.55" />
            </RadialGradient>
          </Defs>

          {/* Base sphere */}
          <Circle cx={R} cy={R} r={R - 0.5} fill="#010108" />
          {/* Illumination */}
          <Circle cx={R} cy={R} r={R - 0.5} fill="url(#orbDepth)" />
          {/* Specular */}
          <Circle cx={R} cy={R} r={R - 0.5} fill="url(#orbSpec)" />
          {/* Rim */}
          <Circle cx={R} cy={R} r={R - 0.5} fill="url(#orbRim)" />
          {/* Refraction glint — lower-right */}
          <Circle cx={R * 1.37} cy={R * 1.57} r={R * 0.075} fill="#ffffff" fillOpacity="0.045" />
          {/* Rim stroke */}
          <Circle cx={R} cy={R} r={R - 0.8} fill="none" stroke={accent} strokeWidth="0.7" strokeOpacity="0.38" />
        </Svg>
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
});
