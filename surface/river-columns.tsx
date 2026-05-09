// surface/river-columns.tsx
// seven dashed vertical columns flowing downward at staggered speeds
// swap into index.tsx: RIVER_VARIANT = 'columns'

import React, { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet, View, Dimensions } from 'react-native'
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg'

const { width, height: h } = Dimensions.get('window')
const AnimatedPath = Animated.createAnimatedComponent(Path)

const DASH   = 5
const GAP    = 24
const PERIOD = DASH + GAP   // 29 — exact repeat, no jump on loop reset

// x in 0–100 SVG viewBox units, ph offsets give staggered visual phase
const COLS = [
  { x: 8,  op: 0.14, w: 0.44, ph: 0  },
  { x: 22, op: 0.08, w: 0.36, ph: 11 },
  { x: 38, op: 0.16, w: 0.46, ph: 26 },
  { x: 50, op: 0.06, w: 0.28, ph: 4  },  // center spine, faintest
  { x: 62, op: 0.16, w: 0.46, ph: 18 },
  { x: 78, op: 0.08, w: 0.36, ph: 35 },
  { x: 92, op: 0.14, w: 0.44, ph: 44 },
]

interface Props { phaseColor: string }

export function RiverColumns({ phaseColor }: Props) {
  const flow      = useRef(new Animated.Value(0)).current
  const mountFade = useRef(new Animated.Value(0)).current

  // derived staggered offset per column — computed once, JS-thread safe
  const offsets = useRef(
    COLS.map(col => Animated.add(flow, new Animated.Value(col.ph)))
  ).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(flow, {
        toValue: PERIOD, duration: 5500,
        easing: Easing.linear, useNativeDriver: false,
      })
    )
    anim.start()
    Animated.timing(mountFade, {
      toValue: 1, duration: 1800,
      easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start()
    return () => anim.stop()
  }, [])

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: mountFade }]} pointerEvents="none">
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg height={h} width={width} viewBox={`0 0 100 ${h}`} preserveAspectRatio="none">
          <Defs>
            {/* fade in at 15%, full to 65%, fade out at bottom */}
            <LinearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0"    stopColor={phaseColor} stopOpacity={0} />
              <Stop offset="0.15" stopColor={phaseColor} stopOpacity={1} />
              <Stop offset="0.65" stopColor={phaseColor} stopOpacity={1} />
              <Stop offset="1"    stopColor={phaseColor} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {COLS.map((col, i) => (
            <AnimatedPath
              key={i}
              d={`M${col.x} 0 L${col.x} ${h}`}
              stroke="url(#colGrad)"
              strokeWidth={col.w}
              fill="none"
              strokeLinecap="round"
              strokeOpacity={col.op}
              strokeDasharray={`${DASH} ${GAP}`}
              strokeDashoffset={offsets[i]}
            />
          ))}
        </Svg>
      </View>
    </Animated.View>
  )
}
