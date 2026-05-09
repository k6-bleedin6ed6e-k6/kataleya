// components/garden-presence.tsx
// one organism — seed, braided spine, veined wings, fracture scars
// everything is the phase color at different opacities. the phase IS the atmosphere.

import React, { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Circle, Defs, Line, LinearGradient as SvgGrad, Path, RadialGradient, Stop } from 'react-native-svg'
import { getBreathTechnique, type BreathTechnique } from '../utils/storage'

const { width: W, height: H } = Dimensions.get('window')
const CX = W / 2
const CY = H * 0.42
const SEED_R = 150 // half-width of seed glow area

// ─── phase → one color ────────────────────────────────────────────
const PHASE_COLOR: Record<string, string> = {
  void:   '#8090b0',
  dawn:   '#d4a574',
  day:    '#8fb8a8',
  golden: '#c9a959',
}

export type Phase = 'void' | 'dawn' | 'day' | 'golden'

// ─── wing paths — four lobes anchored at seed center ─────────────
// Forewings are larger and more angular. Hindwings are softer.
// Each wing defines: outer shape (fill), leading edge (stroke), veins (thin strokes)

// Left forewing
const W_LF_OUTER = `M ${CX} ${CY}
  C ${CX-30} ${CY-90} ${CX-110} ${CY-130} ${CX-175} ${CY-75}
  C ${CX-190} ${CY-45} ${CX-170} ${CY-15} ${CX-130} ${CY-5}
  C ${CX-90} ${CY+5} ${CX-50} ${CY-10} ${CX} ${CY}`

const W_LF_LEADING = `M ${CX} ${CY}
  C ${CX-30} ${CY-90} ${CX-110} ${CY-130} ${CX-175} ${CY-75}`

const W_LF_VEIN1 = `M ${CX-20} ${CY-15} C ${CX-70} ${CY-45} ${CX-120} ${CY-55} ${CX-165} ${CY-70}`
const W_LF_VEIN2 = `M ${CX-15} ${CY-8} C ${CX-60} ${CY-20} ${CX-110} ${CY-25} ${CX-150} ${CY-30}`

// Right forewing
const W_RF_OUTER = `M ${CX} ${CY}
  C ${CX+30} ${CY-90} ${CX+110} ${CY-130} ${CX+175} ${CY-75}
  C ${CX+190} ${CY-45} ${CX+170} ${CY-15} ${CX+130} ${CY-5}
  C ${CX+90} ${CY+5} ${CX+50} ${CY-10} ${CX} ${CY}`

const W_RF_LEADING = `M ${CX} ${CY}
  C ${CX+30} ${CY-90} ${CX+110} ${CY-130} ${CX+175} ${CY-75}`

const W_RF_VEIN1 = `M ${CX+20} ${CY-15} C ${CX+70} ${CY-45} ${CX+120} ${CY-55} ${CX+165} ${CY-70}`
const W_RF_VEIN2 = `M ${CX+15} ${CY-8} C ${CX+60} ${CY-20} ${CX+110} ${CY-25} ${CX+150} ${CY-30}`

// Left hindwing
const W_LH_OUTER = `M ${CX} ${CY}
  C ${CX-35} ${CY+25} ${CX-90} ${CY+70} ${CX-130} ${CY+75}
  C ${CX-155} ${CY+78} ${CX-160} ${CY+55} ${CX-140} ${CY+40}
  C ${CX-100} ${CY+15} ${CX-60} ${CY+10} ${CX} ${CY}`

const W_LH_VEIN1 = `M ${CX-20} ${CY+12} C ${CX-60} ${CY+30} ${CX-100} ${CY+45} ${CX-130} ${CY+55}`

// Right hindwing
const W_RH_OUTER = `M ${CX} ${CY}
  C ${CX+35} ${CY+25} ${CX+90} ${CY+70} ${CX+130} ${CY+75}
  C ${CX+155} ${CY+78} ${CX+160} ${CY+55} ${CX+140} ${CY+40}
  C ${CX+100} ${CY+15} ${CX+60} ${CY+10} ${CX} ${CY}`

const W_RH_VEIN1 = `M ${CX+20} ${CY+12} C ${CX+60} ${CY+30} ${CX+100} ${CY+45} ${CX+130} ${CY+55}`

