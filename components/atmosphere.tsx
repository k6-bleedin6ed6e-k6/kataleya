// components/atmosphere.tsx
// dark edges. that's all.
// the orb is the phase color. the atmosphere just deepens the void around it.

import React from 'react'
import { StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BASE, type PhaseKey } from '../constants/palettes'

const bg = BASE.bg

interface AtmosphereProps {
  phase?: PhaseKey
  phaseColor?: string
  heavy?: boolean
}

export function Atmosphere({ heavy = false }: AtmosphereProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[`${bg}f0`, 'transparent']}
        style={[styles.edge, styles.top]}
      />
      <LinearGradient
        colors={['transparent', heavy ? `${bg}ff` : `${bg}d0`]}
        style={[styles.edge, heavy ? styles.bottomHeavy : styles.bottom]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  edge: { position: 'absolute' },
  top:         { top: 0, left: 0, right: 0, height: '30%' },
  bottom:      { bottom: 0, left: 0, right: 0, height: '35%' },
  bottomHeavy: { bottom: 0, left: 0, right: 0, height: '50%' },
})
