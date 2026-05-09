// components/ouroboros-ring.tsx
// the serpent ring — bridge + cover screens only, not the room

import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { type PhaseKey } from '../constants/palettes';

const PHASE_SPEED: Record<PhaseKey, number> = {
  dawn: 14000,
  day: 10000,
  goldenHour: 8000,
  night: 22000,
};

interface OuroborosRingProps {
  size?: number;
  phase: PhaseKey;
  accent: string;
  gapFraction?: number;
  opacity?: number;
}

export function OuroborosRing({
  size = 260,
  phase,
  accent,
  gapFraction = 0.14,
  opacity = 0.62,
}: OuroborosRingProps) {
  const rotate = useRef(new Animated.Value(0)).current;

  const strokeW = 1.8;
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  const gap = gapFraction * circumference;
  const dash = circumference - gap;

  const speed = PHASE_SPEED[phase];

  useEffect(() => {
    rotate.setValue(0);
    const anim = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: speed,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [phase, speed]);

  const rotateDeg = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        transform: [{ rotate: rotateDeg }],
      }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* outer halo */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 7}
          stroke={accent}
          strokeWidth={0.4}
          fill="none"
          opacity={opacity * 0.12}
        />
        {/* main ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={accent}
          strokeWidth={strokeW}
          fill="none"
          strokeDasharray={`${dash.toFixed(1)} ${gap.toFixed(1)}`}
          strokeLinecap="round"
          opacity={opacity}
        />
        {/* inner echo */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius - 6}
          stroke={accent}
          strokeWidth={0.3}
          fill="none"
          opacity={opacity * 0.22}
        />
      </Svg>
    </Animated.View>
  );
}
