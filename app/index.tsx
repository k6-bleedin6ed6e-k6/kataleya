// app/index.tsx
// the room — surface layer. one orb. one phrase. the colour of the hour.
// gestures: swipe left → bridge, swipe up → cover, long-press orb → terminal

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { MercuryCaduceus } from '../surface/mercury-caduceus'
import { RiverColumns } from '../surface/river-columns'
import { RiverRipples } from '../surface/river-ripples'
import { MercurySpine } from '../components/mercury-spine'
import { SphereOrbV2, type OrbVariant } from '../components/sphere-orb-v2'
import { Atmosphere } from '../components/atmosphere'
import { HudCorners } from '../components/hud-corners'
import { TypewriterText } from '../components/typewriter-text'
import { useCircadian } from '../hooks/use-circadian'
import { useReEntry } from '../hooks/use-re-entry'
import { BASE, PHASES } from '../constants/palettes'
import { selectPhrase } from '../constants/phrases'

// swap to 'columns' | 'ripples' | 'caduceus' for device comparison
const RIVER_VARIANT: 'caduceus' | 'columns' | 'ripples' = 'caduceus'
const VARIANT: OrbVariant = 'lung'
const { width: WIN_W, height: WIN_H } = Dimensions.get('window')
const rgba = (rgb: string, a: number) => `rgba(${rgb}, ${a})`

export default function RoomScreen() {
  const router = useRouter()
  const { phase, hour, minute } = useCircadian()
  const { activePhase, isInGrace, isBlending, gracePhrase } = useReEntry(phase)
  const palette = PHASES[activePhase]
  const hourDecimal = hour + minute / 60
  const isReEntry = isInGrace || isBlending
  const [burnComplete] = useState(false)

  const phrase = gracePhrase ?? selectPhrase({
    phase: activePhase,
    restlessness: 0.3,
    isReEntry,
    lastBurnComplete: burnComplete,
  })

  // fade in on re-entry grace
  const entryFade = useRef(new Animated.Value(1)).current
  useEffect(() => {
    if (isInGrace) {
      entryFade.setValue(0)
      Animated.timing(entryFade, {
        toValue: 1, duration: 3000, delay: 200,
        easing: Easing.out(Easing.quad), useNativeDriver: true,
      }).start()
    }
  }, [isInGrace])

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) => Math.abs(dx) > 12 || Math.abs(dy) > 12,
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderRelease: (_, { dx, dy }) => {
        const absDx = Math.abs(dx)
        const absDy = Math.abs(dy)
        if (absDx > 60 && absDx > absDy * 1.5 && dx < 0) router.push('/bridge')
        else if (absDy > 60 && absDy > absDx * 1.5 && dy < 0) router.push('/cover')
      },
    })
  ).current

  const handleLongPress = useCallback(() => router.push('/terminal'), [router])

  return (
    <Animated.View style={[styles.screen, { opacity: entryFade }]}>
      {RIVER_VARIANT === 'caduceus' && <MercuryCaduceus phaseColor={palette.accent} />}
      {RIVER_VARIANT === 'columns'  && <RiverColumns  phaseColor={palette.accent} />}
      {RIVER_VARIANT === 'ripples'  && <RiverRipples  phaseColor={palette.accent} />}
      <MercurySpine phase={activePhase} width={WIN_W} height={WIN_H} />
      <Atmosphere phaseColor={palette.accent} />
      <HudCorners color={palette.accent} />

      <View style={styles.content} {...pan.panHandlers}>
        <Text style={[styles.label, { color: rgba(palette.rgb, 0.55) }]}>
          {palette.displayName}
        </Text>
        <Text style={[styles.task, { color: rgba(palette.rgb, 0.30) }]}>
          {palette.existential}
        </Text>

        <View style={styles.center}>
          <SphereOrbV2
            phase={activePhase}
            size={200}
            variant={VARIANT}
            onLongPress={handleLongPress}
          />
        </View>

        <View style={styles.phraseContainer}>
          <TypewriterText
            text={phrase}
            color={rgba(palette.rgb, 0.65)}
            speed={38}
            key={phrase}
          />
        </View>
      </View>

      <View style={styles.hintRow} pointerEvents="none">
        <Text style={[styles.hint, { color: rgba(palette.rgb, 0.12) }]}>
          ← bridge · ↑ cover · hold · engine
        </Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  screen:          { flex: 1, backgroundColor: BASE.bg },
  content:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center:          { width: 300, height: 300, alignItems: 'center', justifyContent: 'center' },
  phraseContainer: { marginTop: 56, paddingHorizontal: 40, alignItems: 'center' },
  label: {
    position: 'absolute', top: 52, left: 44,
    fontFamily: 'Courier Prime', fontSize: 9, letterSpacing: 2.5, textTransform: 'lowercase',
  },
  task: {
    position: 'absolute', top: 52, right: 44,
    fontFamily: 'Courier Prime', fontSize: 9, letterSpacing: 2.5, textTransform: 'lowercase',
  },
  hintRow: {
    position: 'absolute', bottom: 36, left: 0, right: 0, alignItems: 'center',
  },
  hint: {
    fontFamily: 'Courier Prime', fontSize: 8, letterSpacing: 1.5, textTransform: 'lowercase',
  },
})
