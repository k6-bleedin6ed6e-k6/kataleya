// components/mood-check.tsx
// weather inside — the bridge check-in overlay
// tap a mood label → immediate save to sanctuary → fade out

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
    backgroundColor: BASE.bg + 'f2',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  prompt: {
    fontFamily: 'Courier Prime',
    fontSize: 16,
    color: BASE.text,
    letterSpacing: 2,
    opacity: 0.85,
    marginBottom: 36,
    textTransform: 'lowercase',
  },
  options: {
    alignItems: 'center',
    gap: 18,
  },
  option: {
    fontFamily: 'Courier Prime',
    fontSize: 20,
    color: BASE.textMuted,
    letterSpacing: 4,
    textTransform: 'lowercase',
    opacity: 0.7,
  },
  hint: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: BASE.textMuted,
    letterSpacing: 2,
    opacity: 0.4,
    marginTop: 36,
    textTransform: 'lowercase',
  },
})
