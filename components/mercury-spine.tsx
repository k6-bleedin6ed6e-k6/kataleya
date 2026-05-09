import React from 'react'
import { View, type ViewStyle } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { PHASES, type PhaseKey } from '../constants/palettes'

interface MercurySpineProps {
  phase: PhaseKey
  /** width of the host (the line is centered on width/2). */
  width: number
  /** height of the host. */
  height: number
  style?: ViewStyle
}

/**
 * MercurySpine — a 1px vertical hairline running floor-to-ceiling, centered
 * horizontally, fading in from the top and out at the bottom with a
 * brightness peak at center. Phase-colored at very low opacity.
 *
 * The only structural echo of the original `potential-orb2.svg`: the
 * vertical "river" running through the orb. Everything else from that asset
 * (caduceus, butterfly, earth, atmospheric halos) is intentionally dropped.
 *
 * Render this BEHIND the orb. It is purely decorative and accepts no input.
 *
 * No reanimated, no Skia. Pure react-native-svg + a wrapper View.
 */
export function MercurySpine({ phase, width, height, style }: MercurySpineProps) {
  const c = PHASES[phase].accent
  const id = `mercury-spine-${phase}`
  // 1px wide, centered. Use an SVG so the gradient is crisp at any DPR.
  return (
    <View
      pointerEvents="none"
      style={[{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
      }, style]}
    >
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2={String(height)} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor={c} stopOpacity={0} />
            <Stop offset="35%"  stopColor={c} stopOpacity={0.08} />
            <Stop offset="50%"  stopColor={c} stopOpacity={0.15} />
            <Stop offset="65%"  stopColor={c} stopOpacity={0.08} />
            <Stop offset="100%" stopColor={c} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect
          x={width / 2 - 0.5}
          y={0}
          width={1}
          height={height}
          fill={`url(#${id})`}
        />
      </Svg>
    </View>
  )
}
