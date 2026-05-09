// surface/river-ripples.tsx
// four concentric expanding rings, staggered phase, native driver
// swap into index.tsx: RIVER_VARIANT = 'ripples'

import React, { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet, View, Dimensions } from 'react-native'

const { width, height } = Dimensions.get('window')

const BASE_SIZE  = 140
const MAX_SCALE  = Math.hypot(width, height) / BASE_SIZE

const RINGS = [
  { delay: 0 },
  { delay: 0.25 },
  { delay: 0.50 },
  { delay: 0.75 },
]

const DURATION = 5800

interface Props { phaseColor: string }

function RippleRing({ phaseColor, delay }: { phaseColor: string; delay: number }) {
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
    inputRange: [delay, delay + 0.35, delay + 1],
    outputRange: [0.5, MAX_SCALE * 0.85, MAX_SCALE],
    extrapolate: 'clamp',
  })

  const opacity = progress.interpolate({
    inputRange: [delay, delay + 0.08, delay + 0.55, delay + 1],
    outputRange: [0, 0.18, 0.06, 0],
    extrapolate: 'clamp',
  })

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width:  BASE_SIZE,
          height: BASE_SIZE,
          borderRadius: BASE_SIZE / 2,
          borderColor: phaseColor,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  )
}

export function RiverRipples({ phaseColor }: Props) {
  const mountFade = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(mountFade, {
      toValue: 1, duration: 2200,
      easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start()
  }, [])

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: mountFade }]} pointerEvents="none">
      <View style={styles.anchor} pointerEvents="none">
        {RINGS.map((r, i) => (
          <RippleRing key={i} phaseColor={phaseColor} delay={r.delay} />
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
    borderWidth: 0.6,
  },
})
