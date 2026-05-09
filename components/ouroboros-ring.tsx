// components/ouroboros-ring.tsx
// orb halo + 24-hour time-keeper
// lung: 240 micro-ticks, brightness peaks at "now"
// etched / iris: hairline ring with rotating gap + optional scars

import React, { useMemo } from 'react'
import Svg, { Circle, Defs, G, Line, RadialGradient, Stop } from 'react-native-svg'
import { PHASES, type PhaseKey } from '../constants/palettes'

interface OuroborosRingProps {
  phase: PhaseKey
  size?: number
  hour?: number
  scars?: number[]
  breath?: number
  variant?: 'etched' | 'iris' | 'lung'
}

export function OuroborosRing({
  phase,
  size = 280,
  hour = new Date().getHours() + new Date().getMinutes() / 60,
  scars = [],
  breath = 0.5,
  variant = 'lung',
}: OuroborosRingProps) {
  const c = PHASES[phase].accent
  const cx = size / 2
  const cy = size / 2

  const nowAngle = (hour / 24) * 360
  const outerR = size * 0.42
  const innerR = size * 0.32

  if (variant === 'lung') {
    return (
      <LungRing
        c={c} cx={cx} cy={cy} size={size}
        ringR={outerR} nowAngle={nowAngle} scars={scars}
      />
    )
  }

  const gapDeg  = variant === 'iris' ? 3 : 4
  const C       = 2 * Math.PI * outerR
  const gapLen  = (gapDeg / 360) * C
  const dashOuter  = `${C - gapLen} ${gapLen}`
  const ringRotation = nowAngle - 90

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id={`ring-halo-${phase}-${variant}`} cx="50%" cy="50%" r="50%">
          <Stop offset="55%"  stopColor={c} stopOpacity="0" />
          <Stop offset="80%"  stopColor={c} stopOpacity={0.04 + breath * 0.04} />
          <Stop offset="100%" stopColor={c} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Circle cx={cx} cy={cy} r={size * 0.48} fill={`url(#ring-halo-${phase}-${variant})`} />

      <G origin={`${cx}, ${cy}`} rotation={ringRotation}>
        <Circle
          cx={cx} cy={cy} r={outerR}
          fill="none" stroke={c}
          strokeOpacity={variant === 'iris' ? 0.4 : 0.55}
          strokeWidth={variant === 'iris' ? 0.75 : 1}
          strokeDasharray={dashOuter}
        />
      </G>

      {variant === 'iris' && (
        <Circle cx={cx} cy={cy} r={innerR} fill="none"
          stroke={c} strokeOpacity={0.6} strokeWidth={0.75} />
      )}

      {scars.map((angle, i) => {
        const rad = ((angle - 90) * Math.PI) / 180
        if (variant === 'iris') {
          const r = (innerR + outerR) / 2
          return (
            <Circle key={i}
              cx={cx + Math.cos(rad) * r} cy={cy + Math.sin(rad) * r}
              r={1} fill={c} fillOpacity={0.7}
            />
          )
        }
        const x1 = cx + Math.cos(rad) * (outerR - 1)
        const y1 = cy + Math.sin(rad) * (outerR - 1)
        const x2 = cx + Math.cos(rad) * (outerR - 8)
        const y2 = cy + Math.sin(rad) * (outerR - 8)
        return (
          <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={c} strokeOpacity={0.5} strokeWidth={0.75} />
        )
      })}
    </Svg>
  )
}

function LungRing({
  c, cx, cy, size, ringR, nowAngle, scars,
}: {
  c: string; cx: number; cy: number; size: number; ringR: number;
  nowAngle: number; scars: number[];
}) {
  const TICK_COUNT = 240

  const elements = useMemo(() => {
    const nowIdx  = Math.round((nowAngle / 360) * TICK_COUNT) % TICK_COUNT
    const scarSet = new Set(
      scars.map((a) => Math.round((a / 360) * TICK_COUNT) % TICK_COUNT)
    )
    const out: React.ReactElement[] = []
    // faint guide circle so ring structure is always visible
    out.push(
      <Circle key="guide" cx={cx} cy={cy} r={ringR}
        stroke={c} strokeOpacity={0.10} strokeWidth={0.3} fill="none" />
    )
    for (let i = 0; i < TICK_COUNT; i++) {
      const angleDeg = (i / TICK_COUNT) * 360 - 90
      const rad      = (angleDeg * Math.PI) / 180
      const d        = Math.min(Math.abs(i - nowIdx), TICK_COUNT - Math.abs(i - nowIdx))
      const falloff  = Math.max(0, 1 - d / 18)
      const isScar   = scarSet.has(i)
      const opacity  = 0.12 + falloff * 0.55
      const len      = isScar ? 8 : 2.5
      const x1 = cx + Math.cos(rad) * ringR
      const y1 = cy + Math.sin(rad) * ringR
      const x2 = cx + Math.cos(rad) * (ringR + len)
      const y2 = cy + Math.sin(rad) * (ringR + len)
      out.push(
        <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={c} strokeOpacity={opacity}
          strokeWidth={isScar ? 0.9 : 0.5}
        />
      )
    }
    return out
  }, [c, cx, cy, ringR, nowAngle, scars])

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {elements}
    </Svg>
  )
}
