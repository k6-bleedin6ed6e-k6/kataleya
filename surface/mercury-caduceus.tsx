// surface/mercury-caduceus.tsx
// four intertwining helix threads — organic S-curves, fade in on mount

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width, height: h } = Dimensions.get('window');

const AnimatedPath = Animated.createAnimatedComponent(Path);

const DASH   = 20;
const GAP    = 42;
const PERIOD = DASH + GAP;

interface MercuryCaduceusProps {
  phaseColor:    string;
  flowDuration?: number;
}

// Left helix — swings right, left, right
const LEFT_PATH  = `M50 ${h} C 80 ${h * 0.88}, 76 ${h * 0.72}, 50 ${h * 0.57} S 20 ${h * 0.41}, 50 ${h * 0.26} S 80 ${h * 0.10}, 50 0`;
// Right helix — mirror
const RIGHT_PATH = `M50 ${h} C 20 ${h * 0.88}, 24 ${h * 0.72}, 50 ${h * 0.57} S 80 ${h * 0.41}, 50 ${h * 0.26} S 20 ${h * 0.10}, 50 0`;
// Offset faint threads — slightly shifted for depth
const LEFT_FAINT  = `M53 ${h} C 83 ${h * 0.88}, 79 ${h * 0.72}, 53 ${h * 0.57} S 23 ${h * 0.41}, 53 ${h * 0.26} S 83 ${h * 0.10}, 53 0`;
const RIGHT_FAINT = `M47 ${h} C 17 ${h * 0.88}, 21 ${h * 0.72}, 47 ${h * 0.57} S 77 ${h * 0.41}, 47 ${h * 0.26} S 17 ${h * 0.10}, 47 0`;
// Central spine
const SPINE_PATH  = `M50 ${h} L50 0`;

export function MercuryCaduceus({ phaseColor, flowDuration = 7000 }: MercuryCaduceusProps) {
  const flow      = useRef(new Animated.Value(0)).current;
  const mountFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    flow.setValue(0);
    const anim = Animated.loop(
      Animated.timing(flow, {
        toValue: PERIOD, duration: flowDuration,
        easing: Easing.linear, useNativeDriver: false,
      })
    );
    anim.start();

    Animated.timing(mountFade, {
      toValue: 1, duration: 2200,
      easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start();

    return () => anim.stop();
  }, [flowDuration]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: mountFade }]} pointerEvents="none">
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg
          height={h} width={width}
          viewBox={`0 0 100 ${h}`}
          preserveAspectRatio="none"
        >
          <Defs>
            <LinearGradient id="riverGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0"    stopColor={phaseColor} stopOpacity="0.42" />
              <Stop offset="0.28" stopColor={phaseColor} stopOpacity="0.18" />
              <Stop offset="0.58" stopColor={phaseColor} stopOpacity="0.06" />
              <Stop offset="1"    stopColor={phaseColor} stopOpacity="0"    />
            </LinearGradient>
            <LinearGradient id="faintGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0"    stopColor={phaseColor} stopOpacity="0.18" />
              <Stop offset="0.35" stopColor={phaseColor} stopOpacity="0.07" />
              <Stop offset="1"    stopColor={phaseColor} stopOpacity="0"    />
            </LinearGradient>
            <LinearGradient id="spineGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0"    stopColor={phaseColor} stopOpacity="0.16" />
              <Stop offset="0.45" stopColor={phaseColor} stopOpacity="0.04" />
              <Stop offset="1"    stopColor={phaseColor} stopOpacity="0"    />
            </LinearGradient>
          </Defs>

          {/* Faint outer threads — depth layer */}
          <AnimatedPath
            d={LEFT_FAINT}
            stroke="url(#faintGrad)" strokeWidth="1.0" fill="none"
            strokeLinecap="round"
            strokeDasharray={`${DASH} ${GAP}`}
            strokeDashoffset={flow}
          />
          <AnimatedPath
            d={RIGHT_FAINT}
            stroke="url(#faintGrad)" strokeWidth="1.0" fill="none"
            strokeLinecap="round"
            strokeDasharray={`${DASH} ${GAP}`}
            strokeDashoffset={flow}
          />

          {/* Primary helixes */}
          <AnimatedPath
            d={LEFT_PATH}
            stroke="url(#riverGrad)" strokeWidth="1.6" fill="none"
            strokeLinecap="round"
            strokeDasharray={`${DASH} ${GAP}`}
            strokeDashoffset={flow}
          />
          <AnimatedPath
            d={RIGHT_PATH}
            stroke="url(#riverGrad)" strokeWidth="1.6" fill="none"
            strokeLinecap="round"
            strokeDasharray={`${DASH} ${GAP}`}
            strokeDashoffset={flow}
          />

          {/* Central spine */}
          <AnimatedPath
            d={SPINE_PATH}
            stroke="url(#spineGrad)" strokeWidth="0.5" fill="none"
            strokeLinecap="round"
            strokeDasharray={`${DASH} ${GAP}`}
            strokeDashoffset={flow}
          />
        </Svg>
      </View>
    </Animated.View>
  );
}
