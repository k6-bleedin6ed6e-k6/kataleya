// app/bridge.tsx
// swipe left from room — presence bridge. swipe right to return.
// tap orb → weather inside check-in → response phrase

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { OuroborosRing } from '../components/ouroboros-ring'
import { SphereOrbV2, type OrbVariant } from '../components/sphere-orb-v2'
import { Atmosphere } from '../components/atmosphere'
import { TypewriterText } from '../components/typewriter-text'
import { MoodCheck } from '../components/mood-check'
import { useCircadian } from '../hooks/use-circadian'
import { BASE, PHASES } from '../constants/palettes'
import { pickBridgePhrase, pickCheckinResponse } from '../constants/phrases'
import type { MoodValue } from '../utils/sanctuary'

const VARIANT: OrbVariant = 'lung'
const { width: WIN_W, height: WIN_H } = Dimensions.get('window')
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
      <Atmosphere phaseColor={palette.accent} />

      <View style={styles.content} {...pan.panHandlers}>
        <Text style={[styles.label, { color: rgba(palette.rgb, 0.45) }]}>
          {palette.displayName}
        </Text>
        <Text style={[styles.task, { color: rgba(palette.rgb, 0.30) }]}>
          {palette.existential}
        </Text>

        <View style={styles.center}>
          <View style={styles.ringWrap}>
            <OuroborosRing phase={phase} size={260} hour={hourDecimal} variant={VARIANT} />
          </View>
          {/* orb is deliberately small — the ring is the clock, the orb is the tap target */}
          <SphereOrbV2
            phase={phase}
            size={140}
            variant={VARIANT}
            onPress={handleOrbPress}
          />
        </View>

        <View style={styles.phraseContainer}>
          <TypewriterText
            text={phrase}
            color={rgba(palette.rgb, 0.65)}
            speed={44}
            key={phrase}
          />
        </View>
      </View>

      {!checkedIn && (
        <View style={styles.hintRow} pointerEvents="none">
          <Text style={[styles.hint, { color: rgba(palette.rgb, 0.18) }]}>
            {showCheckIn ? '' : 'tap orb · check in  ·  swipe right · return'}
          </Text>
        </View>
      )}

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
  content:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center:          { width: 300, height: 300, alignItems: 'center', justifyContent: 'center' },
  ringWrap:        { position: 'absolute' },
  phraseContainer: { marginTop: 56, paddingHorizontal: 48, alignItems: 'center' },
  label: {
    position: 'absolute', top: 8, left: 24,
    fontFamily: 'Courier Prime', fontSize: 9, letterSpacing: 3, textTransform: 'lowercase',
  },
  task: {
    position: 'absolute', top: 8, right: 24,
    fontFamily: 'Courier Prime', fontSize: 9, letterSpacing: 3, textTransform: 'lowercase',
  },
  hintRow: { alignItems: 'center', paddingBottom: 24 },
  hint: {
    fontFamily: 'Courier Prime', fontSize: 9, letterSpacing: 2, textTransform: 'lowercase',
  },
})
