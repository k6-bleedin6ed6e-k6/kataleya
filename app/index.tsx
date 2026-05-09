// app/index.tsx
// the room. one sphere. one phrase. darkness.
// swipe left → bridge. swipe up → cover. long-press → terminal.

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Easing, PanResponder, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { SphereOrbV2 } from '../components/sphere-orb-v2'
import { TypewriterText } from '../components/typewriter-text'
import { useCircadian } from '../hooks/use-circadian'
import { useReEntry } from '../hooks/use-re-entry'
import { getItem } from '../utils/storage'
import { selectPhrase } from '../constants/phrases'
import { PHASES, BASE } from '../constants/palettes'

const { width: W, height: H } = Dimensions.get('window')
const ORB_SIZE    = Math.round(W * 0.80)
const ORB_TOP     = Math.round(H * 0.40 - ORB_SIZE / 2)
const PHRASE_TOP  = Math.round(H * 0.40 + ORB_SIZE / 2 + 40)

export default function RoomScreen() {
  const router  = useRouter()
  const { phase, palette } = useCircadian()
  const { activePhase, isInGrace, isBlending, gracePhrase } = useReEntry(phase)
  const isReEntry = isInGrace || isBlending
  const [burnComplete] = useState(false)

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

  const routerRef = useRef(router)
  routerRef.current = router

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) => Math.abs(dx) > 12 || Math.abs(dy) > 12,
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderRelease: (_, { dx, dy }) => {
        const ax = Math.abs(dx), ay = Math.abs(dy)
        if (ax > 60 && ax > ay * 1.5 && dx < 0) routerRef.current.push('/bridge')
        else if (ay > 60 && ay > ax * 1.5 && dy < 0) routerRef.current.push('/cover')
      },
    })
  ).current

  const handleLongPress = useCallback(() => routerRef.current.push('/terminal'), [])

  const accentColor = `rgba(${PHASES[activePhase].rgb}, 0.62)`
  const hintColor   = `rgba(${palette.rgb}, 0.07)`

  return (
    <Animated.View style={[styles.screen, { opacity: entryFade }]} {...pan.panHandlers}>

      {/* sphere */}
      <View style={[styles.orb, { top: ORB_TOP, left: (W - ORB_SIZE) / 2 }]}>
        <SphereOrbV2
          phase={activePhase}
          size={ORB_SIZE}
          variant="lung"
          onLongPress={handleLongPress}
        />
      </View>

      {/* phrase */}
      <View style={[styles.phrase, { top: PHRASE_TOP }]} pointerEvents="none">
        <TypewriterText
          text={phrase}
          color={accentColor}
          speed={44}
          key={phrase}
        />
      </View>

      {/* ghost hint */}
      <View style={styles.hint} pointerEvents="none">
        <Text style={[styles.hintText, { color: hintColor }]}>
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
  orb: {
    position: 'absolute',
  },
  phrase: {
    position: 'absolute',
    left: 44,
    right: 44,
    alignItems: 'center',
  },
  hint: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    fontFamily: 'Courier Prime',
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: 'lowercase',
  },
})
