// app/bridge.tsx
// the bridge — presence gateway. phosphor monochrome void.
// tap orb → mood check-in. swipe right to return.

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Svg, { Circle } from 'react-native-svg'

import { MoodCheck } from '../components/mood-check'
import { useCircadian } from '../hooks/use-circadian'
import { getBreathTechnique } from '../utils/storage'
import { pickCheckinResponse } from '../constants/phrases'
import type { MoodValue } from '../utils/sanctuary'

const { width: W, height: H } = Dimensions.get('window')
const ORB_SIZE = Math.round(W * 0.38)
const RING_SIZE = Math.round(W * 0.62)

const PHOSPHOR = '#00FF41'
const BLACK = '#000000'

function PhosphorOrb({
  size,
  onPress,
  breathing,
}: {
  size: number
  onPress: () => void
  breathing: Animated.Value
}) {
  const scale = breathing.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] })
  const opacity = breathing.interpolate({ inputRange: [0, 1], outputRange: [0.65, 0.9] })
  const hazeOpacity = breathing.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.2] })

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.orbContainer, { width: size, height: size }]}>
        <Animated.View
          style={[
            styles.orbHaze,
            { width: size * 1.5, height: size * 1.5, borderRadius: size * 0.75, opacity: hazeOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.orbBody,
            { width: size, height: size, borderRadius: size / 2, opacity, transform: [{ scale }] },
          ]}
        />
        <View
          style={[
            styles.orbNucleus,
            { width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15 },
          ]}
        />
      </Animated.View>
    </Pressable>
  )
}

function OuroborosRingSimple({ size }: { size: number }) {
  const circumference = 2 * Math.PI * (size / 2 - 1)
  const dashArray = `${circumference * 0.92} ${circumference * 0.08}`

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={styles.ringSvg}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 1}
        fill="none"
        stroke={PHOSPHOR}
        strokeWidth={1}
        strokeDasharray={dashArray}
        strokeLinecap="butt"
        opacity={0.3}
      />
    </Svg>
  )
}

export default function BridgeScreen() {
  const router = useRouter()
  const { phase, hour, minute } = useCircadian()
  const hourDecimal = hour + minute / 60

  const [showCheckIn, setShowCheckIn] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)
  const [mood, setMood] = useState<MoodValue | null>(null)
  const [breathDuration, setBreathDuration] = useState(11)
  const [responseOpacity] = useState(new Animated.Value(0))
  const orbBreath = useRef(new Animated.Value(0)).current

  const responsePhrase = mood !== null ? pickCheckinResponse(phase, mood) : ''

  // orb self-breathing
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(orbBreath, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orbBreath, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [])

  // load real breath technique duration
  useEffect(() => {
    getBreathTechnique().then((tech) => {
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

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.content} {...pan.panHandlers}>
        {/* header */}
        <View style={styles.header} pointerEvents="none">
          <Text style={styles.headerTitle}>[ presence_bridge ]</Text>
        </View>

        {/* headline */}
        <View style={styles.headlineWrap} pointerEvents="none">
          <Text style={styles.headline}>life rewritten by choice</Text>
        </View>

        {/* center: ring + orb */}
        <View style={styles.center}>
          <View style={styles.ringWrap} pointerEvents="none">
            <OuroborosRingSimple size={RING_SIZE} />
          </View>

          <View style={styles.orbWrap}>
            <PhosphorOrb size={ORB_SIZE} onPress={handleOrbPress} breathing={orbBreath} />
          </View>

          {/* whisper above orb */}
          <View style={styles.whisperWrap} pointerEvents="none">
            <Text style={styles.whisper}>
              {checkedIn ? responsePhrase : 'stay with me'}
            </Text>
          </View>

          {/* response phrase after check-in */}
          {checkedIn && (
            <Animated.View style={[styles.responseWrap, { opacity: responseOpacity }]} pointerEvents="none">
              <Text style={styles.responseText}>{responsePhrase}</Text>
            </Animated.View>
          )}
        </View>

        {/* frequency bridge */}
        <View style={styles.freqBridge} pointerEvents="none">
          <View style={styles.freqLine}>
            <Text style={styles.freqGlyph}>..:</Text>
            <View style={styles.freqGlow} />
            <Text style={styles.freqGlyph}>:..</Text>
          </View>
          <Text style={styles.freqLabel}>
            {'>'} resonance_sync: {breathDuration.toFixed(1)}s
          </Text>
        </View>

        {/* footer */}
        <View style={styles.footer} pointerEvents="none">
          <Text style={styles.footerText}>{'// origin: thinkBad-doGood-sa.my'}</Text>
          <Text style={styles.footerHint}>[ swipe right to return ]</Text>
        </View>
      </View>

      <MoodCheck phase={phase} visible={showCheckIn} onComplete={handleCheckInComplete} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BLACK,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },

  // orb
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbHaze: {
    position: 'absolute',
    backgroundColor: PHOSPHOR,
  },
  orbBody: {
    position: 'absolute',
    backgroundColor: PHOSPHOR,
    shadowColor: PHOSPHOR,
    shadowRadius: 20,
    shadowOpacity: 0.5,
  },
  orbNucleus: {
    position: 'absolute',
    backgroundColor: `${PHOSPHOR}cc`,
    shadowColor: PHOSPHOR,
    shadowRadius: 10,
    shadowOpacity: 0.8,
  },

  // ring
  ringSvg: {
    position: 'absolute',
  },

  // header
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 4,
  },
  headerTitle: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: `${PHOSPHOR}50`,
    letterSpacing: 4,
    textTransform: 'lowercase',
  },

  // headline
  headlineWrap: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 8,
  },
  headline: {
    fontFamily: 'Courier Prime',
    fontSize: 16,
    color: `${PHOSPHOR}77`,
    letterSpacing: 3,
    textAlign: 'center',
    lineHeight: 26,
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
    color: `${PHOSPHOR}50`,
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
    color: `${PHOSPHOR}cc`,
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
    color: `${PHOSPHOR}55`,
    letterSpacing: 3,
  },
  freqGlow: {
    flex: 1,
    height: 1,
    backgroundColor: `${PHOSPHOR}44`,
  },
  freqLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    color: `${PHOSPHOR}44`,
    letterSpacing: 1.5,
    textTransform: 'lowercase',
  },

  // footer
  footer: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  footerText: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    color: `${PHOSPHOR}25`,
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
  footerHint: {
    fontFamily: 'Courier Prime',
    fontSize: 9,
    color: `${PHOSPHOR}18`,
    letterSpacing: 1.5,
    textTransform: 'lowercase',
  },
})
