// components/ouroboros-ring.tsx
// sacred timekeeper — 12 luminous hour-nodes on a thread of light.
// the thread fades to shadow away from now. scars are breaks.

import React, { useMemo } from 'react'
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from 'react-native-svg'
import { PHASES, type PhaseKey } from '../constants/palettes'

interface OuroborosRingProps {
  phase: PhaseKey
  size?: number
  hour?: number
  scars?: number[] // angles in degrees
  breath?: number  // 0..1
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
  const { accent, shadow, highlight, rim } = PHASES[phase]
  const cx = size / 2
  const cy = size / 2
  const nowAngle = (hour / 24) * 360
  const R = size * 0.42

  if (variant === 'lung') {
    return (
      <SacredRing
        accent={accent} shadow={shadow} highlight={highlight} rim={rim}
        cx={cx} cy={cy} R={R} size={size}
        nowAngle={nowAngle} scars={scars} breath={breath}
      />
    )
  }

  // minimal fallback for etched/iris
  const gapDeg = variant === 'iris' ? 3 : 4
  const C = 2 * Math.PI * R
  const gapLen = (gapDeg / 360) * C
  const dashOuter = `${C - gapLen} ${gapLen}`
  const rot = nowAngle - 90

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G origin={`${cx},${cy}`} rotation={rot}>
        <Circle cx={cx} cy={cy} r={R} fill="none" stroke={accent}
          strokeOpacity={variant === 'iris' ? 0.35 : 0.50}
          strokeWidth={variant === 'iris' ? 0.7 : 1}
          strokeDasharray={dashOuter} />
      </G>
    </Svg>
  )
}

// ─── Sacred Ring ─────────────────────────────────────────────────
function SacredRing({
  accent, shadow, highlight, rim,
  cx, cy, R, size, nowAngle, scars, breath,
}: {
  accent: string; shadow: string; highlight: string; rim: string;
  cx: number; cy: number; R: number; size: number;
  nowAngle: number; scars: number[]; breath: number;
}) {
  const HOURS = 24
  const scarSet = useMemo(() => new Set(scars.map(a => Math.round(a / 15) % HOURS)), [scars])

  // now-index and nearby window
  const nowIdx = Math.round(nowAngle / 15) % HOURS
  const isNearNow = (i: number) => {
    const d = Math.min(Math.abs(i - nowIdx), HOURS - Math.abs(i - nowIdx))
    return d <= 2
  }

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id={`sr-halo-${accent}`} cx="50%" cy="50%" r="50%">
          <Stop offset="60%"  stopColor={accent} stopOpacity="0" />
          <Stop offset="82%"  stopColor={accent} stopOpacity={0.04 + breath * 0.04} />
          <Stop offset="100%" stopColor={accent} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={`sr-node-${accent}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor={rim}       stopOpacity="0.85" />
          <Stop offset="35%"  stopColor={highlight} stopOpacity="0.55" />
          <Stop offset="100%" stopColor={accent}    stopOpacity="0"    />
        </RadialGradient>
      </Defs>

      {/* ambient halo */}
      <Circle cx={cx} cy={cy} r={R + 18} fill={`url(#sr-halo-${accent})`} />

      {/* the thread — a faint ring that brightens near now */}
      <Circle cx={cx} cy={cy} r={R}
        fill="none" stroke={accent}
        strokeWidth={0.6}
        strokeOpacity={0.10 + breath * 0.06}
      />

      {/* hour nodes */}
      {Array.from({ length: HOURS }).map((_, i) => {
        const angleDeg = (i / HOURS) * 360 - 90
        const rad = (angleDeg * Math.PI) / 180
        const x = cx + Math.cos(rad) * R
        const y = cy + Math.sin(rad) * R
        const isMajor = i % 3 === 0 // every 3 hours = major node
        const near = isNearNow(i)
        const isScar = scarSet.has(i)

        if (isScar) {
          // scar = a dark break in the thread
          return (
            <Circle key={i} cx={x} cy={y} r={isMajor ? 3.5 : 2.2}
              fill={shadow} fillOpacity={0.55} />
          )
        }

        const nodeR = isMajor ? 3.2 : 1.6
        const op = near
          ? 0.65 + breath * 0.30
          : isMajor ? 0.28 + breath * 0.12 : 0.14 + breath * 0.08

        return (
          <Circle key={i} cx={x} cy={y} r={nodeR}
            fill={near ? `url(#sr-node-${accent})` : accent}
            fillOpacity={op}
          />
        )
      })}

      {/* now-arc — a bright stroke segment spanning ±2 hours */}
      {(() => {
        const startAngle = nowAngle - 30
        const endAngle = nowAngle + 30
        // SVG arc path
        const startRad = ((startAngle - 90) * Math.PI) / 180
        const endRad = ((endAngle - 90) * Math.PI) / 180
        const x1 = cx + Math.cos(startRad) * R
        const y1 = cy + Math.sin(startRad) * R
        const x2 = cx + Math.cos(endRad) * R
        const y2 = cy + Math.sin(endRad) * R
        const largeArc = endAngle - startAngle > 180 ? 1 : 0
        const d = `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`

        return (
          <G key="now-arc">
            <Path d={d} fill="none" stroke={accent}
              strokeWidth={1.4}
              strokeOpacity={0.35 + breath * 0.25}
              strokeLinecap="round" />
            {/* now-dot — the brightest point */}
            <Circle
              cx={cx + Math.cos(((nowAngle - 90) * Math.PI) / 180) * R}
              cy={cy + Math.sin(((nowAngle - 90) * Math.PI) / 180) * R}
              r={4.5}
              fill={rim}
              fillOpacity={0.75 + breath * 0.20}
            />
          </G>
        )
      })()}
    </Svg>
  )
}
