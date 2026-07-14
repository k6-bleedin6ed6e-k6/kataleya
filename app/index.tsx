// app/index.tsx
// the room. total void. one orb. one ring. one phrase. darkness.
// swipe left → bridge. swipe up → cover. long-press → terminal.
// no chrome. no nav bars. no buttons. the user interacts with the void.

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
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle } from 'react-native-svg'

import { useCircadian } from '../hooks/use-circadian'
import { useReEntry } from '../hooks/use-re-entry'
import { getAttunement } from '../utils/storage'
import { selectPhrase } from '../constants/phrases'

const { width: W, height: H } = Dimensions.get('window')
const ORB_SIZE = Math.round(W * 0.44)
const RING_SIZE = Math.round(W * 0.72)

const PHOSPHOR = '#00FF41'
const BLACK = '#000000'

function PhosphorOrb({ size, onLongPress }: { size: number; onLongPress: () => void }) {
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [])

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] })
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.85] })
  const hazeOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.18] })

  return (
    <Pressable onLongPress={onLongPress} delayLongPress={800}>
      <Animated.View
        style={[
          styles.orbContainer,
          { width: size, height: size },
        ]}
      >
        {/* haze layer */}
        <Animated.View
          style={[
            styles.orbHaze,
            {
              width: size * 1.6,
              height: size * 1.6,
              borderRadius: size * 0.8,
              opacity: hazeOpacity,
            },
          ]}
        />
        {/* body */}
        <Animated.View
          style={[
            styles.orbBody,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity,
              transform: [{ scale }],
            },
          ]}
        />
        {/* nucleus */}
        <View
          style={[
            styles.orbNucleus,
            {
              width: size * 0.35,
              height: size * 0.35,
              borderRadius: size * 0.175,
            },
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
        opacity={0.35}
      />
    </Svg>
  )
}

export default function RoomScreen() {
  const router = useRouter()
  const { phase } = useCircadian()
  const { activePhase, isInGrace, isBlending, gracePhrase } = useReEntry(phase)
  const isReEntry = isInGrace || isBlending
  const [burnComplete] = useState(false)

  const [sobrietyDays, setSobrietyDays] = useState<number | null>(null)

  useEffect(() => {
    // Onboarding gate now lives in app/_layout.tsx — global, not per-screen.
    getAttunement().then((att) => {
      if (att?.sobriety_date) {
        const start = new Date(att.sobriety_date)
        const now = new Date()
        const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        setSobrietyDays(diff)
      }
    })
  }, [])

  const phrase = gracePhrase ?? selectPhrase({
    phase: activePhase,
    restlessness: 0.3,
    isReEntry,
    lastBurnComplete: burnComplete,
  })

  const entryFade = useRef(new Animated.Value(1)).current
  useEffect(() => {
    if (isInGrace) {
      entryFade.setValue(0)
      Animated.timing(entryFade, {
        toValue: 1,
        duration: 3000,
        delay: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start()
    }
  }, [isInGrace])

  const routerRef = useRef(router)
  routerRef.current = router

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > 12 || Math.abs(dy) > 12,
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderRelease: (_, { dx, dy }) => {
        const ax = Math.abs(dx)
        const ay = Math.abs(dy)
        if (ax > 60 && ax > ay * 1.5 && dx < 0) routerRef.current.push('/bridge')
        else if (ay > 60 && ay > ax * 1.5 && dy < 0) routerRef.current.push('/cover')
      },
    })
  ).current

  const handleLongPress = useCallback(() => routerRef.current.push('/terminal'), [])

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Animated.View style={[styles.content, { opacity: entryFade }]} {...pan.panHandlers}>
        {/* ── top whisper ── */}
        <View style={styles.topWhisper} pointerEvents="none">
          <Text style={styles.topWhisperText}>mood orb</Text>
        </View>

        {/* ── center: ring + orb ── */}
        <View style={styles.center}>
          <View style={styles.ringWrap}>
            <OuroborosRingSimple size={RING_SIZE} />
          </View>
          <View style={styles.orbWrap}>
            <PhosphorOrb size={ORB_SIZE} onLongPress={handleLongPress} />
          </View>
        </View>

        {/* ── side whisper ── */}
        <View style={styles.sideWhisper} pointerEvents="none">
          <Text style={styles.sideWhisperText}>breathe.</Text>
          <Text style={styles.sideWhisperText}>just the next one.</Text>
        </View>

        {/* ── main phrase ── */}
        <View style={styles.phrase} pointerEvents="none">
          <Text style={styles.phraseText}>{phrase}</Text>
        </View>

        {/* ── sobriety ghost ── */}
        {sobrietyDays !== null && (
          <View style={styles.sobrietyGhost} pointerEvents="none">
            <Text style={styles.sobrietyText}>day {sobrietyDays}</Text>
          </View>
        )}

        {/* ── bottom whisper ── */}
        <View style={styles.bottomWhisper} pointerEvents="none">
          <Text style={styles.bottomWhisperText}>you're not alone.</Text>
        </View>

        {/* ── gesture ghost ── */}
        <View style={styles.hint} pointerEvents="none">
          <Text style={styles.hintText}>{'← bridge · ↑ cover · hold · engine'}</Text>
        </View>
      </Animated.View>
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
    justifyContent: 'center',
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
    shadowRadius: 24,
    shadowOpacity: 0.5,
  },
  orbNucleus: {
    position: 'absolute',
    backgroundColor: `${PHOSPHOR}cc`,
    shadowColor: PHOSPHOR,
    shadowRadius: 12,
    shadowOpacity: 0.8,
  },

  // ring
  ringSvg: {
    position: 'absolute',
  },

  // layout
  center: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrap: {
    position: 'absolute',
  },
  orbWrap: {
    zIndex: 5,
  },

  // whispers
  topWhisper: {
    position: 'absolute',
    top: H * 0.14,
    alignItems: 'center',
  },
  topWhisperText: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    color: `${PHOSPHOR}30`,
    letterSpacing: 4,
    textTransform: 'lowercase',
  },
  sideWhisper: {
    position: 'absolute',
    left: 24,
    top: H * 0.42,
    gap: 4,
  },
  sideWhisperText: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: `${PHOSPHOR}45`,
    letterSpacing: 1.5,
    textTransform: 'lowercase',
    lineHeight: 18,
  },
  bottomWhisper: {
    position: 'absolute',
    bottom: H * 0.18,
    alignItems: 'center',
  },
  bottomWhisperText: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: `${PHOSPHOR}35`,
    letterSpacing: 2,
    textTransform: 'lowercase',
  },

  // phrase
  phrase: {
    position: 'absolute',
    top: H * 0.58,
    left: 48,
    right: 48,
    alignItems: 'center',
  },
  phraseText: {
    fontFamily: 'Courier Prime',
    fontSize: 13,
    color: `${PHOSPHOR}88`,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'lowercase',
    lineHeight: 22,
  },

  // sobriety
  sobrietyGhost: {
    position: 'absolute',
    top: H * 0.26,
    right: 32,
  },
  sobrietyText: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    color: `${PHOSPHOR}30`,
    letterSpacing: 2,
    textTransform: 'lowercase',
  },

  // hint
  hint: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    fontFamily: 'Courier Prime',
    fontSize: 9,
    color: `${PHOSPHOR}18`,
    letterSpacing: 1.5,
    textTransform: 'lowercase',
  },
})
