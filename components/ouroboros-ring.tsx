// components/ouroboros-ring.tsx
// the serpent ring — bridge + cover screens only
// layers: outer halo · main arc · scar notches · head glow · counter-rotating inner arc

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { type PhaseKey } from '../constants/palettes';

const PHASE_SPEED: Record<PhaseKey, number> = {
  dawn:       14000,
  day:        10000,
  goldenHour:  8000,
  night:      22000,
};

// Irregular angular positions (fraction of 2π) for scar notch marks
const NOTCH_FRACTIONS = [0.08, 0.23, 0.45, 0.62, 0.79, 0.91];

interface OuroborosRingProps {
  size?:         number;
  phase:         PhaseKey;
  accent:        string;
  gapFraction?:  number;
  opacity?:      number;
}

export function OuroborosRing({
  size = 260,
  phase,
  accent,
  gapFraction = 0.14,
  opacity = 0.62,
}: OuroborosRingProps) {
  const rotate        = useRef(new Animated.Value(0)).current;
  const rotateInner   = useRef(new Animated.Value(0)).current;

  const strokeW    = 1.8;
  const radius     = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  const gap        = gapFraction * circumference;
  const dash       = circumference - gap;

  const innerR     = radius - 11;
  const innerC     = 2 * Math.PI * innerR;
  const innerDash  = innerC * 0.11;
  const innerGap   = innerC - innerDash;

  const speed = PHASE_SPEED[phase];

  useEffect(() => {
    rotate.setValue(0);
    rotateInner.setValue(0);

    const anim = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1, duration: speed,
        easing: Easing.linear, useNativeDriver: true,
      })
    );
    const animInner = Animated.loop(
      Animated.timing(rotateInner, {
        toValue: 1, duration: speed * 1.85,
        easing: Easing.linear, useNativeDriver: true,
      })
    );

    anim.start();
    animInner.start();
    return () => { anim.stop(); animInner.stop(); };
  }, [phase, speed]);

  const rotateDeg = rotate.interpolate({
    inputRange: [0, 1], outputRange: ['0deg', '360deg'],
  });
  // inner arc counter-rotates
  const rotateInnerDeg = rotateInner.interpolate({
    inputRange: [0, 1], outputRange: ['0deg', '-360deg'],
  });

  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={{ width: size, height: size }}>

      {/* Counter-rotating inner arc */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: rotateInnerDeg }] }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={cx} cy={cy} r={innerR}
            stroke={accent}
            strokeWidth={1.0}
            fill="none"
            strokeDasharray={`${innerDash.toFixed(1)} ${innerGap.toFixed(1)}`}
            strokeLinecap="round"
            opacity={opacity * 0.48}
          />
        </Svg>
      </Animated.View>

      {/* Main ring — outer halo, main arc, scar notches, head glow */}
      <Animated.View style={[{ width: size, height: size }, { transform: [{ rotate: rotateDeg }] }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <RadialGradient
              id="headGlow"
              gradientUnits="userSpaceOnUse"
              cx={cx + radius} cy={cy} r={radius * 0.18}
            >
              <Stop offset="0%"   stopColor={accent} stopOpacity="0.9"  />
              <Stop offset="100%" stopColor={accent} stopOpacity="0"    />
            </RadialGradient>
          </Defs>

          {/* Outer halo */}
          <Circle
            cx={cx} cy={cy} r={radius + 7}
            stroke={accent} strokeWidth={0.4} fill="none"
            opacity={opacity * 0.12}
          />
          {/* Main arc */}
          <Circle
            cx={cx} cy={cy} r={radius}
            stroke={accent} strokeWidth={strokeW} fill="none"
            strokeDasharray={`${dash.toFixed(1)} ${gap.toFixed(1)}`}
            strokeLinecap="round"
            opacity={opacity}
          />
          {/* Inner echo */}
          <Circle
            cx={cx} cy={cy} r={radius - 6}
            stroke={accent} strokeWidth={0.3} fill="none"
            opacity={opacity * 0.22}
          />

          {/* Scar notch marks — abstract irregular ticks on the ring body */}
          {NOTCH_FRACTIONS.map((f, i) => {
            const angle = f * 2 * Math.PI;
            return (
              <Circle
                key={i}
                cx={cx + radius * Math.cos(angle)}
                cy={cy + radius * Math.sin(angle)}
                r={1.3}
                fill={accent}
                fillOpacity={opacity * 0.65}
              />
            );
          })}

          {/* Head glow — bright dot at stroke start (gap end / snake's head) */}
          <Circle
            cx={cx + radius} cy={cy} r={radius * 0.16}
            fill="url(#headGlow)"
          />
          <Circle
            cx={cx + radius} cy={cy} r={2.2}
            fill={accent} fillOpacity={opacity * 0.95}
          />
        </Svg>
      </Animated.View>

    </View>
  );
}
