// app/cover.tsx
// swipe up from room — 2am lung. tap to cycle phrases. swipe down to return.

import React, { useRef, useState } from 'react'
import { Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { MercurySpine } from '../components/mercury-spine'
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
          setPhraseIndex((i) => (i + 1) % COVER_PHRASES.length)
        }
      },
    })
  ).current

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <MercurySpine phase={phase} width={WIN_W} height={WIN_H} />
      <Atmosphere heavy />
      <View style={styles.content} {...pan.panHandlers}>
        <Text style={[styles.label, { color: rgba(palette.rgb, 0.4) }]}>
          {palette.displayName}
        </Text>
        <Text style={[styles.task, { color: rgba(palette.rgb, 0.25) }]}>
          {palette.existential}
        </Text>

        <View style={styles.center}>
          <View style={styles.ringWrap}>
            <OuroborosRing phase={phase} size={300} hour={hourDecimal} variant={VARIANT} />
          </View>
          <SphereOrbV2 phase={phase} size={300} variant={VARIANT} />
        </View>

        <Text style={[styles.phrase, { color: rgba(palette.rgb, 0.55) }]} key={phraseIndex}>
          {COVER_PHRASES[phraseIndex]}
        </Text>
      </View>

      <View style={styles.hintRow} pointerEvents="none">
        <Text style={[styles.hint, { color: rgba(palette.rgb, 0.18) }]}>
          swipe down · return · tap · next
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: '#000' },
  content:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center:   { width: 300, height: 300, alignItems: 'center', justifyContent: 'center' },
  ringWrap: { position: 'absolute' },
  label: {
    position: 'absolute', top: 8, left: 24,
    fontFamily: 'Courier Prime', fontSize: 9, letterSpacing: 3, textTransform: 'lowercase',
  },
  task: {
    position: 'absolute', top: 8, right: 24,
    fontFamily: 'Courier Prime', fontSize: 9, letterSpacing: 3, textTransform: 'lowercase',
  },
  phrase: {
    marginTop: 56, fontFamily: 'Courier Prime', fontSize: 13,
    letterSpacing: 0.5, textAlign: 'center', maxWidth: 280,
  },
  hintRow: { alignItems: 'center', paddingBottom: 24 },
  hint: {
    fontFamily: 'Courier Prime', fontSize: 9, letterSpacing: 2, textTransform: 'lowercase',
  },
})
