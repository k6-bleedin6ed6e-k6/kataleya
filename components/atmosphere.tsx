// components/atmosphere.tsx
// phase vignette overlay — pointer-events none, sits above background

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BASE } from '../constants/palettes';

interface AtmosphereProps {
  phaseColor?: string;
  heavy?: boolean;
}

const bg = BASE.bg;

export function Atmosphere({ phaseColor, heavy = false }: AtmosphereProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[`${bg}f0`, 'transparent']}
        style={[styles.edge, styles.top]}
      />
      <LinearGradient
        colors={['transparent', heavy ? `${bg}ff` : `${bg}cc`]}
        style={[styles.edge, styles.bottom]}
      />
      {phaseColor ? (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: phaseColor, opacity: 0.03 }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  edge: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '38%',
  },
  top: { top: 0 },
  bottom: { bottom: 0 },
});
