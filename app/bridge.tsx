// app/bridge.tsx
// swipe left from room — presence bridge. swipe right to return.

import React, { useRef, useMemo } from 'react'
import { Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { MercurySpine } from '../components/mercury-spine'
import { OuroborosRing } from '../components/ouroboros-ring'
import { SphereOrbV2, type OrbVariant } from '../components/sphere-orb-v2'
import { Atmosphere } from '../components/atmosphere'
import { HudCorners } from '../components/hud-corners'
import { TypewriterText } from '../components/typewriter-text'
import { useCircadian } from '../hooks/use-circadian'
import { BASE } from '../constants/palettes'
import { pickBridgePhrase } from '../constants/phrases'

const VARIANT: OrbVariant = 'lung'
const { width: WIN_W, height: WIN_H } = Dimensions.get('window')
const rgba = (rgb: string, a: number) => `rgba(${rgb}, ${a})`

export default function BridgeScreen() {
  const router = useRouter()
  const { phase, palette, hour, minute } = useCircadian()
  const hourDecimal = hour + minute / 60
  const phrase = useMemo(() => pickBridgePhrase(phase), [phase])

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 || Math.abs(g.dy) > 10,
      onPanResponderRelease: (_, g) => {
        const isHorizontal = Math.abs(g.dx) > Math.abs(g.dy)
        if (isHorizontal && g.dx > 60) router.back()
      },
    })
  ).current

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <MercurySpine phase={phase} width={WIN_W} height={WIN_H} />
      <Atmosphere phaseColor={palette.accent} />
      <HudCorners color={palette.accent} />
      <View style={styles.content} {...pan.panHandlers}>
        <Text style={[styles.label, { color: rgba(palette.rgb, 0.45) }]}>
          {palette.displayName}
        </Text>
        <Text style={[styles.task, { color: rgba(palette.rgb, 0.30) }]}>
          {palette.existential}
        </Text>

        <View style={styles.center}>
          <View style={styles.ringWrap}>
            <OuroborosRing phase={phase} size={280} hour={hourDecimal} variant={VARIANT} />
          </View>
          <SphereOrbV2 phase={phase} size={280} variant={VARIANT} />
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

      <View style={styles.hintRow} pointerEvents="none">
        <Text style={[styles.hint, { color: rgba(palette.rgb, 0.18) }]}>
          swipe right · return
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen:          { flex: 1, backgroundColor: BASE.bg },
  content:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center:          { width: 280, height: 280, alignItems: 'center', justifyContent: 'center' },
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
