// components/atmosphere.tsx
// phase-bleed vignette — edges drink the phase color, not pure black.
// vertical light column suggests bioluminescence rising from below.

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PHASES, BASE, type PhaseKey } from '../constants/palettes';

const bg = BASE.bg;

interface AtmosphereProps {
  phaseColor?: string;   // kept for backward compat — prefer phase prop
  phase?: PhaseKey;      // use this when available for full color family
  heavy?: boolean;
}

export function Atmosphere({ phaseColor, phase, heavy = false }: AtmosphereProps) {
  const palette = phase ? PHASES[phase] : null
  const accent  = palette?.accent  ?? phaseColor ?? '#8090b0'
  const shadow  = palette?.shadow  ?? accent
  const ambient = palette?.ambient ?? bg

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">

      {/* top — phase ambient fog bleeds down from above */}
      <LinearGradient
        colors={[`${ambient}f8`, `${accent}18`, 'transparent']}
        locations={[0, 0.30, 1]}
        style={[styles.edge, styles.top]}
      />

      {/* bottom — phase shadow pools; heavy mode deepens it */}
      <LinearGradient
        colors={['transparent', heavy ? `${shadow}d0` : `${shadow}70`, heavy ? `${bg}ff` : `${bg}c0`]}
        locations={[0, 0.55, 1]}
        style={[styles.edge, heavy ? styles.bottomHeavy : styles.bottom]}
      />

      {/* left edge */}
      <LinearGradient
        colors={[`${ambient}b0`, `${accent}10`, 'transparent']}
        locations={[0, 0.40, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.edge, styles.left]}
      />

      {/* right edge */}
      <LinearGradient
        colors={['transparent', `${accent}10`, `${ambient}b0`]}
        locations={[0, 0.60, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.edge, styles.right]}
      />

      {/* vertical light column — bioluminescence rising from below center */}
      <LinearGradient
        colors={['transparent', `${accent}0c`, `${accent}18`, `${accent}0c`, 'transparent']}
        locations={[0, 0.28, 0.52, 0.76, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.column}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  edge: {
    position: 'absolute',
  },
  top: {
    top: 0, left: 0, right: 0,
    height: '40%',
  },
  bottom: {
    bottom: 0, left: 0, right: 0,
    height: '40%',
  },
  bottomHeavy: {
    bottom: 0, left: 0, right: 0,
    height: '55%',
  },
  left: {
    top: 0, bottom: 0, left: 0,
    width: '22%',
  },
  right: {
    top: 0, bottom: 0, right: 0,
    width: '22%',
  },
  column: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '42%',
    right: '42%',
  },
});
