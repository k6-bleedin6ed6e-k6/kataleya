// components/mood-check.tsx
// weather inside — the bridge check-in overlay
// tap a mood label → immediate save to sanctuary → fade out
// no text input, no submit button — the tap IS the seal

import React, { useEffect, useRef } from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { PHASES, BASE, type PhaseKey } from '../constants/palettes'
import { insertMoodLog, type MoodValue } from '../utils/sanctuary'

const MOODS: { value: MoodValue; label: string }[] = [
  { value: 1, label: 'storm' },
  { value: 2, label: 'rain' },
  { value: 3, label: 'grey' },
  { value: 4, label: 'clear' },
  { value: 5, label: 'sun' },
]

interface Props {
  phase: PhaseKey
  visible: boolean
  onComplete: (mood: MoodValue) => void
}

export function MoodCheck({ phase, visible, onComplete }: Props) {
  const { accent } = PHASES[phase]
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }, [visible])

  function handleMood(mood: MoodValue) {
    insertMoodLog(phase, mood)
    onComplete(mood)
  }

  return (
    <Animated.View
      style={[styles.overlay, { opacity }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Text style={styles.prompt}>weather inside.</Text>

      <View style={styles.options}>
        {MOODS.map(({ value, label }) => (
          <Pressable key={value} onPress={() => handleMood(value)}>
            {({ pressed }) => (
              <Text
                style={[
                  styles.option,
                  pressed && { color: accent, opacity: 1 },
                ]}
              >
                {label}
              </Text>
            )}
          </Pressable>
        ))}
      </View>

      <Text style={styles.hint}>tap to seal.</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BASE.bg + 'f0',  // 94% opacity near-black
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  prompt: {
    fontFamily: 'Courier Prime',
    fontSize: 14,
    color: BASE.text,
    letterSpacing: 2,
    opacity: 0.7,
    marginBottom: 40,
    textTransform: 'lowercase',
  },
  options: {
    alignItems: 'center',
    gap: 20,
  },
  option: {
    fontFamily: 'Courier Prime',
    fontSize: 18,
    color: BASE.textMuted,
    letterSpacing: 4,
    textTransform: 'lowercase',
    opacity: 0.55,
  },
  hint: {
    fontFamily: 'Courier Prime',
    fontSize: 9,
    color: BASE.textMuted,
    letterSpacing: 2,
    opacity: 0.28,
    marginTop: 44,
    textTransform: 'lowercase',
  },
})
