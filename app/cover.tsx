// app/cover.tsx
// swipe up from room — 2am lung. tap to cycle phrases. swipe down to return.
// hold orb 2.5s → progress arc fills → auto-return. release early → arc resets.

import React, { useRef, useState } from 'react'
import { Animated, Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { OuroborosRing } from '../components/ouroboros-ring'
import { SphereOrbV2, type OrbVariant } from '../components/sphere-orb-v2'
import { Atmosphere } from '../components/atmosphere'
import { RiverRipples } from '../surface/river-ripples'
import { useCircadian } from '../hooks/use-circadian'
import { BASE } from '../constants/palettes'
import { COVER_PHRASES } from '../constants/phrases'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const VARIANT: OrbVariant = 'lung'
const { width: WIN_W } = Dimensions.get('window')
const rgba = (rgb: string, a: number) => `rgba(${rgb}, ${a})`

// hold 2.5s → back. ring r=134 sits 12px outside the 244px orb (r=122).
const HOLD_MS     = 2500
const RING_R      = 134
const RING_D      = RING_R * 2 + 4
const RING_CIRCUM = 2 * Math.PI * RING_R

export default function CoverScreen() {
  const router = useRouter()
  const { phase, palette, hour, minute } = useCircadian()
  const [phraseIndex, setPhraseIndex] = useState(0)
  const phraseOpacity = useRef(new Animated.Value(1)).current
  const hourDecimal = hour + minute / 60

  const holdProgress = useRef(new Animated.Value(0)).current
  const holdAnimRef  = useRef<Animated.CompositeAnimation | null>(null)
  const isHolding    = useRef(false)
  const routerRef    = useRef(router)
  routerRef.current  = router
  const accentRef    = useRef(palette.accent)
  accentRef.current  = palette.accent

  function cancelHold() {
    if (!isHolding.current) return
    isHolding.current = false
    holdAnimRef.current?.stop()
    holdAnimRef.current = null
    Animated.timing(holdProgress, { toValue: 0, duration: 220, useNativeDriver: false }).start()
  }

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10 || Math.abs(g.dx) > 10,
      onPanResponderGrant: () => {
        isHolding.current = true
        holdProgress.setValue(0)
        holdAnimRef.current = Animated.timing(holdProgress, {
          toValue: 1, duration: HOLD_MS, useNativeDriver: false,
        })
        holdAnimRef.current.start(({ finished }) => {
          if (finished && isHolding.current) {
            isHolding.current = false
            routerRef.current.back()
          }
        })
      },
      onPanResponderMove: (_, g) => {
        if (isHolding.current && (Math.abs(g.dx) > 8 || Math.abs(g.dy) > 8)) {
          cancelHold()
        }
      },
      onPanResponderRelease: (_, g) => {
        cancelHold()
        const absDx = Math.abs(g.dx)
        const absDy = Math.abs(g.dy)
        if (absDy > 60 && absDy > absDx * 1.5 && g.dy > 0) {
          routerRef.current.back()
        } else if (absDx < 15 && absDy < 15) {
          Animated.timing(phraseOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
            setPhraseIndex(i => (i + 1) % COVER_PHRASES.length)
            Animated.timing(phraseOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start()
          })
        }
      },
      onPanResponderTerminate: () => {
        cancelHold()
      },
    })
  ).current

  const strokeDashoffset = holdProgress.interpolate({
    inputRange:  [0, 1],
    outputRange: [RING_CIRCUM, 0],
  })
  const progressOpacity = holdProgress.interpolate({
    inputRange:  [0, 0.04],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  })

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <RiverRipples phaseColor={palette.accent} />
      <Atmosphere phase={phase} heavy />

      <Animated.View style={[styles.phraseWrap, { opacity: phraseOpacity }]} pointerEvents="none">
        <Text style={[styles.phrase, { color: rgba(palette.rgb, 0.75) }]}>
          {COVER_PHRASES[phraseIndex]}
        </Text>
      </Animated.View>

      <View style={styles.content} {...pan.panHandlers}>
        <View style={styles.center}>
          <View style={styles.ringWrap}>
            <OuroborosRing phase={phase} size={WIN_W - 24} hour={hourDecimal} variant={VARIANT} />
          </View>
          <SphereOrbV2 phase={phase} size={244} variant={VARIANT} />

          {/* hold-to-return arc — starts at 12 o'clock, fills clockwise on sustained hold */}
          <Animated.View style={[styles.progressWrap, { opacity: progressOpacity }]} pointerEvents="none">
            <View style={styles.progressRotate}>
              <Svg width={RING_D} height={RING_D}>
                <AnimatedCircle
                  cx={RING_R + 2}
                  cy={RING_R + 2}
                  r={RING_R}
                  fill="none"
                  stroke={palette.accent}
                  strokeWidth={1.5}
                  strokeDasharray={`${RING_CIRCUM} ${RING_CIRCUM}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </Svg>
            </View>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: BASE.bg },
  content:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center:   { alignItems: 'center', justifyContent: 'center' },
  ringWrap: { position: 'absolute' },
  phraseWrap: {
    position:        'absolute',
    top:             72,
    left:            0,
    right:           0,
    alignItems:      'center',
    zIndex:          2,
    paddingHorizontal: 48,
  },
  phrase: {
    fontFamily: 'Courier Prime',
    fontSize:   15,
    letterSpacing: 1,
    textAlign:  'center',
    lineHeight: 26,
  },
  progressWrap:   { position: 'absolute' },
  progressRotate: { transform: [{ rotate: '-90deg' }] },
})
