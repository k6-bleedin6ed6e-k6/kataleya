// components/ouroboros-ring.tsx
// sacred time-keeper — 240-tick outer ring, 60-dot whisper ring, scar notches, now-comet.
// the ring breathes. the now-marker glows. scars are absences, not additions.

import React, { useMemo } from 'react'
import Svg, { Circle, Defs, G, Line, Polygon, RadialGradient, Stop } from 'react-native-svg'
import { PHASES, type PhaseKey } from '../constants/palettes'

interface OuroborosRingProps {
  phase: PhaseKey
  size?: number
  hour?: number
  scars?: number[] // angles in degrees
  breath?: number  // 0..1 animated breath value
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

  if (variant === 'lung') {
    return (
      <LungRing
        c={c} cx={cx} cy={cy} size={size}
        ringR={size * 0.42} nowAngle={nowAngle} scars={scars}
        breath={breath}
      />
    )
  }

  // fallback: minimal hairline ring for etched/iris
  const gapDeg = variant === 'iris' ? 3 : 4
  const outerR = size * 0.42
  const C = 2 * Math.PI * outerR
  const gapLen = (gapDeg / 360) * C
  const dashOuter = `${C - gapLen} ${gapLen}`
  const ringRotation = nowAngle - 90

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id={`ring-halo-${phase}-${variant}`} cx="50%" cy="50%" r="50%">
          <Stop offset="55%" stopColor={c} stopOpacity="0" />
          <Stop offset="80%" stopColor={c} stopOpacity={0.04 + breath * 0.04} />
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
        <Circle cx={cx} cy={cy} r={size * 0.32} fill="none"
          stroke={c} strokeOpacity={0.6} strokeWidth={0.75} />
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------
// Lung variant — the full sacred ring
// ------------------------------------------------------------------
function LungRing({
  c, cx, cy, size, ringR, nowAngle, scars, breath,
}: {
  c: string; cx: number; cy: number; size: number; ringR: number;
  nowAngle: number; scars: number[]; breath: number;
}) {
  const TICK_COUNT = 240
  const WHISPER_COUNT = 60

  const elements = useMemo(() => {
    const out: React.ReactElement[] = []
    const scarSet = new Set(scars.map((a) => Math.round((a / 360) * TICK_COUNT) % TICK_COUNT))
    const nowIdx = Math.round((nowAngle / 360) * TICK_COUNT) % TICK_COUNT

    // --- outer guide ring (very faint structure) ---
    out.push(
      <Circle key="guide" cx={cx} cy={cy} r={ringR}
        stroke={c} strokeOpacity={0.08} strokeWidth={0.4} fill="none" />
    )

    // --- whisper ring: 60 micro-dots inside ---
    const whisperR = ringR * 0.72
    for (let i = 0; i < WHISPER_COUNT; i++) {
      const angleDeg = (i / WHISPER_COUNT) * 360 - 90
      const rad = (angleDeg * Math.PI) / 180
      const isMajor = i % 5 === 0
      out.push(
        <Circle
          key={`w-${i}`}
          cx={cx + Math.cos(rad) * whisperR}
          cy={cy + Math.sin(rad) * whisperR}
          r={isMajor ? 0.9 : 0.45}
          fill={c}
          fillOpacity={isMajor ? 0.18 : 0.07}
        />
      )
    }

    // --- outer ticks: 240 ---
    for (let i = 0; i < TICK_COUNT; i++) {
      const angleDeg = (i / TICK_COUNT) * 360 - 90
      const rad = (angleDeg * Math.PI) / 180
      const d = Math.min(Math.abs(i - nowIdx), TICK_COUNT - Math.abs(i - nowIdx))

      // major = every 10 ticks (1 hour)
      const isMajor = i % 10 === 0
      // scar = gap/notch
      const isScar = scarSet.has(i)

      // falloff from now: sharp peak, gentle tail
      const falloff = Math.max(0, 1 - d / 14)
      const timeGlow = 0.10 + falloff * (0.45 + breath * 0.20)

      // base tick length varies by proximity to now and major/minor
      let len = isMajor ? 5.5 : 2.2
      len += falloff * 4.5 // longer near now

      // thickness
      let sw = isMajor ? 0.8 : 0.45
      sw += falloff * 0.5

      if (isScar) {
        // scar = a notch: two short strokes bracketing a gap
        const notchGap = 3.5
        const notchLen = 5
        const innerR = ringR - 1
        const outerR1 = ringR + notchLen
        // left notch
        const radL = ((angleDeg - notchGap / 2) * Math.PI) / 180
        const radR = ((angleDeg + notchGap / 2) * Math.PI) / 180
        out.push(
          <Line key={`s-${i}-l`}
            x1={cx + Math.cos(radL) * innerR} y1={cy + Math.sin(radL) * innerR}
            x2={cx + Math.cos(radL) * outerR1} y2={cy + Math.sin(radL) * outerR1}
            stroke={c} strokeOpacity={0.45} strokeWidth={0.9} strokeLinecap="round" />
        )
        out.push(
          <Line key={`s-${i}-r`}
            x1={cx + Math.cos(radR) * innerR} y1={cy + Math.sin(radR) * innerR}
            x2={cx + Math.cos(radR) * outerR1} y2={cy + Math.sin(radR) * outerR1}
            stroke={c} strokeOpacity={0.45} strokeWidth={0.9} strokeLinecap="round" />
        )
        continue
      }

      const x1 = cx + Math.cos(rad) * ringR
      const y1 = cy + Math.sin(rad) * ringR
      const x2 = cx + Math.cos(rad) * (ringR + len)
      const y2 = cy + Math.sin(rad) * (ringR + len)

      out.push(
        <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={c} strokeOpacity={timeGlow}
          strokeWidth={sw} strokeLinecap="round" />
      )
    }

    // --- now-marker: a small glowing diamond ---
    const nowRad = ((nowAngle - 90) * Math.PI) / 180
    const nowX = cx + Math.cos(nowRad) * (ringR + 10)
    const nowY = cy + Math.sin(nowRad) * (ringR + 10)
    const diamondSize = 3.2
    // diamond points: top, right, bottom, left
    const points = [
      `${nowX},${nowY - diamondSize}`,
      `${nowX + diamondSize * 0.7},${nowY}`,
      `${nowX},${nowY + diamondSize}`,
      `${nowX - diamondSize * 0.7},${nowY}`,
    ].join(' ')

    out.push(
      <Polygon key="now-diamond" points={points}
        fill={c} fillOpacity={0.75 + breath * 0.2} />
    )

    // now-marker subtle halo ring
    out.push(
      <Circle key="now-halo" cx={nowX} cy={nowY} r={5.5}
        fill="none" stroke={c} strokeOpacity={0.18 + breath * 0.1}
        strokeWidth={0.6} />
    )

    // --- comet tail: 6 ticks trailing behind now, fading ---
    for (let t = 1; t <= 6; t++) {
      const trailIdx = (nowIdx - t + TICK_COUNT) % TICK_COUNT
      const trailAngleDeg = (trailIdx / TICK_COUNT) * 360 - 90
      const trailRad = (trailAngleDeg * Math.PI) / 180
      const trailOpacity = (0.22 - t * 0.035) * (0.6 + breath * 0.4)
      const trailLen = 3.5 + (6 - t) * 0.6
      const tx1 = cx + Math.cos(trailRad) * ringR
      const ty1 = cy + Math.sin(trailRad) * ringR
      const tx2 = cx + Math.cos(trailRad) * (ringR + trailLen)
      const ty2 = cy + Math.sin(trailRad) * (ringR + trailLen)
      out.push(
        <Line key={`trail-${t}`} x1={tx1} y1={ty1} x2={tx2} y2={ty2}
          stroke={c} strokeOpacity={Math.max(0, trailOpacity)}
          strokeWidth={0.6} strokeLinecap="round" />
      )
    }

    return out
  }, [c, cx, cy, ringR, nowAngle, scars, breath])

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {elements}
    </Svg>
  )
}
