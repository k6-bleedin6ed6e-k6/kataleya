// app/cover.tsx
// swipe up from room — 2am lung. tap to cycle phrases. swipe down to return.
// visual intent: immersive cocoon. strip everything. only breath and phrase remain.

import React, { useRef, useState } from 'react'
import { Animated, Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { OuroborosRing } from '../components/ouroboros-ring'
import { SphereOrbV2, type OrbVariant } from '../components/sphere-orb-v2'
import { Atmosphere } from '../components/atmosphere'
import { useCircadian } from '../hooks/use-circadian'
import { BASE } from '../constants/palettes'
import { COVER_PHRASES } from '../constants/phrases'

const VARIANT: OrbVariant = 'lung'
const { width: WIN_W, height: WIN_H } = Dimensions.get('window')
const rgba = (rgb: string, a: number) => `rgba(${rgb}, ${a})`

export default function CoverScreen() {
  const router = useRouter()
  const { phase, palette, hour, minute } = useCircadian()
  const [phraseIndex, setPhraseIndex] = useState(0)
  const phraseOpacity = useRef(new Animated.Value(1)).current
  const hourDecimal = hour + minute / 60

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10 || Math.abs(g.dx) > 10,
      onPanResponderRelease: (_, g) => {
        const absDx = Math.abs(g.dx)
        const absDy = Math.abs(g.dy)
        if (absDy > 60 && absDy > absDx * 1.5 && g.dy > 0) {
          router.back()
        } else if (absDx < 15 && absDy < 15) {
          Animated.timing(phraseOpacity, {
            toValue: 0, duration: 200, useNativeDriver: true,
          }).start(() => {
            setPhraseIndex((i) => (i + 1) % COVER_PHRASES.length)
            Animated.timing(phraseOpacity, {
              toValue: 1, duration: 400, useNativeDriver: true,
            }).start()
          })
        }
      },
    })
  ).current

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {/* heavier atmosphere than room or bridge — this is the cocoon */}
      <Atmosphere phaseColor={palette.accent} heavy />

      {/* phrase pins to top — orb owns the center */}
      <Animated.View style={[styles.phraseWrap, { opacity: phraseOpacity }]} pointerEvents="none">
        <Text style={[styles.phrase, { color: rgba(palette.rgb, 0.75) }]}>
          {COVER_PHRASES[phraseIndex]}
        </Text>
      </Animated.View>

      <View style={styles.content} {...pan.panHandlers}>
        <View style={styles.center}>
          {/* ring spans nearly full width — dwarfs bridge's 300px ring */}
          <View style={styles.ringWrap}>
            <OuroborosRing phase={phase} size={WIN_W - 24} hour={hourDecimal} variant={VARIANT} />
          </View>
          {/* orb is large and fills the ring — you are inside it */}
          <SphereOrbV2 phase={phase} size={244} variant={VARIANT} />
        </View>
      </View>
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
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrap: {
    position: 'absolute',
  },
  phraseWrap: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
    paddingHorizontal: 48,
  },
  phrase: {
    fontFamily: 'Courier Prime',
    fontSize: 15,
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 26,
  },
})
