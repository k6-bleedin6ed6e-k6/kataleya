// surface/river-ripples.tsx
// bioluminescent interference — six concentric rings expanding from center
// each ring has its own phase, thickness, and opacity curve
// native-driver scale + opacity, SVG stroke for crisp edges

import React, { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet, View, Dimensions } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

const { width, height } = Dimensions.get('window')

const BASE_SIZE = 120
const MAX_SCALE = Math.hypot(width, height) / BASE_SIZE

const RINGS = [
  { delay: 0.00, thickness: 1.0,  peakOp: 0.18 },
  { delay: 0.18, thickness: 0.75, peakOp: 0.14 },
  { delay: 0.36, thickness: 0.55, peakOp: 0.11 },
  { delay: 0.52, thickness: 0.85, peakOp: 0.15 },
  { delay: 0.68, thickness: 0.45, peakOp: 0.09 },
  { delay: 0.84, thickness: 0.60, peakOp: 0.10 },
]

const DURATION = 6400

interface Props { phaseColor: string }

function RippleRing({ phaseColor, delay, thickness, peakOp }: {
  phaseColor: string
  delay: number
  thickness: number
  peakOp: number
}) {
  const progress = useRef(new Animated.Value(delay)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: delay + 1,
        duration: DURATION,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )
    loop.start()
    return () => loop.stop()
  }, [])

  const scale = progress.interpolate({
    inputRange: [delay, delay + 0.30, delay + 1],
    outputRange: [0.35, MAX_SCALE * 0.80, MAX_SCALE],
    extrapolate: 'clamp',
  })

  const opacity = progress.interpolate({
    inputRange: [delay, delay + 0.06, delay + 0.45, delay + 0.75, delay + 1],
    outputRange: [0, peakOp, peakOp * 0.55, peakOp * 0.18, 0],
    extrapolate: 'clamp',
  })

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: BASE_SIZE,
          height: BASE_SIZE,
          borderRadius: BASE_SIZE / 2,
          borderColor: phaseColor,
          borderWidth: thickness,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  )
}

export function RiverRipples({ phaseColor }: Props) {
  const mountFade = useRef(new Animated.Value(0)).current
  const centerPulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(mountFade, {
      toValue: 1,
      duration: 2600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start()

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(centerPulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(centerPulse, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [])

  const centerScale = centerPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.6],
  })
  const centerOp = centerPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.08],
  })

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: mountFade }]} pointerEvents="none">
      {/* center source dot */}
      <View style={styles.anchor} pointerEvents="none">
        <Animated.View
          style={{
            position: 'absolute',
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: phaseColor,
            transform: [{ scale: centerScale }],
            opacity: centerOp,
          }}
        />
        {RINGS.map((r, i) => (
          <RippleRing
            key={i}
            phaseColor={phaseColor}
            delay={r.delay}
            thickness={r.thickness}
            peakOp={r.peakOp}
          />
        ))}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    top: height * 0.48,
    left: width / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
})
