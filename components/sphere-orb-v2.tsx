// components/sphere-orb-v2.tsx
// one sphere. one light source. breath lives in the glow, not the scale.
//
// the body barely moves (3.8% scale).
// the aura blooms and fades (45% scale, 0→18% opacity).
// they run at slightly different rates — organic, not mechanical.

import React, { useEffect, useRef, useState } from 'react'
import { Animated, Pressable, StyleSheet, View, type ViewStyle } from 'react-native'
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg'
import * as Haptics from 'expo-haptics'
import { PHASES, type PhaseKey } from '../constants/palettes'
import { getItem } from '../utils/storage'

export type OrbVariant = 'lung' | 'iris' | 'etched'

interface Props {
  phase: PhaseKey
  size: number
  speed?: number
  variant?: OrbVariant
  style?: ViewStyle
  onPress?: () => void
  onLongPress?: () => void
}

export function SphereOrbV2({ phase, size, speed, variant = 'lung', style, onPress, onLongPress }: Props) {
  const { accent } = PHASES[phase]

  const phaseBreath = { dawn: 11000, day: 9000, goldenHour: 12000, night: 16000 }[phase]
  const breathMs = speed ?? phaseBreath
  const halfMs   = Math.round(breathMs / 2)
  const glowMs   = Math.round(halfMs * 0.88)  // aura slightly faster — they drift, recombine

  const breathBody = useRef(new Animated.Value(0)).current
  const breathGlow = useRef(new Animated.Value(0)).current

  // Defaults true (matches prior always-on behavior) until the real
  // preference loads, then respects it — a user who's turned haptics off
  // in Settings should never feel them here.
  const [hapticsEnabled, setHapticsEnabled] = useState(true)
  useEffect(() => {
    getItem<boolean>('haptics_enabled').then((v) => {
      if (v !== null) setHapticsEnabled(v)
    })
  }, [])

  const handlePress = () => {
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress?.()
  }

  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(breathBody, { toValue: 1, duration: halfMs, useNativeDriver: true }),
      Animated.timing(breathBody, { toValue: 0, duration: halfMs, useNativeDriver: true }),
    ]))
    a.start()
    return () => a.stop()
  }, [halfMs])

  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(breathGlow, { toValue: 1, duration: glowMs, useNativeDriver: true }),
      Animated.timing(breathGlow, { toValue: 0, duration: glowMs, useNativeDriver: true }),
    ]))
    a.start()
    return () => a.stop()
  }, [glowMs])

  const bodyScale   = breathBody.interpolate({ inputRange: [0, 1], outputRange: [1.000, 1.038] })
  const glowScale   = breathGlow.interpolate({ inputRange: [0, 1], outputRange: [1.00,  1.45]  })
  const glowOpacity = breathGlow.interpolate({ inputRange: [0, 1], outputRange: [0.00,  0.18]  })

  return (
    <View style={[{ width: size, height: size }, style]}>

      {/* aura — blooms and fades independently of the body */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius: size / 2,
            backgroundColor: accent,
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      />

      {/* body — barely moves. the light is the breath, not the movement. */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { transform: [{ scale: bodyScale }] }]}>
        <Pressable
          onPress={handlePress}
          onLongPress={onLongPress}
          style={StyleSheet.absoluteFillObject}
        >
          {variant === 'lung'   && <LungOrb   size={size} phase={phase} />}
          {variant === 'iris'   && <IrisOrb   size={size} phase={phase} />}
          {variant === 'etched' && <EtchedOrb size={size} phase={phase} />}
        </Pressable>
      </Animated.View>

    </View>
  )
}

// ─── Lung — a sphere with one light source ───────────────────────────────────
//
// light from upper-left. shadow at lower-right. thin rim light on the dark edge.
// three gradients, three circles. that's all.
//
function LungOrb({ size, phase }: { size: number; phase: PhaseKey }) {
  const { accent, shadow, highlight, rim } = PHASES[phase]
  const c  = size / 2
  const r  = size * 0.48

  const gSphere  = `lg-s-${phase}`
  const gRim     = `lg-r-${phase}`
  const gSpecular = `lg-sp-${phase}`

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>

        {/* main sphere — directional light from upper-left */}
        <RadialGradient id={gSphere} cx="33%" cy="26%" r="70%">
          <Stop offset="0%"   stopColor={highlight} stopOpacity={0.95} />
          <Stop offset="20%"  stopColor={accent}    stopOpacity={0.80} />
          <Stop offset="52%"  stopColor={accent}    stopOpacity={0.48} />
          <Stop offset="76%"  stopColor={shadow}    stopOpacity={0.20} />
          <Stop offset="90%"  stopColor={shadow}    stopOpacity={0.08} />
          <Stop offset="100%" stopColor={shadow}    stopOpacity={0.00} />
        </RadialGradient>

        {/* rim light — back-scatter on the shadow edge (lower-right) */}
        <RadialGradient id={gRim} cx="72%" cy="76%" r="32%">
          <Stop offset="0%"   stopColor={rim} stopOpacity={0.22} />
          <Stop offset="100%" stopColor={rim} stopOpacity={0.00} />
        </RadialGradient>

        {/* specular — the single point where light hits directly */}
        <RadialGradient id={gSpecular} cx="27%" cy="20%" r="14%">
          <Stop offset="0%"   stopColor={rim} stopOpacity={0.65} />
          <Stop offset="100%" stopColor={rim} stopOpacity={0.00} />
        </RadialGradient>

      </Defs>

      <Circle cx={c} cy={c} r={r} fill={`url(#${gSphere})`}   />
      <Circle cx={c} cy={c} r={r} fill={`url(#${gRim})`}      />
      <Circle cx={c} cy={c} r={r} fill={`url(#${gSpecular})`} />
    </Svg>
  )
}

// ─── Iris — soft radial pupil, sharp center point ────────────────────────────
function IrisOrb({ size, phase }: { size: number; phase: PhaseKey }) {
  const { accent, highlight, rim } = PHASES[phase]
  const c = size / 2
  const r = size * 0.30
  const g = `io-${phase}`

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id={g} cx="40%" cy="36%" r="55%">
          <Stop offset="0%"   stopColor={highlight} stopOpacity={0.88} />
          <Stop offset="30%"  stopColor={accent}    stopOpacity={0.50} />
          <Stop offset="70%"  stopColor={accent}    stopOpacity={0.10} />
          <Stop offset="100%" stopColor={accent}    stopOpacity={0.00} />
        </RadialGradient>
      </Defs>
      <Circle cx={c} cy={c} r={r * 1.6} fill={`url(#${g})`} />
      <Circle cx={c} cy={c} r={r * 0.11} fill={rim} fillOpacity={0.75} />
    </Svg>
  )
}

// ─── Etched — perimeter only, inner glow suggestion ──────────────────────────
function EtchedOrb({ size, phase }: { size: number; phase: PhaseKey }) {
  const { accent, highlight, rgb } = PHASES[phase]
  const c = size / 2
  const r = size * 0.22
  const g = `eo-${phase}`

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id={g} cx="36%" cy="32%" r="50%">
          <Stop offset="0%"   stopColor={highlight} stopOpacity={0.22} />
          <Stop offset="100%" stopColor={accent}    stopOpacity={0.04} />
        </RadialGradient>
      </Defs>
      <Circle cx={c} cy={c} r={r}
        fill={`url(#${g})`}
        stroke={accent} strokeOpacity={0.65} strokeWidth={0.8}
      />
      <Circle cx={c} cy={c} r={0.5} fill={accent} fillOpacity={0.55} />
    </Svg>
  )
}

const styles = StyleSheet.create({})