// ─── braided spine — five strands rising from below ──────────────
const SPINE_PATHS = [
  // central spine
  `M ${CX} ${H} Q ${CX} ${H * 0.58} ${CX} ${CY}`,
  // left serpent outer
  `M ${CX - 48} ${H} C ${CX - 45} ${H * 0.82} ${CX - 22} ${H * 0.65} ${CX - 12} ${H * 0.52}
   S ${CX - 18} ${H * 0.32} ${CX - 8} ${H * 0.20} S ${CX - 4} ${H * 0.10} ${CX} ${CY}`,
  // right serpent outer
  `M ${CX + 48} ${H} C ${CX + 45} ${H * 0.82} ${CX + 22} ${H * 0.65} ${CX + 12} ${H * 0.52}
   S ${CX + 18} ${H * 0.32} ${CX + 8} ${H * 0.20} S ${CX + 4} ${H * 0.10} ${CX} ${CY}`,
  // left faint tertiary
  `M ${CX - 28} ${H} Q ${CX - 18} ${H * 0.62} ${CX - 5} ${CY}`,
  // right faint tertiary
  `M ${CX + 28} ${H} Q ${CX + 18} ${H * 0.62} ${CX + 5} ${CY}`,
]

// ─── fracture scars — short angled line segments ─────────────────
// Each scar is 2-3 short lines radiating from a center, like a crack or stitch
const SCARS = [
  { cx: CX - 95,  cy: CY - 72,  a: -30 },
  { cx: CX - 128, cy: CY - 50,  a: 15 },
  { cx: CX - 100, cy: CY - 92,  a: -60 },
  { cx: CX - 88,  cy: CY + 60,  a: 45 },
  { cx: CX + 95,  cy: CY - 72,  a: 30 },
  { cx: CX + 128, cy: CY - 50,  a: -15 },
  { cx: CX + 100, cy: CY - 92,  a: 60 },
  { cx: CX + 88,  cy: CY + 60,  a: -45 },
]

function scarLines(cx: number, cy: number, angleDeg: number, color: string, active: boolean) {
  const rad = (angleDeg * Math.PI) / 180
  const len = active ? 5.5 : 3.2
  const opacity = active ? 0.55 : 0.08
  const sw = active ? 1.1 : 0.5
  const out: React.ReactElement[] = []

  // main crack
  const dx = Math.cos(rad) * len
  const dy = Math.sin(rad) * len
  out.push(
    <Line key="m" x1={cx - dx} y1={cy - dy} x2={cx + dx} y2={cy + dy}
      stroke={color} strokeWidth={sw} strokeOpacity={opacity} strokeLinecap="round" />
  )

  // secondary fracture at ~60° offset
  if (active) {
    const rad2 = ((angleDeg + 60) * Math.PI) / 180
    const len2 = len * 0.55
    const dx2 = Math.cos(rad2) * len2
    const dy2 = Math.sin(rad2) * len2
    out.push(
      <Line key="s" x1={cx} y1={cy} x2={cx + dx2} y2={cy + dy2}
        stroke={color} strokeWidth={0.7} strokeOpacity={opacity * 0.6} strokeLinecap="round" />
    )
  }

  return out
}

// ─── breath timing (ms per half-cycle) ───────────────────────────
function fastDuration(t: BreathTechnique): number {
  if (t === '4-7-8') return 9500
  if (t === 'box')   return 4000
  return 5500  // resonant
}

// ─── props ────────────────────────────────────────────────────────
interface Props {
  phase: Phase
  phrase?: string | null
  isGrace?: boolean
  onPress?: () => void
  onLongPress?: () => void
}

