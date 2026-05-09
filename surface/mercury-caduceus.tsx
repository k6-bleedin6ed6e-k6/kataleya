// surface/mercury-caduceus.tsx
// two slow rivers of light rising from below — barely visible.
// the garden breathes upward even when you are not looking.

import React, { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet, View, Dimensions } from 'react-native'
import Svg, { Path } from 'react-native-svg'

const { width, height: h } = Dimensions.get('window')
const AnimatedPath = Animated.createAnimatedComponent(Path)

interface MercuryCaduceusProps {
  phaseColor: string
  flowDuration?: number
}

const LEFT_PATH  = `M42 ${h} C 70 ${h * 0.86}, 66 ${h * 0.70}, 42 ${h * 0.55} S 14 ${h * 0.40}, 42 ${h * 0.25} S 72 ${h * 0.10}, 44 0`
const RIGHT_PATH = `M58 ${h} C 30 ${h * 0.86}, 34 ${h * 0.70}, 58 ${h * 0.55} S 86 ${h * 0.40}, 58 ${h * 0.25} S 28 ${h * 0.10}, 56 0`

export function MercuryCaduceus({ phaseColor, flowDuration = 9000 }: MercuryCaduceusProps) {
  const flow = useRef(new Animated.Value(0)).current
  const fade = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const DASH = 14
    const GAP = 52
    const period = DASH + GAP

    const anim = Animated.loop(
      Animated.timing(flow, {
        toValue: period,
        duration: flowDuration,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    )
    anim.start()

    Animated.timing(fade, {
      toValue: 1,
      duration: 3000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start()

    return () => anim.stop()
  }, [flowDuration])

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]} pointerEvents="none">
      <Svg height={h} width={width} viewBox={`0 0 100 ${h}`} preserveAspectRatio="none">
        <AnimatedPath
          d={LEFT_PATH}
          stroke={phaseColor}
          strokeWidth="0.6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="14 52"
          strokeDashoffset={flow}
          strokeOpacity={0.10}
        />
        <AnimatedPath
          d={RIGHT_PATH}
          stroke={phaseColor}
          strokeWidth="0.6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="18 48"
          strokeDashoffset={flow}
          strokeOpacity={0.08}
        />
      </Svg>
    </Animated.View>
  )
}
