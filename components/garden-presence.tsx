// components/garden-presence.tsx
// a living organism — one light source, three depths, one breath.
//
// depth 3 (back)    : ambient wash — the room breathes
// depth 2 (middle)  : spine + wings — structure made of light
// depth 1 (front)   : seed — the conscious center
//
// nothing is drawn. everything is lit.

import React, { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg'
import { PHASES, type PhaseKey } from '../constants/palettes'
import { getBreathTechnique, type BreathTechnique } from '../utils/storage'

const { width: W, height: H } = Dimensions.get('window')
const CX = W / 2
const CY = H * 0.42

// PhaseKey → PresencePhase (garden uses 'void' for night)
export type Phase = 'void' | 'dawn' | 'day' | 'golden'
const toPresencePhase = (phase: PhaseKey): Phase => {
  if (phase === 'night') return 'void'
  if (phase === 'goldenHour') return 'golden'
  return phase as 'dawn' | 'day'
}

const phaseColor = (phase: Phase): string => {
  const map: Record<string, string> = {
    void: '#8090b0', dawn: '#d4a574', day: '#8fb8a8', golden: '#c9a959',
  }
  return map[phase] ?? map.dawn
}

function fastDuration(t: BreathTechnique): number {
  if (t === '4-7-8') return 9500
  if (t === 'box')   return 4000
  return 5500
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
  const color   = phaseColor(phase)
  const palette = PHASES[phase === 'void' ? 'night' : phase === 'golden' ? 'goldenHour' : phase]
  const { accent, shadow, highlight, ambient, rim } = palette

  // ── three breaths, one organism ───────────────────────────────
  const bSlow = useRef(new Animated.Value(0)).current // 11s — the room
  const bMid  = useRef(new Animated.Value(0)).current // 7s  — the body
  const bFast = useRef(new Animated.Value(0)).current // technique — the heart

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

  // ── scar pulse — one glows at a time ──────────────────────────
  const [scarIdx, setScarIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setScarIdx(i => (i + 1) % 4), 2000)
    return () => clearInterval(t)
  }, [])

  // ── press feedback ────────────────────────────────────────────
  const press = useRef(new Animated.Value(0)).current
  const onIn  = () => Animated.timing(press, { toValue: 1, duration: 120, useNativeDriver: true }).start()
  const onOut = () => Animated.timing(press, { toValue: 0, duration: 220, useNativeDriver: true }).start()

  // ── interpolations ────────────────────────────────────────────
  const roomScale   = bSlow.interpolate({ inputRange: [0, 1], outputRange: [1.00, 1.25] })
  const roomOpacity = bSlow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.65] })

  const wingScale   = bMid.interpolate({ inputRange: [0, 1], outputRange: [1.00, 1.08] })
  const wingOpacity = bMid.interpolate({ inputRange: [0, 1], outputRange: [0.40, 0.72] })

  const seedScale   = bFast.interpolate({ inputRange: [0, 1], outputRange: [1.00, 1.06] })
  const seedGlow    = bFast.interpolate({ inputRange: [0, 1], outputRange: [0.60, 1.00] })
  const pressScale  = press.interpolate({ inputRange: [0, 1], outputRange: [1.00, 0.92] })
  const coreScale   = Animated.multiply(seedScale, pressScale)

  const SEED_R = 44 // membrane body radius

  return (
    <View style={styles.root}>

      {/* ════════════════════════════════════════════════════════
          DEPTH 3 — ambient wash
          a vast soft field that breathes with the room
      ════════════════════════════════════════════════════════ */}
      <Animated.View style={[StyleSheet.absoluteFill, {
        opacity: roomOpacity,
        transform: [{ scale: roomScale }],
      }]} pointerEvents="none">
        <RadialGradientRN
          colors={[`${accent}18`, `${ambient}40`, 'transparent']}
          stops={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* ════════════════════════════════════════════════════════
          DEPTH 2 — spine + wings
          structure made of light, not line
      ════════════════════════════════════════════════════════ */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">

        {/* spine — one luminous column rising from below */}
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center' }]}>
          <LinearGradient
            colors={[`${shadow}00`, `${accent}20`, `${highlight}35`, `${accent}15`, `${shadow}00`]}
            locations={[0, 0.35, 0.52, 0.68, 1]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={{ position: 'absolute', bottom: 0, top: CY - 40, width: 2 }}
          />
          {/* spine core — brighter hairline */}
          <LinearGradient
            colors={[`${shadow}00`, `${accent}45`, `${rim}55`, `${accent}30`, `${shadow}00`]}
            locations={[0, 0.38, 0.50, 0.62, 1]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={{ position: 'absolute', bottom: 0, top: CY - 40, width: 0.6 }}
          />
        </View>

        {/* left wing — a soft field of light, not a path */}
        <Animated.View style={{
          position: 'absolute',
          left: CX - 280,
          top: CY - 140,
          width: 340,
          height: 280,
          borderRadius: 170,
          backgroundColor: accent,
          opacity: wingOpacity,
          transform: [{ scale: wingScale }],
        }} />

        {/* right wing */}
        <Animated.View style={{
          position: 'absolute',
          left: CX - 60,
          top: CY - 140,
          width: 340,
          height: 280,
          borderRadius: 170,
          backgroundColor: accent,
          opacity: wingOpacity,
          transform: [{ scale: wingScale }],
        }} />

        {/* wing inner glow — softer, larger */}
        <Animated.View style={{
          position: 'absolute',
          left: CX - 220,
          top: CY - 100,
          width: 440,
          height: 200,
          borderRadius: 220,
          backgroundColor: highlight,
          opacity: bMid.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.14] }),
          transform: [{ scale: bMid.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }],
        }} />

        {/* scars — 4 luminous points that pulse */}
        {[
          { x: CX - 110, y: CY - 80 },
          { x: CX + 115, y: CY - 65 },
          { x: CX - 85, y: CY + 55 },
          { x: CX + 90, y: CY + 70 },
        ].map((s, i) => (
          <Animated.View key={i} style={{
            position: 'absolute',
            left: s.x - 4,
            top: s.y - 4,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === scarIdx ? rim : highlight,
            opacity: i === scarIdx ? 0.85 : 0.12,
            transform: [{ scale: i === scarIdx ? 1.6 : 1 }],
          }} />
        ))}
      </View>

      {/* ════════════════════════════════════════════════════════
          DEPTH 1 — seed
          five membrane layers. the conscious center.
          same language as the lung orb, scaled to the garden.
      ════════════════════════════════════════════════════════ */}
      <View style={[styles.seedAnchor, { top: CY - SEED_R, left: CX - SEED_R }]}>

        {/* outer haze */}
        <Animated.View style={[
          styles.haze,
          {
            width: SEED_R * 3.4,
            height: SEED_R * 3.4,
            borderRadius: SEED_R * 1.7,
            left: -SEED_R * 1.2,
            top: -SEED_R * 1.2,
            backgroundColor: accent,
            opacity: bSlow.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.14] }),
            transform: [{ scale: roomScale }],
          },
        ]} />

        {/* middle ring */}
        <Animated.View style={[
          styles.haze,
          {
            width: SEED_R * 1.8,
            height: SEED_R * 1.8,
            borderRadius: SEED_R * 0.9,
            left: -SEED_R * 0.4,
            top: -SEED_R * 0.4,
            backgroundColor: accent,
            opacity: bMid.interpolate({ inputRange: [0, 1], outputRange: [0.10, 0.22] }),
            transform: [{ scale: wingScale }],
          },
        ]} />

        {/* seed body — pressable membrane */}
        <Pressable
          style={styles.seedPressable}
          onPressIn={onIn}
          onPressOut={onOut}
          onPress={onPress}
          onLongPress={onLongPress}
          delayLongPress={800}
        >
          <Animated.View style={[
            styles.seedBody,
            {
              transform: [{ scale: coreScale }],
              opacity: seedGlow,
              shadowColor: accent,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.70,
              shadowRadius: 28,
            },
          ]}>
            <Svg width={SEED_R * 2} height={SEED_R * 2} viewBox={`0 0 ${SEED_R * 2} ${SEED_R * 2}`}>
              <Defs>
                {/* haze */}
                <RadialGradient id="sg-hz" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%"   stopColor={accent} stopOpacity="0.22" />
                  <Stop offset="50%"  stopColor={accent} stopOpacity="0.07" />
                  <Stop offset="100%" stopColor={accent} stopOpacity="0"    />
                </RadialGradient>
                {/* body — directional light from upper-left */}
                <RadialGradient id="sg-bd" cx="38%" cy="34%" r="55%">
                  <Stop offset="0%"   stopColor={highlight} stopOpacity="0.88" />
                  <Stop offset="20%"  stopColor={accent}     stopOpacity="0.62" />
                  <Stop offset="50%"  stopColor={accent}     stopOpacity="0.28" />
                  <Stop offset="78%"  stopColor={shadow}     stopOpacity="0.10" />
                  <Stop offset="100%" stopColor={shadow}     stopOpacity="0"    />
                </RadialGradient>
                {/* rim — backlit edge */}
                <RadialGradient id="sg-rm" cx="50%" cy="50%" r="50%">
                  <Stop offset="72%"  stopColor={rim} stopOpacity="0"    />
                  <Stop offset="88%"  stopColor={rim} stopOpacity="0.28" />
                  <Stop offset="100%" stopColor={rim} stopOpacity="0.48" />
                </RadialGradient>
                {/* iris — membrane fold */}
                <RadialGradient id="sg-ir" cx="50%" cy="50%" r="50%">
                  <Stop offset="45%"  stopColor={accent} stopOpacity="0"    />
                  <Stop offset="52%"  stopColor={accent} stopOpacity="0.14" />
                  <Stop offset="56%"  stopColor={accent} stopOpacity="0"    />
                  <Stop offset="70%"  stopColor={rim}    stopOpacity="0.06" />
                  <Stop offset="74%"  stopColor={rim}    stopOpacity="0"    />
                </RadialGradient>
                {/* nucleus — off-center specular */}
                <RadialGradient id="sg-nc" cx="34%" cy="30%" r="26%">
                  <Stop offset="0%"   stopColor={rim}      stopOpacity="0.78" />
                  <Stop offset="42%"  stopColor={highlight} stopOpacity="0.35" />
                  <Stop offset="100%" stopColor={accent}    stopOpacity="0"    />
                </RadialGradient>
              </Defs>

              <Circle cx={SEED_R} cy={SEED_R} r={SEED_R * 1.1} fill="url(#sg-hz)" />
              <Circle cx={SEED_R} cy={SEED_R} r={SEED_R - 0.5} fill="url(#sg-bd)" />
              <Circle cx={SEED_R} cy={SEED_R} r={SEED_R - 0.5} fill="url(#sg-rm)" />
              <Circle cx={SEED_R} cy={SEED_R} r={SEED_R - 0.5} fill="url(#sg-ir)" />
              <Circle cx={SEED_R} cy={SEED_R} r={SEED_R - 0.5} fill="url(#sg-nc)" />
            </Svg>
          </Animated.View>
        </Pressable>
      </View>

      {/* label */}
      <Text style={[styles.label, { color: `${color}55`, top: CY + 62 }]}>
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

// ─── RadialGradient wrapper for RN (expo-linear-gradient has no radial) ──
// We simulate radial with a huge borderRadius circle
function RadialGradientRN({ colors, stops, style }: {
  colors: [string, string, string];
  stops: [number, number, number];
  style: any;
}) {
  return (
    <LinearGradient
      colors={colors}
      locations={stops}
      start={{ x: 0.5, y: 0.5 }}
      end={{ x: 0.5, y: 0 }}
      style={style}
    />
  )
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seedAnchor: {
    position: 'absolute',
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haze: {
    position: 'absolute',
  },
  seedPressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  seedBody: {
    width: 88,
    height: 88,
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
