// components/hud-corners.tsx
// four L-shaped corner brackets — the garden's frame

import React from 'react';
import { View, StyleSheet } from 'react-native';

interface HudCornersProps {
  color: string;
  size?: number;
  thickness?: number;
  inset?: number;
  opacity?: number;
}

export function HudCorners({
  color,
  size = 14,
  thickness = 0.5,
  inset = 20,
  opacity = 0.32,
}: HudCornersProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* top-left */}
      <View style={[styles.corner, { top: inset, left: inset }]}>
        <View style={[styles.arm, { width: thickness, height: size, top: 0, left: 0, backgroundColor: color, opacity }]} />
        <View style={[styles.arm, { height: thickness, width: size, top: 0, left: 0, backgroundColor: color, opacity }]} />
      </View>
      {/* top-right */}
      <View style={[styles.corner, { top: inset, right: inset }]}>
        <View style={[styles.arm, { width: thickness, height: size, top: 0, right: 0, backgroundColor: color, opacity }]} />
        <View style={[styles.arm, { height: thickness, width: size, top: 0, right: 0, backgroundColor: color, opacity }]} />
      </View>
      {/* bottom-left */}
      <View style={[styles.corner, { bottom: inset, left: inset }]}>
        <View style={[styles.arm, { width: thickness, height: size, bottom: 0, left: 0, backgroundColor: color, opacity }]} />
        <View style={[styles.arm, { height: thickness, width: size, bottom: 0, left: 0, backgroundColor: color, opacity }]} />
      </View>
      {/* bottom-right */}
      <View style={[styles.corner, { bottom: inset, right: inset }]}>
        <View style={[styles.arm, { width: thickness, height: size, bottom: 0, right: 0, backgroundColor: color, opacity }]} />
        <View style={[styles.arm, { height: thickness, width: size, bottom: 0, right: 0, backgroundColor: color, opacity }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  corner: {
    position: 'absolute',
    width: 14,
    height: 14,
  },
  arm: {
    position: 'absolute',
  },
});
