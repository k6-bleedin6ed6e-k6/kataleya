// app/burn.tsx
// burn ritual — dissolve a thought into the mercury river.
// type → hold → watch it blur and sink.

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SphereOrbV2 } from '../components/sphere-orb-v2'
import { useCircadian } from '../hooks/use-circadian'
import { BASE } from '../constants/palettes'

const { width: W, height: H } = Dimensions.get('window')
const rgba = (rgb: string, a: number) => `rgba(${rgb}, ${a})`

type BurnState = 'idle' | 'typing' | 'holding' | 'dissolving' | 'gone'

export default function BurnScreen() {
  const router = useRouter()
  const { phase, palette } = useCircadian()
  const [text, setText] = useState('')
  const [burnState, setBurnState] = useState<BurnState>('idle')

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

  const startDissolve = useCallback(() => {
    if (!text.trim()) return
    Keyboard.dismiss()
    setBurnState('dissolving')

    Animated.parallel([
      Animated.timing(blurAnim, { toValue: 1, duration: 4000, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.timing(sinkAnim, { toValue: 1, duration: 4000, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 5000, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(() => {
      setBurnState('gone')
      setTimeout(() => {
        setText('')
        blurAnim.setValue(0)
        sinkAnim.setValue(0)
        opacityAnim.setValue(1)
        setBurnState('idle')
      }, 1500)
    })
  }, [text])

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

  const textBlur = blurAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 8] })
  const textSink = sinkAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 120] })
  const orbScale = orbPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] })
  const orbOpacity = orbPulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] })

  const isDissolving = burnState === 'dissolving' || burnState === 'gone'

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.content} {...pan.panHandlers}>

        {/* header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerDot, { color: palette.accent }]}>●</Text>
            <Text style={[styles.headerTitle, { color: palette.accent }]}>KATALEYA</Text>
          </View>
          <Text style={[styles.headerTime, { color: `${palette.rgb}66` }]}>
            {new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')} {new Date().getHours() >= 12 ? 'PM' : 'AM'}
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
            <Text style={[styles.orbLabelText, { color: `${palette.highlight}99` }]}>
              stay with me
            </Text>
            <View style={[styles.orbLabelLine, { backgroundColor: `${palette.highlight}66` }]} />
          </View>
        </View>

        {/* text transmutation area */}
        <View style={styles.transmuteArea}>
          {burnState === 'idle' || burnState === 'typing' ? (
            <>
              <TextInput
                style={[
                  styles.input,
                  { color: palette.highlight, borderColor: `${palette.accent}33` },
                ]}
                value={text}
                onChangeText={setText}
                onFocus={() => setBurnState('typing')}
                onBlur={() => text.trim() ? setBurnState('idle') : setBurnState('idle')}
                placeholder="what needs to dissolve..."
                placeholderTextColor={`${palette.rgb}33`}
                multiline
                maxLength={120}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />
              {text.trim().length > 0 && (
                <Pressable onPress={startDissolve} style={styles.igniteBtn}>
                  <Text style={[styles.igniteText, { color: palette.accent }]}>
                    ignite transmutation
                  </Text>
                </Pressable>
              )}
            </>
          ) : (
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
                {text}
              </Animated.Text>
              {burnState === 'dissolving' && (
                <Text style={[styles.dissolvingHint, { color: `${palette.accent}66` }]}>
                  just intention. release.
                </Text>
              )}
              {burnState === 'gone' && (
                <Text style={[styles.dissolvingHint, { color: `${palette.accent}99` }]}>
                  transmuted.
                </Text>
              )}
            </Animated.View>
          )}
        </View>

        {/* mercury river */}
        <View style={styles.river} pointerEvents="none">
          <View style={[styles.riverGrad, { backgroundColor: `${palette.shadow}66` }]} />
          <View style={[styles.riverLine, { backgroundColor: `${palette.highlight}1a` }]} />
        </View>

        {/* side nav */}
        <View style={styles.sideNav}>
          {[
            { label: 'room', route: '/', icon: '○' },
            { label: 'cocoon', route: '/cover', icon: '◐' },
            { label: 'bridge', route: '/bridge', icon: '◑' },
            { label: 'terminal', route: '/terminal', icon: '◒' },
          ].map((item) => (
            <Pressable
              key={item.label}
              onPress={() => {
                if (item.route === '/burn') return
                router.replace(item.route)
              }}
              style={styles.sideNavItem}
            >
              <Text style={[styles.sideNavIcon, { color: `${palette.highlight}66` }]}>
                {item.icon}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* phase / resonance footer */}
        <View style={styles.footer} pointerEvents="none">
          <View style={styles.footerLine}>
            <View style={[styles.footerDash, { backgroundColor: `${palette.highlight}33` }]} />
            <Text style={[styles.footerText, { color: `${palette.highlight}4d` }]}>
              PHASE: {phase.toUpperCase()} VIGIL
            </Text>
          </View>
          <View style={styles.footerLine}>
            <View style={[styles.footerDash, { backgroundColor: `${palette.highlight}33` }]} />
            <Text style={[styles.footerText, { color: `${palette.highlight}4d` }]}>
              RESONANCE: 98%
            </Text>
          </View>
        </View>

        {/* swipe hint */}
        <View style={styles.hint} pointerEvents="none">
          <Text style={[styles.hintText, { color: `${palette.rgb}12` }]}>
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
  headerTime: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    letterSpacing: 1,
  },
  geometry: {
    position: 'absolute',
    top: H * 0.25,
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
    marginTop: H * 0.18,
    alignItems: 'center',
    zIndex: 5,
  },
  orbLabel: {
    marginTop: 16,
    alignItems: 'center',
    gap: 8,
  },
  orbLabelText: {
    fontFamily: 'Courier Prime',
    fontSize: 9,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  orbLabelLine: {
    width: 1,
    height: 24,
  },
  transmuteArea: {
    marginTop: 32,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    zIndex: 5,
    minHeight: 120,
  },
  input: {
    width: '100%',
    fontFamily: 'Courier Prime',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    borderBottomWidth: 1,
    paddingVertical: 12,
    letterSpacing: 0.5,
  },
  igniteBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1c1c28',
    borderRadius: 20,
  },
  igniteText: {
    fontFamily: 'Courier Prime',
    fontSize: 9,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  dissolvingTextWrap: {
    alignItems: 'center',
    gap: 16,
  },
  dissolvingText: {
    fontFamily: 'Courier Prime',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  dissolvingHint: {
    fontFamily: 'Courier Prime',
    fontSize: 9,
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
  sideNav: {
    position: 'absolute',
    right: 24,
    top: '50%',
    transform: [{ translateY: -80 }],
    gap: 20,
    zIndex: 10,
  },
  sideNavItem: {
    alignItems: 'center',
  },
  sideNavIcon: {
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    gap: 8,
    zIndex: 10,
  },
  footerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerDash: {
    width: 36,
    height: 1,
  },
  footerText: {
    fontFamily: 'Courier Prime',
    fontSize: 8,
    letterSpacing: 3,
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
  },
})
