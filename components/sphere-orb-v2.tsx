// components/sphere-orb-v2.tsx
// phase-reactive orb — three visual variants, five SVG gradient layers on lung.
// animations: RN Animated API only. no reanimated, no Skia.

import React, { useEffect, useRef } from 'react'
import { Animated, Pressable, StyleSheet, View, type ViewStyle } from 'react-native'
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg'
import * as Haptics from 'expo-haptics'
import { PHASES, type PhaseKey } from '../constants/palettes'

export type OrbVariant = 'etched' | 'iris' | 'lung'

interface SphereOrbV2Props {
  phase: PhaseKey
  size: number
  speed?: number
  variant?: OrbVariant
  pressed?: boolean
  style?: ViewStyle
  onPress?: () => void
  onLongPress?: () => void
}

export function SphereOrbV2({
  phase,
  size,
  speed,
  variant = 'iris',
  pressed = false,
  style,
  onPress,
  onLongPress,
}: SphereOrbV2Props) {
  const theme = PHASES[phase]

  const phaseBreath = { dawn: 11000, day: 9000, goldenHour: 12000, night: 16000 }[phase]
  const breathMs = speed ?? phaseBreath

  const breath = useRef(new Animated.Value(0)).current
  const press  = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(breath, { toValue: 1, duration: breathMs / 2, useNativeDriver: true }),
      Animated.timing(breath, { toValue: 0, duration: breathMs / 2, useNativeDriver: true }),
    ]))
    anim.start()
    return () => anim.stop()
  }, [breathMs])

  useEffect(() => {
    Animated.timing(press, {
      toValue: pressed ? 1 : 0, duration: 200, useNativeDriver: true,
    }).start()
  }, [pressed])

  const scale       = breath.interpolate({ inputRange: [0, 1], outputRange: [1.00, 1.14] })
  const glowOpacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.00] })
  const pressScale  = press.interpolate({ inputRange: [0, 1], outputRange: [1.00, 0.97] })
  const combined    = Animated.multiply(scale, pressScale)

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        onLongPress={onLongPress}
        style={[StyleSheet.absoluteFillObject, styles.pressable]}
      >
        <Animated.View style={{ width: size, height: size, transform: [{ scale: combined }], opacity: glowOpacity }}>
          {variant === 'etched' && <EtchedOrb size={size} phase={phase} />}
          {variant === 'iris'   && <IrisOrb   size={size} phase={phase} />}
          {variant === 'lung'   && <LungOrb   size={size} phase={phase} />}
        </Animated.View>
      </Pressable>
    </View>
  )
}

