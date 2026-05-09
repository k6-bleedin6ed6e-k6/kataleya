// app/bridge.tsx
// swipe left from room — presence bridge. swipe right to return.
// tap orb → weather inside check-in → response phrase

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { PanResponder, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { OuroborosRing } from '../components/ouroboros-ring'
import { SphereOrbV2, type OrbVariant } from '../components/sphere-orb-v2'
import { Atmosphere } from '../components/atmosphere'
import { TypewriterText } from '../components/typewriter-text'
import { MoodCheck } from '../components/mood-check'
import { useCircadian } from '../hooks/use-circadian'
import { BASE } from '../constants/palettes'
import { pickBridgePhrase, pickCheckinResponse } from '../constants/phrases'
import type { MoodValue } from '../utils/sanctuary'

const VARIANT: OrbVariant = 'lung'
const rgba = (rgb: string, a: number) => `rgba(${rgb}, ${a})`

export default function BridgeScreen() {
  const router = useRouter()
  const { phase, palette, hour, minute } = useCircadian()
  const hourDecimal = hour + minute / 60
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)
  const [mood, setMood] = useState<MoodValue | null>(null)

  const ambientPhrase = useMemo(() => pickBridgePhrase(phase), [phase])
  const phrase = mood !== null ? pickCheckinResponse(phase, mood) : ambientPhrase

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 || Math.abs(g.dy) > 10,
      onPanResponderRelease: (_, g) => {
        if (showCheckIn) return
        const isHorizontal = Math.abs(g.dx) > Math.abs(g.dy)
        if (isHorizontal && g.dx > 60) router.back()
      },
    })
  ).current

  const handleOrbPress = useCallback(() => {
    if (!showCheckIn) setShowCheckIn(true)
  }, [showCheckIn])

  const handleCheckInComplete = useCallback((selected: MoodValue) => {
    setMood(selected)
    setCheckedIn(true)
    setShowCheckIn(false)
  }, [])

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Atmosphere phase={phase} />

      <View style={styles.content} {...pan.panHandlers}>
        {/* header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: rgba(palette.rgb, 0.50) }]}>KATALEYA</Text>
        </View>

        {/* labels */}
        <Text style={[styles.label, { color: rgba(palette.rgb, 0.80) }]}>
          {palette.displayName}
        </Text>
        <Text style={[styles.task, { color: rgba(palette.rgb, 0.60) }]}>
          {palette.existential}
        </Text>

        {/* headline */}
        <View style={styles.headlineWrap}>
          <Text style={[styles.headline, { color: rgba(palette.rgb, 0.85) }]}>
            life rewritten by choice
          </Text>
        </View>

        {/* center: ring + orb */}
        <View style={styles.center}>
          <View style={styles.ringWrap}>
            <OuroborosRing phase={phase} size={320} hour={hourDecimal} variant={VARIANT} />
          </View>
          <SphereOrbV2
            phase={phase}
            size={140}
            variant={VARIANT}
            onPress={handleOrbPress}
          />
        </View>

        {/* phrase */}
        <View style={styles.phraseContainer}>
          <TypewriterText
            text={phrase}
            color={rgba(palette.rgb, 0.85)}
            speed={44}
            key={phrase}
          />
        </View>

        {/* frequency bridge */}
        <View style={styles.frequencyBridge} pointerEvents="none">
          <View style={[styles.frequencyLine, { backgroundColor: rgba(palette.rgb, 0.30) }]}>
            <Text style={[styles.frequencyText, { color: rgba(palette.rgb, 0.60) }]}>..:</Text>
            <View style={[styles.frequencyGlow, { backgroundColor: rgba(palette.rgb, 0.20) }]} />
            <Text style={[styles.frequencyText, { color: rgba(palette.rgb, 0.60) }]}>:..</Text>
          </View>
          <Text style={[styles.frequencySub, { color: rgba(palette.rgb, 0.40) }]}>
            Resonance Synchronization: 11.0s
          </Text>
        </View>
      </View>

      {!checkedIn && (
        <View style={styles.hintRow} pointerEvents="none">
          <Text style={[styles.hint, { color: rgba(palette.rgb, 0.35) }]}>
            {showCheckIn ? '' : 'tap orb · check in  ·  swipe right · return'}
          </Text>
        </View>
      )}

      {/* origin footer */}
      <View style={styles.footer} pointerEvents="none">
        <Text style={[styles.footerText, { color: rgba(palette.rgb, 0.25) }]}>
          // origin: thinkBad-doGood-sa.my
        </Text>
      </View>

      <MoodCheck
        phase={phase}
        visible={showCheckIn}
        onComplete={handleCheckInComplete}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen:          { flex: 1, backgroundColor: BASE.bg },
  content:         { flex: 1, alignItems: 'center' },
  header: {
    position: 'absolute', top: 12, left: 0, right: 0,
    alignItems: 'center', paddingHorizontal: 24,
  },
  headerTitle: {
    fontFamily: 'Courier Prime', fontSize: 14, letterSpacing: 4,
  },
  headlineWrap: {
    position: 'absolute', top: 80, left: 0, right: 0,
    alignItems: 'center', paddingHorizontal: 32,
  },
  headline: {
    fontFamily: 'Courier Prime', fontSize: 16,
    letterSpacing: 3, textAlign: 'center', lineHeight: 24,
    textTransform: 'lowercase',
  },
  center:          { width: 320, height: 320, alignItems: 'center', justifyContent: 'center', marginTop: 128 },
  ringWrap:        { position: 'absolute' },
  phraseContainer: { marginTop: 40, paddingHorizontal: 48, alignItems: 'center' },
  label: {
    position: 'absolute', top: 44, left: 24,
    fontFamily: 'Courier Prime', fontSize: 10, letterSpacing: 3, textTransform: 'lowercase',
  },
  task: {
    position: 'absolute', top: 44, right: 24,
    fontFamily: 'Courier Prime', fontSize: 10, letterSpacing: 3, textTransform: 'lowercase',
  },
  frequencyBridge: {
    position: 'absolute', bottom: 64, left: 0, right: 0,
    alignItems: 'center', gap: 8, paddingHorizontal: 32,
  },
  frequencyLine: {
    height: 1, width: '80%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  frequencyText: {
    fontFamily: 'Courier Prime', fontSize: 10, letterSpacing: 3,
  },
  frequencyGlow: {
    width: 80, height: 3,
  },
  frequencySub: {
    fontFamily: 'Courier Prime', fontSize: 9, letterSpacing: 1,
    textTransform: 'uppercase',
  },
  hintRow: { alignItems: 'center', paddingBottom: 24, position: 'absolute', bottom: 32, left: 0, right: 0 },
  hint: {
    fontFamily: 'Courier Prime', fontSize: 10, letterSpacing: 2, textTransform: 'lowercase',
  },
  footer: {
    position: 'absolute', bottom: 16, left: 0, right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Courier Prime', fontSize: 9, letterSpacing: 2,
    textTransform: 'lowercase',
  },
})
