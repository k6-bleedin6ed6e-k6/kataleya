import React, { useEffect, useRef } from 'react'
import { Animated, Pressable, StyleSheet, View, type ViewStyle } from 'react-native'
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg'
import { PHASES, type PhaseKey } from '../constants/palettes'

const rgba = (rgb: string, a: number) => `rgba(${rgb}, ${a})`

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

export type OrbVariant = 'etched' | 'iris' | 'lung'

interface SphereOrbV2Props {
  phase: PhaseKey
  size: number
  /** speed in ms per full breath cycle. Defaults to phase-aware values. */
  speed?: number
  variant?: OrbVariant
  pressed?: boolean
  style?: ViewStyle
  onPress?: () => void
  onLongPress?: () => void
}

/**
 * SphereOrbV2 — phase-color-only, sharp-geometry orb.
 * Three visual variants matching the design canvas:
 *   - 'etched': perimeter-only circle + faint inner fill + crosshair micro-mark
 *   - 'iris':   soft radial pupil + sharp center dot (no edge stroke)
 *   - 'lung':   edgeless gaussian-style fade to background
 *
 * Animations: React Native Animated API only. No reanimated, no Skia.
 * Layout: pure SVG via react-native-svg + a <Pressable> wrapper for taps.
 */
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
  const c = theme.accent

  const phaseSpeed = {
    dawn: 14000,
    day: 10000,
    goldenHour: 8000,
    night: 22000,
  }[phase]
  const breathMs = speed ?? phaseSpeed

  const breath = useRef(new Animated.Value(0)).current
  const press = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: breathMs / 2, useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: breathMs / 2, useNativeDriver: true }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [breathMs])

  useEffect(() => {
    Animated.timing(press, {
      toValue: pressed ? 1 : 0, duration: 200, useNativeDriver: true,
    }).start()
  }, [pressed])

  const scale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] })
  const pressScale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] })
  const combined = Animated.multiply(scale, pressScale)

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}
      style={[styles.container, { width: size, height: size }, style]}>
      <Animated.View style={{ width: size, height: size, transform: [{ scale: combined }] }}>
        {variant === 'etched' && <EtchedOrb size={size} c={c} rgb={theme.rgb} />}
        {variant === 'iris'   && <IrisOrb   size={size} c={c} />}
        {variant === 'lung'   && <LungOrb   size={size} c={c} />}
      </Animated.View>
    </Pressable>
  )
}

// ─── Etched: perimeter circle + faint fill + crosshair ───
function EtchedOrb({ size, c, rgb }: { size: number; c: string; rgb: string }) {
  const cx = size / 2, cy = size / 2
  const r = size * 0.22
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={cx} cy={cy} r={r}
        fill={rgba(rgb, 0.07)} stroke={c} strokeOpacity={0.7} strokeWidth={1} />
      {/* crosshair */}
      <Circle cx={cx} cy={cy} r={0.6} fill={c} fillOpacity={0.6} />
    </Svg>
  )
}

// ─── Iris: soft radial pupil + sharp center dot ───
function IrisOrb({ size, c }: { size: number; c: string }) {
  const cx = size / 2, cy = size / 2
  const innerR = size * 0.22
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id="iris-orb-grad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor={c} stopOpacity={0.65} />
          <Stop offset="55%"  stopColor={c} stopOpacity={0.12} />
          <Stop offset="100%" stopColor={c} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={innerR * 1.6} fill="url(#iris-orb-grad)" />
      <Circle cx={cx} cy={cy} r={innerR * 0.16} fill={c} fillOpacity={0.85} />
    </Svg>
  )
}

// ─── Lung: edgeless soft fill ───
function LungOrb({ size, c }: { size: number; c: string }) {
  const cx = size / 2, cy = size / 2
  const r = size * 0.24
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id="lung-orb-grad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor={c} stopOpacity={0.55} />
          <Stop offset="40%"  stopColor={c} stopOpacity={0.22} />
          <Stop offset="80%"  stopColor={c} stopOpacity={0.02} />
          <Stop offset="100%" stopColor={c} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r * 1.6} fill="url(#lung-orb-grad)" />
    </Svg>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
})
