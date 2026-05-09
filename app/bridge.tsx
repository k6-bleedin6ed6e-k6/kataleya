// app/bridge.tsx
// the bridge — presence gateway. swipe left from room, swipe right to return.
// tap orb → mood check-in. hold orb → return. the orb breathes on its own.

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Easing, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { OuroborosRing } from '../components/ouroboros-ring'
import { SphereOrbV2 } from '../components/sphere-orb-v2'
import { MoodCheck } from '../components/mood-check'
import { MercuryCaduceus } from '../surface/mercury-caduceus'
import { useCircadian } from '../hooks/use-circadian'
import { getBreathTechnique } from '../utils/storage'
import { pickCheckinResponse } from '../constants/phrases'
import { BASE } from '../constants/palettes'
import type { MoodValue } from '../utils/sanctuary'

const { width: W, height: H } = Dimensions.get('window')
const RING_SIZE = W - 48

export default function BridgeScreen() {
  const router = useRouter()
  const { phase, palette, hour, minute } = useCircadian()
  const hourDecimal = hour + minute / 60

  const [showCheckIn, setShowCheckIn] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)
  const [mood, setMood] = useState<MoodValue | null>(null)
  const [breathDuration, setBreathDuration] = useState(11)
  const [responseOpacity] = useState(new Animated.Value(0))
  const orbBreath = useRef(new Animated.Value(0)).current

  const responsePhrase = mood !== null ? pickCheckinResponse(phase, mood) : ''

  // orb self-breathing — scale + opacity pulse
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(orbBreath, { toValue: 1, duration: 3500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbBreath, { toValue: 0, duration: 3500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [])

  // load real breath technique duration
  useEffect(() => {
    getBreathTechnique().then(tech => {
      if (tech === '4-7-8') setBreathDuration(19)
      else if (tech === 'box') setBreathDuration(16)
      else setBreathDuration(11)
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

  const orbScale = orbBreath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] })
  const orbOpacity = orbBreath.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] })

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {/* background: mercury caduceus — two slow rivers of light */}
      <MercuryCaduceus phaseColor={palette.accent} flowDuration={12000} />

      <View style={styles.content} {...pan.panHandlers}>

        {/* header */}
        <View style={styles.header} pointerEvents="none">
          <Text style={[styles.headerTitle, { color: `${palette.accent}99` }]}>
            KATALEYA
          </Text>
        </View>

        {/* headline */}
        <View style={styles.headlineWrap} pointerEvents="none">
          <Text style={[styles.headline, { color: `${palette.highlight}aa` }]}>
            life rewritten by choice
          </Text>
        </View>

        {/* center: ring + orb */}
        <View style={styles.center}>
          {/* ouroboros ring — visible, fits screen */}
          <View style={styles.ringWrap} pointerEvents="none">
            <OuroborosRing
              phase={phase}
              size={RING_SIZE}
              hour={hourDecimal}
              variant="lung"
            />
          </View>

          {/* breathing orb */}
          <Animated.View
            style={[
              styles.orbWrap,
              { transform: [{ scale: orbScale }], opacity: orbOpacity },
            ]}
          >
            <SphereOrbV2
              phase={phase}
              size={160}
              variant="lung"
              onPress={handleOrbPress}
            />
          </Animated.View>

          {/* whisper above orb */}
          <View style={styles.whisperWrap} pointerEvents="none">
            <Text style={[styles.whisper, { color: `${palette.rgb}77` }]}>
              {checkedIn ? responsePhrase : 'stay with me'}
            </Text>
          </View>

          {/* response phrase after check-in */}
          {checkedIn && (
            <Animated.View style={[styles.responseWrap, { opacity: responseOpacity }]} pointerEvents="none">
              <Text style={[styles.responseText, { color: `${palette.accent}dd` }]}>
                {responsePhrase}
              </Text>
            </Animated.View>
          )}
        </View>

        {/* frequency bridge */}
        <View style={styles.freqBridge} pointerEvents="none">
          <View style={styles.freqLine}>
            <Text style={[styles.freqGlyph, { color: `${palette.accent}aa` }]}>..:</Text>
            <View style={[styles.freqGlow, { backgroundColor: `${palette.highlight}44` }]} />
            <Text style={[styles.freqGlyph, { color: `${palette.accent}aa` }]}>:..</Text>
          </View>
          <Text style={[styles.freqLabel, { color: `${palette.rgb}66` }]}>
            Resonance Synchronization: {breathDuration.toFixed(1)}s
          </Text>
        </View>

        {/* footer */}
        <View style={styles.footer} pointerEvents="none">
          <Text style={[styles.footerText, { color: `${palette.rgb}44` }]}>
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
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  // header
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 4,
  },
  headerTitle: {
    fontFamily: 'Courier Prime',
    fontSize: 14,
    letterSpacing: 5,
  },
  // headline
  headlineWrap: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 8,
  },
  headline: {
    fontFamily: 'Courier Prime',
    fontSize: 18,
    letterSpacing: 4,
    textAlign: 'center',
    lineHeight: 28,
    textTransform: 'lowercase',
  },
  // center
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    width: RING_SIZE,
    height: RING_SIZE,
    marginVertical: 12,
  },
  ringWrap: {
    position: 'absolute',
    opacity: 0.6,
  },
  orbWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  whisperWrap: {
    position: 'absolute',
    top: -28,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  whisper: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'lowercase',
    textAlign: 'center',
  },
  responseWrap: {
    position: 'absolute',
    bottom: -56,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  responseText: {
    fontFamily: 'Courier Prime',
    fontSize: 13,
    letterSpacing: 1.5,
    textAlign: 'center',
    lineHeight: 22,
  },
  // frequency bridge
  freqBridge: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
    marginBottom: 8,
  },
  freqLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: W * 0.7,
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
    alignItems: 'center',
    marginBottom: 4,
  },
  footerText: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
})
