// components/garden-presence.tsx
// the integrated presence — seed, spine, wings, atmosphere as one living thing
// replaces: sphere-orb, atmosphere, mercury-caduceus, ouroboros-ring, hud-corners
//
// this is not a collection of elements. it is one organism.
// the seed pulses. the spine rises. the wings hold. the air breathes.

import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  Pressable,
  Text,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg'
import { getBreathTechnique, type BreathTechnique } from '../utils/storage'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')
const CENTER_X = SCREEN_W / 2
const CENTER_Y = SCREEN_H * 0.42

// ------------------------------------------------------------------
// phase colors — the garden's dna
// ------------------------------------------------------------------
const PHASE_COLORS = {
  void:   { primary: '#4a4a6a', glow: '#6a6a9a', deep: '#2a2a3a' },
  dawn:   { primary: '#d4a574', glow: '#e8c494', deep: '#8a6a44' },
  day:    { primary: '#8fb8a8', glow: '#a8d4c4', deep: '#5a8a7a' },
  golden: { primary: '#c9a959', glow: '#e8d47a', deep: '#8a7a39' },
}

type Phase = keyof typeof PHASE_COLORS

// ------------------------------------------------------------------
// breath sequences — locked in firmware
// ------------------------------------------------------------------
function createBreathAnim(
  technique: BreathTechnique,
  breathValue: Animated.Value
): Animated.CompositeAnimation {
  switch (technique) {
    case 'resonant':
      return Animated.loop(
        Animated.sequence([
          Animated.timing(breathValue, { toValue: 1, duration: 5500, useNativeDriver: true }),
          Animated.timing(breathValue, { toValue: 0, duration: 5500, useNativeDriver: true }),
        ])
      )
    case '4-7-8':
      return Animated.loop(
        Animated.sequence([
          Animated.timing(breathValue, { toValue: 1, duration: 4000, useNativeDriver: true }),
          Animated.timing(breathValue, { toValue: 1, duration: 7000, useNativeDriver: true }),
          Animated.timing(breathValue, { toValue: 0, duration: 8000, useNativeDriver: true }),
        ])
      )
    case 'box':
      return Animated.loop(
        Animated.sequence([
          Animated.timing(breathValue, { toValue: 1, duration: 4000, useNativeDriver: true }),
          Animated.timing(breathValue, { toValue: 1, duration: 4000, useNativeDriver: true }),
          Animated.timing(breathValue, { toValue: 0, duration: 4000, useNativeDriver: true }),
          Animated.timing(breathValue, { toValue: 0, duration: 4000, useNativeDriver: true }),
        ])
      )
  }
}

// ------------------------------------------------------------------
// the garden presence
// ------------------------------------------------------------------
interface GardenPresenceProps {
  phase: Phase
  phrase?: string | null
  isGrace?: boolean
  onPress?: () => void
  onLongPress?: () => void
}

