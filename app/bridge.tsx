// app/bridge.tsx
// the bridge — presence gateway. swipe left from room, swipe right to return.
// tap orb → mood check-in → response whisper. rebuilt to match wireframe.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { OuroborosRing } from '../components/ouroboros-ring'
import { SphereOrbV2 } from '../components/sphere-orb-v2'
import { MoodCheck } from '../components/mood-check'
import { useCircadian } from '../hooks/use-circadian'
import { getBreathTechnique } from '../utils/storage'
import { pickBridgePhrase, pickCheckinResponse } from '../constants/phrases'
import { BASE } from '../constants/palettes'
import type { MoodValue } from '../utils/sanctuary'

const { width: W, height: H } = Dimensions.get('window')

export default function BridgeScreen() {
  const router = useRouter()
  const { phase, palette, hour, minute } = useCircadian()
  const hourDecimal = hour + minute / 60

  const [showCheckIn, setShowCheckIn] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)
  const [mood, setMood] = useState<MoodValue | null>(null)
  const [breathDuration, setBreathDuration] = useState(11)
  const [responseOpacity] = useState(new Animated.Value(0))

  const ambientPhrase = useMemo(() => pickBridgePhrase(phase), [phase])
  const responsePhrase = mood !== null ? pickCheckinResponse(phase, mood) : ambientPhrase

  // load real breath technique duration
  useEffect(() => {
    getBreathTechnique().then(tech => {
      if (tech === '4-7-8') setBreathDuration(19)
      else if (tech === 'box') setBreathDuration(16)
      else setBreathDuration(11) // resonant default
    })
  }, [])

  // fade response phrase after check-in
  useEffect(() => {
    if (checkedIn) {
      Animated.sequence([
        Animated.timing(responseOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.delay(4000),
        Animated.timing(responseOpacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]).start(() => setCheckedIn(false))
    }
  }, [checkedIn])

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
      <View style={styles.content} {...pan.panHandlers}>

        {/* ── atmospheric vignettes ── */}
        <View
          style={[
            styles.vignetteTop,
            { backgroundColor: `${palette.highlight}10` },
          ]}
          pointerEvents="none"
        />
        <View
          style={[
            styles.vignetteBottom,
            { backgroundColor: `${palette.shadow}14` },
          ]}
          pointerEvents="none"
        />

        {/* ── header ── */}
        <View style={styles.header} pointerEvents="none">
          <Text style={[styles.headerTitle, { color: `${palette.accent}33` }]}>
            KATALEYA
          </Text>
        </View>

        {/* ── headline ── */}
        <View style={styles.headlineWrap}>
          <Text style={[styles.headline, { color: `${palette.highlight}66` }]}>
            life rewritten by choice
          </Text>
        </View>

        {/* ── expanding ouroboros ring ── */}
        <View style={styles.ringWrap} pointerEvents="none">
          <OuroborosRing
            phase={phase}
            size={Math.round(W * 1.15)}
            hour={hourDecimal}
            variant="lung"
          />
        </View>

        {/* ── center: orb + whisper ── */}
        <View style={styles.orbWrap}>
          {/* whisper above */}
          <Text style={[styles.whisper, { color: `${palette.rgb}40` }]}>
            {checkedIn ? responsePhrase : 'stay with me'}
          </Text>

          {/* response phrase (fades in after check-in) */}
          {checkedIn && (
            <Animated.View style={{ opacity: responseOpacity, position: 'absolute', top: -40 }}>
              <Text style={[styles.responseText, { color: `${palette.accent}bb` }]}>
                {responsePhrase}
              </Text>
            </Animated.View>
          )}

          <SphereOrbV2
            phase={phase}
            size={160}
            variant="lung"
            onPress={handleOrbPress}
          />
        </View>

        {/* ── frequency bridge ── */}
        <View style={styles.freqBridge} pointerEvents="none">
          <View style={styles.freqLine}>
            <Text style={[styles.freqGlyph, { color: `${palette.accent}77` }]}>..:</Text>
            <View style={[styles.freqGlow, { backgroundColor: `${palette.highlight}22` }]} />
            <Text style={[styles.freqGlyph, { color: `${palette.accent}77` }]}>:..</Text>
          </View>
          <Text style={[styles.freqLabel, { color: `${palette.rgb}33` }]}>
            Resonance Synchronization: {breathDuration.toFixed(1)}s
          </Text>
        </View>

        {/* ── footer ── */}
        <View style={styles.footer} pointerEvents="none">
          <Text style={[styles.footerText, { color: `${palette.rgb}22` }]}>
            // origin: thinkBad-doGood-sa.my
          </Text>
        </View>
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
  screen: {
    flex: 1,
    backgroundColor: BASE.bg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  // vignettes
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: H * 0.45,
    opacity: 0.6,
    pointerEvents: 'none',
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: H * 0.45,
    opacity: 0.6,
    pointerEvents: 'none',
  },
  // header
  header: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 5,
  },
  headerTitle: {
    fontFamily: 'Courier Prime',
    fontSize: 14,
    letterSpacing: 5,
  },
  // headline
  headlineWrap: {
    position: 'absolute',
    top: H * 0.18,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 5,
  },
  headline: {
    fontFamily: 'Courier Prime',
    fontSize: 18,
    letterSpacing: 4,
    textAlign: 'center',
    lineHeight: 28,
    textTransform: 'lowercase',
  },
  // ring
  ringWrap: {
    position: 'absolute',
    top: H * 0.5 - (W * 1.15) / 2,
    left: W / 2 - (W * 1.15) / 2,
    opacity: 0.35,
    zIndex: 1,
  },
  // orb
  orbWrap: {
    position: 'absolute',
    top: H * 0.5 - 80,
    left: W / 2 - 80,
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  whisper: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    letterSpacing: 3,
    textTransform: 'lowercase',
    marginBottom: 16,
    textAlign: 'center',
  },
  responseText: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    letterSpacing: 2,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 220,
  },
  // frequency bridge
  freqBridge: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
    zIndex: 5,
  },
  freqLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    height: 1,
    gap: 8,
  },
  freqGlyph: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    letterSpacing: 3,
  },
  freqGlow: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  freqLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  // footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  footerText: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
})
