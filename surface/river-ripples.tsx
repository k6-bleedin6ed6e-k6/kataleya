// surface/river-ripples.tsx
// two soft pulses from center — a heartbeat you feel more than see.

import React, { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet, View, Dimensions } from 'react-native'

const { width, height } = Dimensions.get('window')

const BASE_SIZE = 160
const MAX_SCALE = Math.hypot(width, height) / BASE_SIZE

interface Props { phaseColor: string }

function Pulse({ phaseColor, delay }: { phaseColor: string; delay: number }) {
  const progress = useRef(new Animated.Value(delay)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: delay + 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )
    loop.start()
    return () => loop.stop()
  }, [])

  const scale = progress.interpolate({
    inputRange: [delay, delay + 0.30, delay + 1],
    outputRange: [0.4, MAX_SCALE * 0.75, MAX_SCALE],
    extrapolate: 'clamp',
  })

  const opacity = progress.interpolate({
    inputRange: [delay, delay + 0.05, delay + 0.50, delay + 0.80, delay + 1],
    outputRange: [0, 0.14, 0.08, 0.03, 0],
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
          borderWidth: 0.8,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  )
}

export function RiverRipples({ phaseColor }: Props) {
  const fade = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 2800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start()
  }, [])

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]} pointerEvents="none">
      <View style={styles.anchor} pointerEvents="none">
        <Pulse phaseColor={phaseColor} delay={0} />
        <Pulse phaseColor={phaseColor} delay={0.5} />
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