// ─── Lung: bioluminescent membrane — five gradient layers ───────────────────
//
// layer 1 · haze     : full-canvas soft radial — the ambient presence
// layer 2 · body     : main membrane — light source from upper-left
// layer 3 · rim      : reversed gradient — edge catch-light
// layer 4 · iris     : concentric structure rings — internal membrane folds
// layer 5 · nucleus  : off-center specular — the internal light source
//
function LungOrb({ size, phase }: { size: number; phase: PhaseKey }) {
  const { accent: c, shadow, highlight, rim } = PHASES[phase]
  const cx = size / 2
  const cy = size / 2
  const r  = size * 0.46    // membrane body radius

  // namespace IDs by phase to avoid SVG conflicts on web multi-instance
  const haze  = `lg-hz-${phase}`
  const body  = `lg-bd-${phase}`
  const rimG  = `lg-rm-${phase}`
  const iris  = `lg-ir-${phase}`
  const nuc   = `lg-nc-${phase}`

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        {/* haze: vast, very faint, the organism announces itself before you see it */}
        <RadialGradient id={haze} cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor={c}   stopOpacity={0.16} />
          <Stop offset="50%"  stopColor={c}   stopOpacity={0.05} />
          <Stop offset="100%" stopColor={c}   stopOpacity={0}    />
        </RadialGradient>
        {/* body: membrane with directional light from upper-left */}
        <RadialGradient id={body} cx="40%" cy="37%" r="56%">
          <Stop offset="0%"   stopColor={highlight} stopOpacity={0.92} />
          <Stop offset="18%"  stopColor={c}          stopOpacity={0.68} />
          <Stop offset="48%"  stopColor={c}          stopOpacity={0.30} />
          <Stop offset="76%"  stopColor={shadow}     stopOpacity={0.10} />
          <Stop offset="100%" stopColor={shadow}     stopOpacity={0}    />
        </RadialGradient>
        {/* rim: edge glow — membrane lit from behind, reversed */}
        <RadialGradient id={rimG} cx="50%" cy="50%" r="50%">
          <Stop offset="70%"  stopColor={rim} stopOpacity={0}    />
          <Stop offset="87%"  stopColor={rim} stopOpacity={0.22} />
          <Stop offset="100%" stopColor={rim} stopOpacity={0.42} />
        </RadialGradient>
        {/* iris: two concentric structure rings — the membrane folds */}
        <RadialGradient id={iris} cx="50%" cy="50%" r="50%">
          <Stop offset="43%"  stopColor={c}   stopOpacity={0}    />
          <Stop offset="50%"  stopColor={c}   stopOpacity={0.16} />
          <Stop offset="54%"  stopColor={c}   stopOpacity={0}    />
          <Stop offset="67%"  stopColor={rim} stopOpacity={0.07} />
          <Stop offset="71%"  stopColor={rim} stopOpacity={0}    />
        </RadialGradient>
        {/* nucleus: off-center specular catch — the internal light source */}
        <RadialGradient id={nuc} cx="36%" cy="31%" r="28%">
          <Stop offset="0%"   stopColor={rim}       stopOpacity={0.72} />
          <Stop offset="38%"  stopColor={highlight}  stopOpacity={0.32} />
          <Stop offset="100%" stopColor={c}          stopOpacity={0}    />
        </RadialGradient>
      </Defs>

      {/* render order: haze → body → rim → iris → nucleus */}
      <Circle cx={cx} cy={cy} r={cx}   fill={`url(#${haze})`} />
      <Circle cx={cx} cy={cy} r={r}    fill={`url(#${body})`} />
      <Circle cx={cx} cy={cy} r={r}    fill={`url(#${rimG})`} />
      <Circle cx={cx} cy={cy} r={r}    fill={`url(#${iris})`} />
      <Circle cx={cx} cy={cy} r={r}    fill={`url(#${nuc})`}  />
    </Svg>
  )
}

// ─── Iris: soft pupil + nucleus specular ────────────────────────────────────
function IrisOrb({ size, phase }: { size: number; phase: PhaseKey }) {
  const { accent: c, highlight, rim } = PHASES[phase]
  const cx = size / 2
  const cy = size / 2
  const r  = size * 0.30

  const body = `io-bd-${phase}`
  const nuc  = `io-nc-${phase}`

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id={body} cx="40%" cy="38%" r="55%">
          <Stop offset="0%"   stopColor={highlight} stopOpacity={0.85} />
          <Stop offset="28%"  stopColor={c}          stopOpacity={0.48} />
          <Stop offset="68%"  stopColor={c}          stopOpacity={0.10} />
          <Stop offset="100%" stopColor={c}          stopOpacity={0}    />
        </RadialGradient>
        <RadialGradient id={nuc} cx="36%" cy="32%" r="24%">
          <Stop offset="0%"   stopColor={rim} stopOpacity={0.65} />
          <Stop offset="100%" stopColor={c}   stopOpacity={0}    />
        </RadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r * 1.6}  fill={`url(#${body})`} />
      <Circle cx={cx} cy={cy} r={r * 0.12} fill={c} fillOpacity={0.85} />
      <Circle cx={cx} cy={cy} r={r * 1.6}  fill={`url(#${nuc})`}  />
    </Svg>
  )
}

// ─── Etched: perimeter circle + directional inner fill ──────────────────────
function EtchedOrb({ size, phase }: { size: number; phase: PhaseKey }) {
  const { accent: c, rgb, highlight } = PHASES[phase]
  const cx = size / 2
  const cy = size / 2
  const r  = size * 0.22

  const fill = `eo-f-${phase}`

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id={fill} cx="38%" cy="35%" r="50%">
          <Stop offset="0%"   stopColor={highlight} stopOpacity={0.20} />
          <Stop offset="100%" stopColor={c}          stopOpacity={0.05} />
        </RadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r}
        fill={`url(#${fill})`}
        stroke={c} strokeOpacity={0.70} strokeWidth={1}
      />
      <Circle cx={cx} cy={cy} r={0.6} fill={c} fillOpacity={0.60} />
    </Svg>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  pressable: { alignItems: 'center', justifyContent: 'center' },
})