export function GardenPresence({ phase, phrase, isGrace = false, onPress, onLongPress }: Props) {
  const color = PHASE_COLOR[phase] ?? PHASE_COLOR.dawn

  // ── three-layer breath ────────────────────────────────────────
  const bSlow = useRef(new Animated.Value(0)).current
  const bMid  = useRef(new Animated.Value(0)).current
  const bFast = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(bSlow, { toValue: 1, duration: 11000, useNativeDriver: true }),
      Animated.timing(bSlow, { toValue: 0, duration: 11000, useNativeDriver: true }),
    ]))
    a.start()
    return () => a.stop()
  }, [])

  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(bMid, { toValue: 1, duration: 7000, useNativeDriver: true }),
      Animated.timing(bMid, { toValue: 0, duration: 7000, useNativeDriver: true }),
    ]))
    a.start()
    return () => a.stop()
  }, [])

  const [technique, setTechnique] = useState<BreathTechnique>('resonant')
  useEffect(() => { getBreathTechnique().then(setTechnique) }, [])
  useEffect(() => {
    const dur = fastDuration(technique)
    const a = Animated.loop(Animated.sequence([
      Animated.timing(bFast, { toValue: 1, duration: dur, useNativeDriver: true }),
      Animated.timing(bFast, { toValue: 0, duration: dur, useNativeDriver: true }),
    ]))
    a.start()
    return () => a.stop()
  }, [technique])

  // ── scar pulse — state only, SVG re-renders every 1.6s ────────
  const [scarActive, setScarActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setScarActive(i => (i + 1) % SCARS.length), 1600)
    return () => clearInterval(t)
  }, [])

  // ── press feedback ────────────────────────────────────────────
  const press = useRef(new Animated.Value(0)).current
  const onIn  = () => Animated.timing(press, { toValue: 1, duration: 120, useNativeDriver: true }).start()
  const onOut = () => Animated.timing(press, { toValue: 0, duration: 220, useNativeDriver: true }).start()

  // ── interpolations ────────────────────────────────────────────
  const hazeScale   = bSlow.interpolate({ inputRange: [0, 1], outputRange: [1.00, 1.38] })
  const hazeOpacity = bSlow.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.14] })
  const atmOpacity  = bSlow.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.22] })

  const ringScale   = bMid.interpolate({ inputRange: [0, 1], outputRange: [1.00, 1.20] })
  const ringOpacity = bMid.interpolate({ inputRange: [0, 1], outputRange: [0.09, 0.24] })

  const seedScale   = bFast.interpolate({ inputRange: [0, 1], outputRange: [1.00, 1.11] })
  const seedOpacity = bFast.interpolate({ inputRange: [0, 1], outputRange: [0.70, 0.96] })
  const pressScale  = press.interpolate({ inputRange: [0, 1], outputRange: [1.00, 0.90] })
  const coreScale   = Animated.multiply(seedScale, pressScale)

  const seedR = 40 // radius of the actual seed body

  return (
    <View style={styles.root}>

      {/* ── atmosphere ─────────────────────────────────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: atmOpacity }]}>
        <LinearGradient
          colors={[`${color}1a`, 'transparent', `${color}0d`]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* ── spine + wings + scars — one SVG layer, behind seed ─── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={W} height={H}>
          <Defs>
            <SvgGrad id="sp" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0"    stopColor={color} stopOpacity="0"    />
              <Stop offset="0.30" stopColor={color} stopOpacity="0.13" />
              <Stop offset="0.65" stopColor={color} stopOpacity="0.06" />
              <Stop offset="1"    stopColor={color} stopOpacity="0"    />
            </SvgGrad>
            <SvgGrad id="wingGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0"    stopColor={color} stopOpacity="0.10" />
              <Stop offset="0.45" stopColor={color} stopOpacity="0.04" />
              <Stop offset="1"    stopColor={color} stopOpacity="0.01" />
            </SvgGrad>
          </Defs>

          {/* braided spine — five strands */}
          {SPINE_PATHS.map((d, i) => (
            <Path key={`sp-${i}`} d={d}
              stroke="url(#sp)" strokeWidth={i === 0 ? 1.0 : 0.7} fill="none" strokeLinecap="round"
              strokeOpacity={i > 2 ? 0.5 : 1} />
          ))}

          {/* wing fills — shape definition, very faint */}
          <Path d={W_LF_OUTER} fill="url(#wingGrad)" opacity={0.55} />
          <Path d={W_RF_OUTER} fill="url(#wingGrad)" opacity={0.55} />
          <Path d={W_LH_OUTER} fill="url(#wingGrad)" opacity={0.45} />
          <Path d={W_RH_OUTER} fill="url(#wingGrad)" opacity={0.45} />

          {/* wing leading edges — sharp, give the wings their form */}
          <Path d={W_LF_LEADING} stroke={color} strokeWidth="0.6" fill="none" opacity={0.16} strokeLinecap="round" />
          <Path d={W_RF_LEADING} stroke={color} strokeWidth="0.6" fill="none" opacity={0.16} strokeLinecap="round" />

          {/* wing veins — internal structure */}
          <Path d={W_LF_VEIN1} stroke={color} strokeWidth="0.35" fill="none" opacity={0.10} strokeLinecap="round" />
          <Path d={W_LF_VEIN2} stroke={color} strokeWidth="0.35" fill="none" opacity={0.08} strokeLinecap="round" />
          <Path d={W_RF_VEIN1} stroke={color} strokeWidth="0.35" fill="none" opacity={0.10} strokeLinecap="round" />
          <Path d={W_RF_VEIN2} stroke={color} strokeWidth="0.35" fill="none" opacity={0.08} strokeLinecap="round" />
          <Path d={W_LH_VEIN1} stroke={color} strokeWidth="0.35" fill="none" opacity={0.09} strokeLinecap="round" />
          <Path d={W_RH_VEIN1} stroke={color} strokeWidth="0.35" fill="none" opacity={0.09} strokeLinecap="round" />

          {/* fracture scars — pulse one at a time */}
          {SCARS.map((s, i) => (
            <React.Fragment key={i}>
              {scarLines(s.cx, s.cy, s.a, color, scarActive === i)}
            </React.Fragment>
          ))}
        </Svg>
      </View>

      {/* ── seed — layered membrane with internal light ─────────── */}
      <View style={[styles.seedOuter, { top: CY - SEED_R, left: CX - SEED_R }]}>

        {/* outermost haze — slowest, nearly invisible, vast */}
        <Animated.View style={[
          styles.glow,
          {
            top: 0, left: 0,
            width: SEED_R * 2, height: SEED_R * 2, borderRadius: SEED_R,
            backgroundColor: color,
            transform: [{ scale: hazeScale }],
            opacity: hazeOpacity,
          },
        ]} />

        {/* middle ring — medium speed, medium reach */}
        <Animated.View style={[
          styles.glow,
          {
            top: 60, left: 60,
            width: 180, height: 180, borderRadius: 90,
            backgroundColor: color,
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
          },
        ]} />

        {/* seed body — SVG membrane with internal structure */}
        <Pressable
          style={styles.seedPressable}
          onPressIn={onIn}
          onPressOut={onOut}
          onPress={onPress}
          onLongPress={onLongPress}
          delayLongPress={800}
        >
          <Animated.View
            style={[
              styles.seedBody,
              {
                transform: [{ scale: coreScale }],
                opacity: seedOpacity,
                shadowColor: color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.75,
                shadowRadius: 38,
              },
            ]}
          >
            <Svg width={seedR * 2} height={seedR * 2} viewBox={`0 0 ${seedR * 2} ${seedR * 2}`}>
              <Defs>
                <RadialGradient id="seedCore" cx="50%" cy="45%" r="50%">
                  <Stop offset="0%"   stopColor={color} stopOpacity="0.85" />
                  <Stop offset="35%"  stopColor={color} stopOpacity="0.45" />
                  <Stop offset="70%"  stopColor={color} stopOpacity="0.15" />
                  <Stop offset="100%" stopColor={color} stopOpacity="0.05" />
                </RadialGradient>
                <RadialGradient id="seedRim" cx="50%" cy="50%" r="50%">
                  <Stop offset="75%"  stopColor={color} stopOpacity="0"    />
                  <Stop offset="88%"  stopColor={color} stopOpacity="0.25" />
                  <Stop offset="100%" stopColor={color} stopOpacity="0.55" />
                </RadialGradient>
                <RadialGradient id="seedInner" cx="50%" cy="48%" r="42%">
                  <Stop offset="0%"   stopColor="#ffffff" stopOpacity="0.35" />
                  <Stop offset="40%"  stopColor={color}    stopOpacity="0.20" />
                  <Stop offset="100%" stopColor={color}    stopOpacity="0"    />
                </RadialGradient>
              </Defs>

              {/* base membrane */}
              <Circle cx={seedR} cy={seedR} r={seedR - 0.5} fill="url(#seedCore)" />
              {/* rim catch-light */}
              <Circle cx={seedR} cy={seedR} r={seedR - 0.5} fill="url(#seedRim)" />
              {/* inner bright nucleus — offset slightly up-left */}
              <Circle cx={seedR - 6} cy={seedR - 8} r={seedR * 0.42} fill="url(#seedInner)" />
              {/* thin rim stroke */}
              <Circle cx={seedR} cy={seedR} r={seedR - 1.5} fill="none"
                stroke={color} strokeWidth="0.6" strokeOpacity="0.35" />
            </Svg>
          </Animated.View>
        </Pressable>

      </View>

      {/* seed label */}
      <Text style={[styles.label, { color: `${color}60`, top: CY + 64 }]}>
        {isGrace ? 'returning' : 'seed'}
      </Text>

      {/* phrase */}
      {phrase && (
        <View style={styles.phraseWrap}>
          <Text style={[styles.phrase, { color: `${color}bb` }]}>{phrase}</Text>
        </View>
      )}

    </View>
  )
}


const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seedOuter: {
    position: 'absolute',
    width: SEED_R * 2,
    height: SEED_R * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: 9999,
  },
  seedPressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  seedBody: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: 'Courier Prime',
    fontSize: 11,
    letterSpacing: 2,
  },
  phraseWrap: {
    position: 'absolute',
    bottom: H * 0.18,
    left: 32,
    right: 32,
    alignItems: 'center',
  },
  phrase: {
    fontFamily: 'Courier Prime',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 24,
  },
})
