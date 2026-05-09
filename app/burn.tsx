// app/burn.tsx
// burn ritual — dissolve a thought into the mercury river.
// tap the thought to ignite → watch it blur and sink.

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
import { SphereOrbV2 } from '../components/sphere-orb-v2'
import { useCircadian } from '../hooks/use-circadian'
import { BASE } from '../constants/palettes'

const { width: W, height: H } = Dimensions.get('window')

const THOUGHTS = [
  "i feel like i am going to fail",
  "the weight of everything",
  "i don't know if i can do this",
  "it would be easier to give up",
  "nobody would notice",
]

export default function BurnScreen() {
  const router = useRouter()
  const { phase, palette } = useCircadian()
  const [thoughtIndex, setThoughtIndex] = useState(0)
  const [burning, setBurning] = useState(false)
  const [done, setDone] = useState(false)

  const blurAnim = useRef(new Animated.Value(0)).current
  const sinkAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(1)).current
  const orbPulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [])

  const ignite = useCallback(() => {
    if (burning || done) return
    setBurning(true)

    Animated.parallel([
      Animated.timing(blurAnim, { toValue: 1, duration: 4000, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.timing(sinkAnim, { toValue: 1, duration: 4000, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 5000, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(() => {
      setDone(true)
      setTimeout(() => {
        setThoughtIndex(i => (i + 1) % THOUGHTS.length)
        blurAnim.setValue(0)
        sinkAnim.setValue(0)
        opacityAnim.setValue(1)
        setBurning(false)
        setDone(false)
      }, 2000)
    })
  }, [burning, done])

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10 || Math.abs(g.dx) > 10,
      onPanResponderRelease: (_, g) => {
        const absDx = Math.abs(g.dx)
        const absDy = Math.abs(g.dy)
        if (absDy > 60 && absDy > absDx * 1.5 && g.dy > 0) {
          router.back()
        }
      },
    })
  ).current

  const textBlur = blurAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] })
  const textSink = sinkAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 100] })
  const orbScale = orbPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] })
  const orbOpacity = orbPulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] })

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.content} {...pan.panHandlers}>

        {/* header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: palette.accent }]}>KATALEYA</Text>
          <Text style={[styles.headerTime, { color: `${palette.rgb}99` }]}>
            {new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')}
          </Text>
        </View>

        {/* sacred geometry rings */}
        <View style={styles.geometry} pointerEvents="none">
          {[1, 0.8, 0.6, 0.4].map((scale, i) => (
            <View
              key={i}
              style={[
                styles.geometryRing,
                {
                  width: W * 0.9 * scale,
                  height: W * 0.9 * scale,
                  borderColor: `${palette.highlight}1a`,
                },
              ]}
            />
          ))}
        </View>

        {/* seed orb */}
        <View style={styles.orbArea}>
          <Animated.View style={{ transform: [{ scale: orbScale }], opacity: orbOpacity }}>
            <SphereOrbV2 phase={phase} size={140} variant="lung" />
          </Animated.View>
          <View style={styles.orbLabel}>
            <Text style={[styles.orbLabelText, { color: `${palette.highlight}cc` }]}>
              stay with me
            </Text>
            <View style={[styles.orbLabelLine, { backgroundColor: `${palette.highlight}99` }]} />
          </View>
        </View>

        {/* text transmutation area */}
        <Pressable onPress={ignite} style={styles.transmuteArea} disabled={burning || done}>
          <Animated.View
            style={[
              styles.dissolvingTextWrap,
              {
                opacity: opacityAnim,
                transform: [{ translateY: textSink }],
              },
            ]}
          >
            <Animated.Text
              style={[
                styles.dissolvingText,
                { color: palette.highlight },
                { textShadowRadius: textBlur },
              ]}
            >
              {THOUGHTS[thoughtIndex]}
            </Animated.Text>
            {/* secondary trail */}
            <Animated.Text
              style={[
                styles.dissolvingTrail,
                { color: palette.highlight, opacity: Animated.multiply(opacityAnim, 0.2) },
                { textShadowRadius: textBlur },
              ]}
            >
              {THOUGHTS[thoughtIndex]}
            </Animated.Text>
          </Animated.View>

          {!burning && !done && (
            <Text style={[styles.hint, { color: `${palette.accent}99` }]}>
              tap to release
            </Text>
          )}
          {burning && !done && (
            <Text style={[styles.hint, { color: `${palette.accent}cc` }]}>
              just intention. release.
            </Text>
          )}
          {done && (
            <Text style={[styles.hint, { color: `${palette.accent}cc` }]}>
              transmuted.
            </Text>
          )}
        </Pressable>

        {/* mercury river */}
        <View style={styles.river} pointerEvents="none">
          <View style={[styles.riverGrad, { backgroundColor: `${palette.shadow}66` }]} />
          <View style={[styles.riverLine, { backgroundColor: `${palette.highlight}1a` }]} />
        </View>

        {/* swipe hint */}
        <View style={styles.swipeHint} pointerEvents="none">
          <Text style={[styles.swipeHintText, { color: `${palette.rgb}33` }]}>
            ↓ swipe down to return
          </Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 12,
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: 'Courier Prime',
    fontSize: 15,
    letterSpacing: 4,
  },
  headerTime: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    letterSpacing: 1,
  },
  geometry: {
    position: 'absolute',
    top: H * 0.22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  geometryRing: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 9999,
    opacity: 0.3,
  },
  orbArea: {
    marginTop: H * 0.16,
    alignItems: 'center',
    zIndex: 5,
  },
  orbLabel: {
    marginTop: 20,
    alignItems: 'center',
    gap: 10,
  },
  orbLabelText: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  orbLabelLine: {
    width: 1,
    height: 28,
  },
  transmuteArea: {
    marginTop: 40,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    zIndex: 5,
    minHeight: 140,
  },
  dissolvingTextWrap: {
    alignItems: 'center',
    gap: 4,
  },
  dissolvingText: {
    fontFamily: 'Courier Prime',
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  dissolvingTrail: {
    fontFamily: 'Courier Prime',
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.5,
    position: 'absolute',
    top: 4,
  },
  hint: {
    marginTop: 24,
    fontFamily: 'Courier Prime',
    fontSize: 10,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  river: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    zIndex: 2,
    pointerEvents: 'none',
  },
  riverGrad: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    opacity: 0.3,
  },
  riverLine: {
    position: 'absolute',
    bottom: 40,
    left: '-10%',
    width: '120%',
    height: 2,
    opacity: 0.4,
  },
  swipeHint: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHintText: {
    fontFamily: 'Courier Prime',
    fontSize: 9,
    letterSpacing: 1.5,
  },
})
