// components/atmosphere.tsx
// phase vignette — top/bottom/left/right edge darkening + phase color wash

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
      {/* Top fade */}
      <LinearGradient
        colors={[`${bg}f2`, 'transparent']}
        style={[styles.edge, styles.top]}
      />
      {/* Bottom fade */}
      <LinearGradient
        colors={['transparent', heavy ? `${bg}ff` : `${bg}d8`]}
        style={[styles.edge, styles.bottom]}
      />
      {/* Left edge */}
      <LinearGradient
        colors={[`${bg}b0`, 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.edge, styles.left]}
      />
      {/* Right edge */}
      <LinearGradient
        colors={['transparent', `${bg}b0`]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.edge, styles.right]}
      />
      {/* Phase color wash */}
      {phaseColor ? (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: phaseColor, opacity: 0.055 }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  edge: {
    position: 'absolute',
  },
  top: {
    top: 0, left: 0, right: 0,
    height: '38%',
  },
  bottom: {
    bottom: 0, left: 0, right: 0,
    height: '38%',
  },
  left: {
    top: 0, bottom: 0, left: 0,
    width: '20%',
  },
  right: {
    top: 0, bottom: 0, right: 0,
    width: '20%',
  },
});
