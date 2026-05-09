// surface/mercury-caduceus.tsx
// two mirrored SVG sine paths — the river substrate
// strokeDashoffset animation creates upward flow

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// AnimatedPath lets Animated.Value drive SVG props via the JS thread
const AnimatedPath = Animated.createAnimatedComponent(Path);

const DASH = 20;
const GAP = 40;
const PERIOD = DASH + GAP; // 60 units — one full cycle

interface MercuryCaduceusProps {
  phaseColor: string;
  flowDuration?: number;
}

export function MercuryCaduceus({ phaseColor, flowDuration = 7000 }: MercuryCaduceusProps) {
  const flow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    flow.setValue(0);
    const anim = Animated.loop(
      Animated.timing(flow, {
        toValue: PERIOD,
        duration: flowDuration,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [flowDuration]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg
        height={height}
        width={width}
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id="riverGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={phaseColor} stopOpacity="0.40" />
            <Stop offset="0.35" stopColor={phaseColor} stopOpacity="0.14" />
            <Stop offset="1" stopColor={phaseColor} stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="spineGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={phaseColor} stopOpacity="0.18" />
            <Stop offset="0.5" stopColor={phaseColor} stopOpacity="0.04" />
            <Stop offset="1" stopColor={phaseColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {/* left helix */}
        <AnimatedPath
          d={`M50 ${height} Q 80 700, 50 500 T 50 0`}
          stroke="url(#riverGrad)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${DASH} ${GAP}`}
          strokeDashoffset={flow}
        />
        {/* right helix */}
        <AnimatedPath
          d={`M50 ${height} Q 20 700, 50 500 T 50 0`}
          stroke="url(#riverGrad)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${DASH} ${GAP}`}
          strokeDashoffset={flow}
        />
        {/* central spine */}
        <AnimatedPath
          d={`M50 ${height} L50 0`}
          stroke="url(#spineGrad)"
          strokeWidth="0.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${DASH} ${GAP}`}
          strokeDashoffset={flow}
        />
      </Svg>
    </View>
  );
}
