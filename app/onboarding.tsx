// app/onboarding.tsx
// the awakening ritual — three beats, one session, no second chance to run it wrong
//
// beat 1: sleeping  — void, dim unmoving orb, hold to wake
// beat 2: naming    — void-floating phosphor text, name then winter date
// beat 3: sealing   — 5-second hold, ouroboros gap closes, "we are here now."

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { useRouter } from 'expo-router'
import { setAttunement, setItem, setLastOpen } from '../utils/storage'

const { height: H } = Dimensions.get('window')

const GREEN       = '#33ff33'
const GREEN_DIM   = '#22cc22'
const GREEN_FAINT = '#0d260d'
const ORB_COLOR   = '#d4c5a0'  // warm neutral — adopts phase color at bloom

type Beat = 'sleeping' | 'awakening' | 'naming-name' | 'naming-date' | 'sealing' | 'complete'

// ------------------------------------------------------------------
// ring geometry for seal animation
// ------------------------------------------------------------------
const RING_R      = 90
const RING_CX     = 110
const RING_CY     = 110
const RING_CIRCUM = 2 * Math.PI * RING_R
const GAP_DEG     = 28          // initial gap width (degrees) at 12 o'clock
const SEAL_MS     = 5000

// ------------------------------------------------------------------
// date masking — digits only, formatted as YYYY · MM · DD
// ------------------------------------------------------------------
function maskDate(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 4) return d
  if (d.length <= 6) return `${d.slice(0, 4)} · ${d.slice(4)}`
  return `${d.slice(0, 4)} · ${d.slice(4, 6)} · ${d.slice(6)}`
}

function validateDate(masked: string): Date | null {
  const d = masked.replace(/\D/g, '')
  if (d.length !== 8) return null
  const y = +d.slice(0, 4)
  const m = +d.slice(4, 6) - 1
  const day = +d.slice(6, 8)
  const date = new Date(y, m, day)
  if (date.getFullYear() !== y || date.getMonth() !== m || date.getDate() !== day) return null
  if (date > new Date()) return null  // future dates not allowed
  return date
}