export function GardenPresence({
  phase,
  phrase,
  isGrace = false,
  onPress,
  onLongPress,
}: GardenPresenceProps) {
  const colors = PHASE_COLORS[phase]

  // breath animation
  const breath = useRef(new Animated.Value(0)).current
  const [technique, setTechnique] = useState<BreathTechnique>('resonant')
  const animRef = useRef<Animated.CompositeAnimation | null>(null)

  // load technique from storage
  useEffect(() => {
    async function load() {
      const stored = await getBreathTechnique()
      setTechnique(stored)
    }
    load()
  }, [])

  // start breath animation
  useEffect(() => {
    if (animRef.current) animRef.current.stop()
    breath.setValue(0)
    const anim = createBreathAnim(technique, breath)
    anim.start()
    animRef.current = anim
    return () => anim.stop()
  }, [technique])

  // interpolated values
  const seedScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  })

  const seedOpacity = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  })

  const glowScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  })

  const glowOpacity = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.2],
  })

  const atmosphereOpacity = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.35],
  })

  // spine is static SVG — no JS-driven animation (native driver can't drive SVG stroke)

  // press feedback
  const press = useRef(new Animated.Value(0)).current
  const handlePressIn = () => {
    Animated.timing(press, { toValue: 1, duration: 120, useNativeDriver: true }).start()
  }
  const handlePressOut = () => {
    Animated.timing(press, { toValue: 0, duration: 200, useNativeDriver: true }).start()
  }
  const pressScale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] })
  const combinedScale = Animated.multiply(seedScale, pressScale)

  return (
    <View style={styles.container}>

      {/* === the atmosphere (the air) === */}
      <Animated.View style={[styles.atmosphere, { opacity: atmosphereOpacity }]}>
        <LinearGradient
          colors={[`${colors.primary}22`, 'transparent', `${colors.primary}15`]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* === the spine (caduceus) === */}
      <View style={styles.spineContainer}>
        <Svg width={SCREEN_W} height={SCREEN_H} style={styles.spineSvg}>
          <Defs>
            <SvgGradient id="spineGrad" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor={colors.primary} stopOpacity="0" />
              <Stop offset="0.4" stopColor={colors.primary} stopOpacity="0.15" />
              <Stop offset="0.7" stopColor={colors.glow} stopOpacity="0.08" />
              <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
            </SvgGradient>
          </Defs>

          {/* strand 1 — rises from bottom-left, curves to seed */}
          <Path
            d={`M ${CENTER_X - 60} ${SCREEN_H} Q ${CENTER_X - 30} ${SCREEN_H * 0.55} ${CENTER_X} ${CENTER_Y}`}
            stroke="url(#spineGrad)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* strand 2 — rises from bottom-right, curves to seed */}
          <Path
            d={`M ${CENTER_X + 60} ${SCREEN_H} Q ${CENTER_X + 30} ${SCREEN_H * 0.55} ${CENTER_X} ${CENTER_Y}`}
            stroke="url(#spineGrad)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      {/* === the wings (ouroboros) === */}
      <View style={styles.wingsContainer}>
        <Svg width={SCREEN_W} height={SCREEN_H * 0.6} viewBox="0 0 200 120">
          {/* left wing — upper */}
          <Path
            d="M 100 60 C 70 40, 40 50, 30 70 C 45 60, 70 55, 100 60"
            fill={colors.primary}
            opacity={0.08}
          />
          {/* left wing — lower */}
          <Path
            d="M 100 60 C 70 80, 40 90, 30 70 C 45 75, 70 70, 100 60"
            fill={colors.primary}
            opacity={0.08}
          />
          {/* right wing — upper */}
          <Path
            d="M 100 60 C 130 40, 160 50, 170 70 C 155 60, 130 55, 100 60"
            fill={colors.primary}
            opacity={0.08}
          />
          {/* right wing — lower */}
          <Path
            d="M 100 60 C 130 80, 160 90, 170 70 C 155 75, 130 70, 100 60"
            fill={colors.primary}
            opacity={0.08}
          />
        </Svg>
      </View>

      {/* === the seed === */}
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={800}
        style={styles.seedContainer}
      >
        {/* ambient glow — largest, slowest */}
        <Animated.View
          style={[
            styles.glowLayer,
            {
              width: 280,
              height: 280,
              backgroundColor: colors.glow,
              transform: [{ scale: glowScale }],
              opacity: glowOpacity,
            },
          ]}
        />

        {/* inner halo — medium */}
        <Animated.View
          style={[
            styles.glowLayer,
            {
              width: 180,
              height: 180,
              backgroundColor: colors.primary,
              transform: [{ scale: Animated.multiply(glowScale, 0.7) }],
              opacity: Animated.multiply(glowOpacity, 1.5),
            },
          ]}
        />

        {/* seed body — the core */}
        <Animated.View
          style={[
            styles.seedBody,
            {
              backgroundColor: colors.primary,
              transform: [{ scale: combinedScale }],
              opacity: seedOpacity,
              shadowColor: colors.glow,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 40,
            },
          ]}
        >
          {/* inner core — brighter center */}
          <View style={[styles.innerCore, { backgroundColor: colors.glow }]} />
        </Animated.View>

        {/* seed label — quiet, centered */}
        <Text style={[styles.seedLabel, { color: `${colors.glow}88` }]}>
          {isGrace ? 'returning' : 'seed'}
        </Text>
      </Pressable>

      {/* === the phrase === */}
      {phrase && (
        <View style={styles.phraseContainer}>
          <Text style={[styles.phrase, { color: `${colors.glow}cc` }]}>
            {phrase}
          </Text>
        </View>
      )}

    </View>
  )
}

// ------------------------------------------------------------------
// styles — one organism, one stylesheet
// ------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // atmosphere
  atmosphere: {
    ...StyleSheet.absoluteFillObject,
  },

  // spine
  spineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  spineSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  // wings
  wingsContainer: {
    position: 'absolute',
    top: CENTER_Y - 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },

  // seed
  seedContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowLayer: {
    position: 'absolute',
    borderRadius: 9999,
  },
  seedBody: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCore: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    opacity: 0.5,
  },
  seedLabel: {
    position: 'absolute',
    bottom: -24,
    fontFamily: 'Courier Prime',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'lowercase',
  },

  // phrase
  phraseContainer: {
    position: 'absolute',
    bottom: SCREEN_H * 0.18,
    left: 32,
    right: 32,
    alignItems: 'center',
  },
  phrase: {
    fontFamily: 'Courier Prime',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 24,
  },
})
