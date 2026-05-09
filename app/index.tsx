// app/index.tsx
// the room. one sphere. one ring. one phrase. darkness.
// swipe left → bridge. swipe up → cover. long-press → terminal.
// tap nav → burn (terminal icon) | mirror (not yet wired)

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Easing, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SphereOrbV2 } from '../components/sphere-orb-v2'
import { OuroborosRing } from '../components/ouroboros-ring'
import { TypewriterText } from '../components/typewriter-text'
import { useCircadian } from '../hooks/use-circadian'
import { useReEntry } from '../hooks/use-re-entry'
import { getItem } from '../utils/storage'
import { selectPhrase } from '../constants/phrases'
import { PHASES, BASE } from '../constants/palettes'

const { width: W, height: H } = Dimensions.get('window')
const ORB_SIZE    = Math.round(W * 0.56)
const RING_SIZE   = Math.round(W * 0.92)
const ORB_TOP     = Math.round(H * 0.38 - ORB_SIZE / 2)
const RING_TOP    = Math.round(H * 0.38 - RING_SIZE / 2)

export default function RoomScreen() {
  const router  = useRouter()
  const { phase, palette, hour, minute } = useCircadian()
  const { activePhase, isInGrace, isBlending, gracePhrase } = useReEntry(phase)
  const isReEntry = isInGrace || isBlending
  const [burnComplete] = useState(false)
  const hourDecimal = hour + minute / 60

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

  // nav items
  const navItems = [
    { label: 'room',     route: '/',        icon: '○', active: true },
    { label: 'cocoon',   route: '/cover',   icon: '◐', active: false },
    { label: 'bridge',   route: '/bridge',  icon: '◑', active: false },
    { label: 'terminal', route: '/terminal', icon: '◒', active: false },
  ]

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Animated.View style={[styles.content, { opacity: entryFade }]} {...pan.panHandlers}>

        {/* ── header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerDot, { color: palette.accent }]}>●</Text>
            <Text style={[styles.headerTitle, { color: palette.accent }]}>KATALEYA</Text>
          </View>
          <Pressable onPress={() => router.push('/terminal')} style={styles.headerRight}>
            <Text style={[styles.headerTerminal, { color: `${palette.accent}80` }]}>TERMINAL</Text>
          </Pressable>
        </View>

        {/* ── phase label ── */}
        <View style={styles.phaseRow}>
          <View style={[styles.phaseLine, { backgroundColor: `${palette.accent}33` }]} />
          <Text style={[styles.phaseLabel, { color: `${palette.accent}99` }]}>
            CIRCADIAN PHASE: {activePhase.toUpperCase()}
          </Text>
          <View style={[styles.phaseLine, { backgroundColor: `${palette.accent}33` }]} />
        </View>

        {/* ── ouroboros ring ── */}
        <View style={[styles.ringWrap, { top: RING_TOP, left: (W - RING_SIZE) / 2 }]}>
          <OuroborosRing phase={activePhase} size={RING_SIZE} hour={hourDecimal} />
        </View>

        {/* ── sphere ── */}
        <View style={[styles.orb, { top: ORB_TOP, left: (W - ORB_SIZE) / 2 }]}>
          <SphereOrbV2
            phase={activePhase}
            size={ORB_SIZE}
            variant="lung"
            onLongPress={handleLongPress}
          />
        </View>

        {/* ── phrase ── */}
        <View style={styles.phrase} pointerEvents="none">
          <TypewriterText
            text={phrase}
            color={accentColor}
            speed={44}
            key={phrase}
          />
        </View>

        {/* ── metrics ── */}
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={[styles.metricLabel, { color: `${palette.rgb}66` }]}>RESONANCE</Text>
            <Text style={[styles.metricValue, { color: palette.accent }]}>98%</Text>
          </View>
          <View style={styles.metric}>
            <Text style={[styles.metricLabel, { color: `${palette.rgb}66` }]}>ENTROPY</Text>
            <Text style={[styles.metricValue, { color: palette.accent }]}>0.04</Text>
          </View>
        </View>

        {/* ── bottom nav ── */}
        <View style={styles.navBar}>
          {navItems.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => {
                if (item.route !== '/') router.push(item.route)
              }}
              style={[
                styles.navItem,
                item.active && { backgroundColor: `${palette.accent}20`, borderColor: `${palette.accent}4d` },
              ]}
            >
              <Text style={[styles.navIcon, { color: item.active ? palette.accent : `${palette.rgb}66` }]}>
                {item.icon}
              </Text>
              <Text style={[styles.navLabel, { color: item.active ? palette.accent : `${palette.rgb}66` }]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── ghost hint ── */}
        <View style={styles.hint} pointerEvents="none">
          <Text style={[styles.hintText, { color: hintColor }]}>
            ← bridge · ↑ cover · hold · engine
          </Text>
        </View>

      </Animated.View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerDot: {
    fontSize: 10,
  },
  headerTitle: {
    fontFamily: 'Courier Prime',
    fontSize: 14,
    letterSpacing: 4,
  },
  headerRight: {
    paddingVertical: 4,
  },
  headerTerminal: {
    fontFamily: 'Courier Prime',
    fontSize: 9,
    letterSpacing: 2,
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 12,
    paddingHorizontal: 48,
    zIndex: 10,
  },
  phaseLine: {
    height: 1,
    flex: 1,
  },
  phaseLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 9,
    letterSpacing: 3,
  },
  ringWrap: {
    position: 'absolute',
    zIndex: 1,
  },
  orb: {
    position: 'absolute',
    zIndex: 5,
  },
  phrase: {
    position: 'absolute',
    top: ORB_TOP + ORB_SIZE + 24,
    left: 44,
    right: 44,
    alignItems: 'center',
  },
  metrics: {
    position: 'absolute',
    bottom: 96,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    zIndex: 10,
  },
  metric: {
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 8,
    letterSpacing: 2,
  },
  metricValue: {
    fontFamily: 'Courier Prime',
    fontSize: 14,
    fontWeight: '700',
  },
  navBar: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  navIcon: {
    fontSize: 10,
  },
  navLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
  hint: {
    position: 'absolute',
    bottom: 16,
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