// ------------------------------------------------------------------
// component
// ------------------------------------------------------------------
export default function OnboardingScreen() {
  const router = useRouter()
  const [beat, setBeat] = useState<Beat>('sleeping')
  const [name, setName] = useState('')
  const [dateDigits, setDateDigits] = useState('')
  const [dateMasked, setDateMasked] = useState('')
  const [dateError, setDateError] = useState('')
  const [ringProgress, setRingProgress] = useState(0)
  const [sealed, setSealed] = useState(false)

  // ----------------------------------------------------------------
  // animated values
  // ----------------------------------------------------------------
  const orbOpacity   = useRef(new Animated.Value(0.08)).current  // sleeping: barely there
  const orbScale     = useRef(new Animated.Value(1)).current
  const phraseOpacity = useRef(new Animated.Value(0)).current
  const contentFade  = useRef(new Animated.Value(0)).current

  // ----------------------------------------------------------------
  // beat 1: sleeping — fade in the phrase after the orb settles
  // ----------------------------------------------------------------
  useEffect(() => {
    Animated.sequence([
      Animated.delay(800),
      Animated.timing(phraseOpacity, {
        toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // ----------------------------------------------------------------
  // orb breath — runs during awakening and sealing
  // ----------------------------------------------------------------
  useEffect(() => {
    if (beat !== 'awakening' && beat !== 'sealing') return
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(orbScale, { toValue: 1.10, duration: 5500, useNativeDriver: true }),
        Animated.timing(orbScale, { toValue: 1.00, duration: 5500, useNativeDriver: true }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [beat])

  // ----------------------------------------------------------------
  // beat 1 → 2: long-press wakes the orb, cross-fades to naming
  // ----------------------------------------------------------------
  function triggerAwakening() {
    if (beat !== 'sleeping') return
    setBeat('awakening')
    phraseOpacity.setValue(0)

    Animated.sequence([
      Animated.timing(orbOpacity, {
        toValue: 0.85, duration: 2200, easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
      Animated.delay(600),
      Animated.timing(orbOpacity, {
        toValue: 0.1, duration: 900, useNativeDriver: true,
      }),
    ]).start(() => {
      setBeat('naming-name')
      Animated.timing(contentFade, {
        toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }).start()
    })
  }

  // ----------------------------------------------------------------
  // beat 2a → 2b: name submitted
  // ----------------------------------------------------------------
  function submitName() {
    if (!name.trim()) return
    Keyboard.dismiss()
    // cross-fade to date question
    Animated.sequence([
      Animated.timing(contentFade, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      setBeat('naming-date')
      Animated.timing(contentFade, { toValue: 1, duration: 700, useNativeDriver: true }).start()
    })
  }

  // ----------------------------------------------------------------
  // beat 2b → 3: date submitted
  // ----------------------------------------------------------------
  function submitDate() {
    const valid = validateDate(dateMasked)
    if (!valid) {
      setDateError("that date doesn't exist. try again.")
      return
    }
    Keyboard.dismiss()
    Animated.sequence([
      Animated.timing(contentFade, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      setBeat('sealing')
      orbOpacity.setValue(0)
      Animated.parallel([
        Animated.timing(orbOpacity, { toValue: 0.85, duration: 1200, useNativeDriver: true }),
        Animated.timing(contentFade, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]).start()
    })
  }

  // ----------------------------------------------------------------
  // beat 3: 5-second hold, ring closes from both sides
  // ----------------------------------------------------------------
  const holdRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const holdStart = useRef(0)

  function handleHoldStart() {
    if (sealed || beat !== 'sealing') return
    holdStart.current = Date.now()
    holdRef.current = setInterval(() => {
      const p = Math.min((Date.now() - holdStart.current) / SEAL_MS, 1)
      setRingProgress(p)
      if (p >= 1) {
        clearInterval(holdRef.current!)
        holdRef.current = null
        commitSeal()
      }
    }, 50)
  }

  function handleHoldRelease() {
    if (holdRef.current) { clearInterval(holdRef.current); holdRef.current = null }
    if (!sealed) setRingProgress(0)
  }

  const commitSeal = useCallback(async () => {
    setSealed(true)
    const iso = `${dateDigits.slice(0,4)}-${dateDigits.slice(4,6)}-${dateDigits.slice(6,8)}`
    await Promise.all([
      setAttunement({ name: name.trim(), sobriety_date: iso }),
      setLastOpen(Date.now()),
      setItem('has_seen_onboarding', true),
    ])
    setBeat('complete')
    setTimeout(() => router.replace('/'), 2200)
  }, [name, dateDigits])

  // ----------------------------------------------------------------
  // ring geometry — gap closes from both sides toward 12 o'clock
  // ----------------------------------------------------------------
  const currentGapDeg = GAP_DEG * (1 - ringProgress)
  const filledLen     = RING_CIRCUM * ((360 - currentGapDeg) / 360)
  const gapLen        = RING_CIRCUM * (currentGapDeg / 360)
  const ringRotation  = -90 - currentGapDeg / 2  // keep gap centered at 12

  const showOrb  = beat !== 'naming-name' && beat !== 'naming-date'
  const showRing = beat === 'sealing' || beat === 'complete'
  const showNaming = beat === 'naming-name' || beat === 'naming-date'

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >

      {/* === orb area (beats 1, 3) === */}
      {showOrb && (
        <View style={styles.orbArea}>

          {/* seal ring — gap closes from both sides */}
          {showRing && (
            <Svg width={220} height={220} style={StyleSheet.absoluteFill}>
              {/* faint guide circle */}
              <Circle
                cx={RING_CX} cy={RING_CY} r={RING_R}
                fill="none" stroke={GREEN_FAINT}
                strokeWidth={0.8} strokeOpacity={0.6}
              />
              {/* the closing arc */}
              <Circle
                cx={RING_CX} cy={RING_CY} r={RING_R}
                fill="none" stroke={GREEN_DIM}
                strokeWidth={1.2}
                strokeDasharray={`${filledLen} ${gapLen}`}
                strokeLinecap="round"
                strokeOpacity={0.4 + ringProgress * 0.55}
                rotation={ringRotation}
                origin={`${RING_CX}, ${RING_CY}`}
              />
            </Svg>
          )}

          <Pressable
            onLongPress={beat === 'sleeping' ? triggerAwakening : undefined}
            onPressIn={beat === 'sealing' ? handleHoldStart : undefined}
            onPressOut={beat === 'sealing' ? handleHoldRelease : undefined}
            delayLongPress={400}
            style={styles.orbPressable}
          >
            <Animated.View
              style={[
                styles.orb,
                {
                  opacity: orbOpacity,
                  transform: [{ scale: orbScale }],
                  shadowColor: ORB_COLOR,
                  shadowOpacity: beat === 'sleeping' ? 0 : 0.6,
                  shadowRadius: 32,
                  shadowOffset: { width: 0, height: 0 },
                  backgroundColor: beat === 'complete' ? '#00d4aa' : ORB_COLOR,
                },
              ]}
            />
          </Pressable>
        </View>
      )}

      {/* === beat 1: sleeping phrase === */}
      {beat === 'sleeping' && (
        <Animated.View style={[styles.sleepWrap, { opacity: phraseOpacity }]}>
          <Text style={styles.sleepPhrase}>the garden is sleeping.</Text>
          <Text style={styles.microHint}>hold the seed to wake it</Text>
        </Animated.View>
      )}

      {/* === beat 2: naming (void-floating phosphor) === */}
      {showNaming && (
        <Animated.View style={[styles.namingWrap, { opacity: contentFade }]}>
          {beat === 'naming-name' && (
            <>
              <Text style={styles.question}>who is walking here?</Text>
              <View style={styles.inputRow}>
                <Text style={styles.cursor}>{'>'}</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  onSubmitEditing={submitName}
                  autoFocus
                  returnKeyType="done"
                  selectionColor={GREEN}
                  cursorColor={GREEN}
                  autoCapitalize="words"
                  autoCorrect={false}
                  placeholderTextColor={GREEN_FAINT}
                />
              </View>
              <Text style={styles.microHint}>press return when ready</Text>
            </>
          )}

          {beat === 'naming-date' && (
            <>
              <Text style={styles.question}>
                {`when did your\nwinter begin?`}
              </Text>
              <View style={styles.inputRow}>
                <Text style={styles.cursor}>{'>'}</Text>
                <TextInput
                  style={styles.input}
                  value={dateMasked}
                  onChangeText={(text) => {
                    const digits = text.replace(/\D/g, '').slice(0, 8)
                    setDateDigits(digits)
                    setDateMasked(maskDate(digits))
                    setDateError('')
                  }}
                  onSubmitEditing={submitDate}
                  autoFocus
                  keyboardType="number-pad"
                  returnKeyType="done"
                  placeholder="YYYY · MM · DD"
                  selectionColor={GREEN}
                  cursorColor={GREEN}
                  placeholderTextColor={GREEN_FAINT}
                />
              </View>
              {dateError
                ? <Text style={styles.error}>{dateError}</Text>
                : <Text style={styles.microHint}>press return when ready</Text>
              }
            </>
          )}
        </Animated.View>
      )}

      {/* === beat 3: seal phrase === */}
      {(beat === 'sealing' || beat === 'complete') && (
        <Animated.View style={[styles.sealWrap, { opacity: contentFade }]}>
          {beat === 'complete'
            ? <Text style={styles.sealPhrase}>we are here now.</Text>
            : <Text style={styles.sealPhrase}>
                {ringProgress > 0 ? `${Math.round(ringProgress * 100)}%` : 'hold.'}
              </Text>
          }
          {beat === 'sealing' && (
            <Text style={styles.microHint}>hold the seed to seal</Text>
          )}
        </Animated.View>
      )}

    </KeyboardAvoidingView>
  )
}

// ------------------------------------------------------------------
// styles
// ------------------------------------------------------------------
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbArea: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 52,
  },
  orbPressable: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  sleepWrap: {
    position: 'absolute',
    bottom: H * 0.20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 44,
  },
  sleepPhrase: {
    fontFamily: 'Courier Prime',
    fontSize: 15,
    color: '#22cc22',
    letterSpacing: 0.5,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
  },
  microHint: {
    fontFamily: 'Courier Prime',
    fontSize: 9,
    color: '#22cc22',
    letterSpacing: 2,
    opacity: 0.28,
    textAlign: 'center',
  },
  namingWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 44,
  },
  question: {
    fontFamily: 'Courier Prime',
    fontSize: 15,
    color: '#22cc22',
    letterSpacing: 0.5,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  cursor: {
    fontFamily: 'Courier Prime',
    fontSize: 15,
    color: '#22cc22',
    opacity: 0.5,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'Courier Prime',
    fontSize: 18,
    color: '#33ff33',
    paddingVertical: 6,
    letterSpacing: 1.2,
  },
  error: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    color: '#22cc22',
    opacity: 0.55,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  sealWrap: {
    position: 'absolute',
    bottom: H * 0.16,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 12,
  },
  sealPhrase: {
    fontFamily: 'Courier Prime',
    fontSize: 16,
    color: '#33ff33',
    letterSpacing: 1,
    opacity: 0.9,
    textAlign: 'center',
  },
})
