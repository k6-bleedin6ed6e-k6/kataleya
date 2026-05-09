// app/index.tsx
// the room — integrated presence. swipe left → bridge, swipe up → cover, long-press → terminal.

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Easing, PanResponder, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { GardenPresence } from '../components/garden-presence'
import { useCircadian } from '../hooks/use-circadian'
import { useReEntry } from '../hooks/use-re-entry'
import { getItem } from '../utils/storage'
import { selectPhrase } from '../constants/phrases'
import { BASE } from '../constants/palettes'
import type { PhaseKey } from '../constants/palettes'

// PhaseKey → GardenPresence Phase
type PresencePhase = 'void' | 'dawn' | 'day' | 'golden'
function toPresencePhase(phase: PhaseKey): PresencePhase {
  if (phase === 'night')      return 'void'
  if (phase === 'goldenHour') return 'golden'
  return phase as 'dawn' | 'day'
}

const rgba = (rgb: string, a: number) => `rgba(${rgb}, ${a})`

export default function RoomScreen() {
  const router = useRouter()
  const { phase, palette } = useCircadian()
  const { activePhase, isInGrace, isBlending, gracePhrase } = useReEntry(phase)
  const isReEntry = isInGrace || isBlending
  const [burnComplete] = useState(false)

  // redirect to onboarding if first launch
  useEffect(() => {
    getItem<boolean>('has_seen_onboarding').then(seen => {
      if (!seen) router.replace('/onboarding')
    })
  }, [])

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
    <Animated.View style={[styles.screen, { opacity: entryFade }]} {...pan.panHandlers}>
      <GardenPresence
        phase={toPresencePhase(activePhase)}
        phrase={phrase}
        isGrace={!!gracePhrase}
        onLongPress={handleLongPress}
      />
      <View style={styles.hintRow} pointerEvents="none">
        <Text style={[styles.hint, { color: rgba(palette.rgb, 0.10) }]}>
          ← bridge · ↑ cover · hold · engine
        </Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BASE.bg,
  },
  hintRow: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hint: {
    fontFamily: 'Courier Prime',
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: 'lowercase',
  },
})
